const express = require('express');
const router = express.Router();
const SustainabilityGoal = require('../models/SustainabilityGoal');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { authenticateToken } = require('../middleware/auth');

// Get user's sustainability goals
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const goals = await SustainabilityGoal.findActiveGoalsForUser(userId);
    
    res.json({
      success: true,
      goals: goals,
      count: goals.length
    });
  } catch (error) {
    console.error('Error fetching sustainability goals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sustainability goals'
    });
  }
});

// Create new sustainability goal
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { goalType, goalConfig, title, description } = req.body;
    
    // Validation
    if (!goalType || !goalConfig || !title) {
      return res.status(400).json({
        success: false,
        error: 'Goal type, configuration, and title are required'
      });
    }
    
    // Validate goal type
    const validGoalTypes = ['grade-based', 'score-based', 'category-based'];
    if (!validGoalTypes.includes(goalType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid goal type. Must be grade-based, score-based, or category-based'
      });
    }
    
    // Validate goal configuration based on type
    if (goalType === 'grade-based' && (!goalConfig.targetGrades || goalConfig.targetGrades.length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'Target grades are required for grade-based goals'
      });
    }
    
    if (goalType === 'score-based' && (goalConfig.minimumScore === undefined || goalConfig.minimumScore < 0 || goalConfig.minimumScore > 100)) {
      return res.status(400).json({
        success: false,
        error: 'Valid minimum score (0-100) is required for score-based goals'
      });
    }
    
    if (goalType === 'category-based' && (!goalConfig.categories || goalConfig.categories.length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'Categories are required for category-based goals'
      });
    }
    
    // Check if user already has 5 active goals (limit)
    const existingGoalsCount = await SustainabilityGoal.countDocuments({ 
      userId, 
      isActive: true 
    });
    
    if (existingGoalsCount >= 5) {
      return res.status(400).json({
        success: false,
        error: 'You can have maximum 5 active goals. Please deactivate some goals first.'
      });
    }
    
    // Create new goal
    const newGoal = new SustainabilityGoal({
      userId,
      goalType,
      goalConfig,
      title: title.trim(),
      description: description ? description.trim() : '',
      isActive: true
    });
    
    await newGoal.save();
    
    res.status(201).json({
      success: true,
      message: 'Sustainability goal created successfully',
      goal: newGoal
    });
    
  } catch (error) {
    console.error('Error creating sustainability goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create sustainability goal'
    });
  }
});

// Update sustainability goal
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    const { goalType, goalConfig, title, description, isActive } = req.body;
    
    // Find the goal and verify ownership
    const goal = await SustainabilityGoal.findOne({ _id: goalId, userId });
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Sustainability goal not found'
      });
    }
    
    // Update fields if provided
    if (goalType) goal.goalType = goalType;
    if (goalConfig) goal.goalConfig = { ...goal.goalConfig, ...goalConfig };
    if (title) goal.title = title.trim();
    if (description !== undefined) goal.description = description.trim();
    if (isActive !== undefined) goal.isActive = isActive;
    
    await goal.save();
    
    res.json({
      success: true,
      message: 'Sustainability goal updated successfully',
      goal: goal
    });
    
  } catch (error) {
    console.error('Error updating sustainability goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update sustainability goal'
    });
  }
});

// Delete sustainability goal
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    
    // Find and delete the goal (verify ownership)
    const deletedGoal = await SustainabilityGoal.findOneAndDelete({ 
      _id: goalId, 
      userId 
    });
    
    if (!deletedGoal) {
      return res.status(404).json({
        success: false,
        error: 'Sustainability goal not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Sustainability goal deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting sustainability goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete sustainability goal'
    });
  }
});

// Get specific goal progress details
router.get('/:id/progress', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    
    // Find the goal and verify ownership
    const goal = await SustainabilityGoal.findOne({ _id: goalId, userId });
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Sustainability goal not found'
      });
    }
    
    // Get user's purchase history to calculate detailed progress
    const orders = await Order.find({ 
      user: userId, 
      paymentStatus: 'paid' 
    }).populate('items.product');
    
    let totalPurchases = 0;
    let goalMetPurchases = 0;
    const recentActivity = [];
    
    orders.forEach(order => {
      order.items.forEach(item => {
        totalPurchases++;
        
        const meetsGoal = goal.doesProductMeetGoal(item.product);
        if (meetsGoal) {
          goalMetPurchases++;
        }
        
        // Track recent activity (last 10 purchases)
        if (recentActivity.length < 10) {
          recentActivity.push({
            productName: item.product.name,
            productGrade: item.product.sustainabilityGrade,
            productScore: item.product.sustainabilityScore,
            category: item.product.category,
            meetsGoal,
            purchaseDate: order.createdAt
          });
        }
      });
    });
    
    // Update goal progress
    goal.updateProgress(totalPurchases, goalMetPurchases);
    await goal.save();
    
    res.json({
      success: true,
      goal: goal,
      detailedProgress: {
        totalPurchases,
        goalMetPurchases,
        currentPercentage: goal.progress.currentPercentage,
        isAchieved: goal.isAchieved,
        progressStatus: goal.progressStatus,
        recentActivity: recentActivity.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
      }
    });
    
  } catch (error) {
    console.error('Error fetching goal progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch goal progress'
    });
  }
});

// Track purchase against all active goals
router.post('/track-purchase', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID is required'
      });
    }
    
    // Get the order with products
    const order = await Order.findOne({ 
      _id: orderId, 
      user: userId 
    }).populate('items.product');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    // Get all active goals for the user
    const activeGoals = await SustainabilityGoal.findActiveGoalsForUser(userId);
    
    if (activeGoals.length === 0) {
      return res.json({
        success: true,
        message: 'No active goals to track against',
        updatedGoals: []
      });
    }
    
    const updatedGoals = [];
    
    // Update progress for each active goal
    for (const goal of activeGoals) {
      // Get all completed orders for this user
      const allOrders = await Order.find({ 
        user: userId, 
        paymentStatus: 'paid' 
      }).populate('items.product');
      
      let totalPurchases = 0;
      let goalMetPurchases = 0;
      
      allOrders.forEach(completedOrder => {
        completedOrder.items.forEach(item => {
          totalPurchases++;
          if (goal.doesProductMeetGoal(item.product)) {
            goalMetPurchases++;
          }
        });
      });
      
      // Update goal progress
      goal.updateProgress(totalPurchases, goalMetPurchases);
      await goal.save();
      
      updatedGoals.push({
        goalId: goal._id,
        title: goal.title,
        previousPercentage: goal.progress.currentPercentage,
        newPercentage: totalPurchases > 0 ? Math.round((goalMetPurchases / totalPurchases) * 100) : 0,
        isAchieved: goal.isAchieved
      });
    }
    
    res.json({
      success: true,
      message: 'Purchase tracked successfully against all active goals',
      updatedGoals
    });
    
  } catch (error) {
    console.error('Error tracking purchase:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track purchase'
    });
  }
});

// Get goal statistics/summary
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const goals = await SustainabilityGoal.find({ userId });
    
    const stats = {
      totalGoals: goals.length,
      activeGoals: goals.filter(goal => goal.isActive).length,
      achievedGoals: goals.filter(goal => goal.isAchieved).length,
      averageProgress: goals.length > 0 
        ? Math.round(goals.reduce((sum, goal) => sum + goal.progress.currentPercentage, 0) / goals.length)
        : 0,
      goalTypes: {
        gradeBased: goals.filter(goal => goal.goalType === 'grade-based').length,
        scoreBased: goals.filter(goal => goal.goalType === 'score-based').length,
        categoryBased: goals.filter(goal => goal.goalType === 'category-based').length
      }
    };
    
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('Error fetching goal stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch goal statistics'
    });
  }
});

module.exports = router;
