/**
 * Dynamic Recommendation Routes
 * Handles real-time recommendation updates based on user interactions
 */

const express = require('express');
const router = express.Router();
const DynamicRecommendationEngine = require('../services/DynamicRecommendationEngine');
const { authenticateToken } = require('../middleware/auth');

// Track user interaction and update recommendations
router.post('/track-interaction', authenticateToken, async (req, res) => {
  try {
    const {
      type, // 'search', 'product_view', 'product_click', 'add_to_cart', 'purchase'
      productId,
      category,
      searchQuery,
      timeSpent = 0,
      metadata = {}
    } = req.body;

    if (!type) {
      return res.status(400).json({ 
        error: 'Interaction type is required' 
      });
    }

    const userId = req.user.id;
    
    const result = await DynamicRecommendationEngine.trackInteraction(userId, {
      type,
      productId,
      category,
      searchQuery,
      timeSpent,
      metadata
    });

    res.json({
      success: true,
      message: 'Interaction tracked and recommendations updated',
      newRecommendations: result.newRecommendations,
      updatedPreferences: result.updatedPreferences,
      engagementScore: result.engagementScore
    });

  } catch (error) {
    console.error('Error tracking interaction:', error);
    res.status(500).json({ error: 'Failed to track interaction' });
  }
});

// Get real-time personalized recommendations
router.get('/real-time-recommendations', authenticateToken, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const userId = req.user.id;

    const recommendations = await DynamicRecommendationEngine.getRealTimeRecommendations(
      userId, 
      parseInt(limit)
    );

    res.json({
      success: true,
      recommendations,
      count: recommendations.length,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error getting real-time recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Get user behavior insights
router.get('/behavior-insights', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const insights = await DynamicRecommendationEngine.getUserBehaviorInsights(userId);

    res.json({
      success: true,
      insights
    });

  } catch (error) {
    console.error('Error getting behavior insights:', error);
    res.status(500).json({ error: 'Failed to get behavior insights' });
  }
});

// Track search with dynamic updates
router.post('/track-search-dynamic', authenticateToken, async (req, res) => {
  try {
    const {
      searchQuery,
      category,
      resultsCount = 0,
      sessionId,
      userAgent
    } = req.body;

    if (!searchQuery) {
      return res.status(400).json({ 
        error: 'Search query is required' 
      });
    }

    const userId = req.user.id;

    // Track the search interaction
    const result = await DynamicRecommendationEngine.trackInteraction(userId, {
      type: 'search',
      searchQuery: searchQuery.trim(),
      category,
      metadata: {
        resultsCount,
        sessionId,
        userAgent
      }
    });

    res.json({
      success: true,
      message: 'Search tracked and recommendations updated',
      newRecommendations: result.newRecommendations,
      engagementScore: result.engagementScore
    });

  } catch (error) {
    console.error('Error tracking search:', error);
    res.status(500).json({ error: 'Failed to track search' });
  }
});

// Track product view with dynamic updates
router.post('/track-product-view', authenticateToken, async (req, res) => {
  try {
    const {
      productId,
      timeSpent = 0,
      source = 'search' // 'search', 'recommendation', 'category', 'direct'
    } = req.body;

    if (!productId) {
      return res.status(400).json({ 
        error: 'Product ID is required' 
      });
    }

    const userId = req.user.id;

    // Get product details for category
    const Product = require('../models/Product');
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Track the product view interaction
    const result = await DynamicRecommendationEngine.trackInteraction(userId, {
      type: 'product_view',
      productId,
      category: product.category,
      timeSpent,
      metadata: {
        source,
        productName: product.name,
        sustainabilityGrade: product.sustainabilityGrade,
        price: product.price
      }
    });

    res.json({
      success: true,
      message: 'Product view tracked and recommendations updated',
      newRecommendations: result.newRecommendations,
      engagementScore: result.engagementScore
    });

  } catch (error) {
    console.error('Error tracking product view:', error);
    res.status(500).json({ error: 'Failed to track product view' });
  }
});

// Track add to cart with dynamic updates
router.post('/track-add-to-cart', authenticateToken, async (req, res) => {
  try {
    const {
      productId,
      quantity = 1,
      source = 'search'
    } = req.body;

    if (!productId) {
      return res.status(400).json({ 
        error: 'Product ID is required' 
      });
    }

    const userId = req.user.id;

    // Get product details for category
    const Product = require('../models/Product');
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Track the add to cart interaction
    const result = await DynamicRecommendationEngine.trackInteraction(userId, {
      type: 'add_to_cart',
      productId,
      category: product.category,
      metadata: {
        source,
        quantity,
        productName: product.name,
        sustainabilityGrade: product.sustainabilityGrade,
        price: product.price
      }
    });

    res.json({
      success: true,
      message: 'Add to cart tracked and recommendations updated',
      newRecommendations: result.newRecommendations,
      engagementScore: result.engagementScore
    });

  } catch (error) {
    console.error('Error tracking add to cart:', error);
    res.status(500).json({ error: 'Failed to track add to cart' });
  }
});

// Get dynamic dashboard data
router.get('/dynamic-dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get real-time recommendations
    const recommendations = await DynamicRecommendationEngine.getRealTimeRecommendations(userId, 20);
    
    // Get behavior insights
    const insights = await DynamicRecommendationEngine.getUserBehaviorInsights(userId);

    res.json({
      success: true,
      dashboard: {
        recommendations,
        insights,
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    console.error('Error getting dynamic dashboard:', error);
    res.status(500).json({ error: 'Failed to get dynamic dashboard' });
  }
});

module.exports = router;
