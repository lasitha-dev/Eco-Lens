const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const UserPreferences = require('../models/UserPreferences');
const User = require('../models/User');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');

// Get survey questions
router.get('/questions', (req, res) => {
  const questions = [
    {
      id: 1,
      question: "What type of products are you most interested in?",
      type: "multi-select",
      options: [
        "Electronics",
        "Fashion & Apparel", 
        "Home & Kitchen",
        "Books & Learning",
        "Beauty & Personal Care",
        "Fitness & Wellness",
        "Gaming",
        "Automotive"
      ],
      required: true
    },
    {
      id: 2,
      question: "What is your preferred shopping frequency?",
      type: "single-select",
      options: [
        "Daily",
        "Weekly", 
        "Occasionally",
        "Only during sales or deals"
      ],
      required: true
    },
    {
      id: 3,
      question: "What best describes your shopping purpose?",
      type: "single-select",
      options: [
        "Personal use",
        "Gifts for others",
        "Business/resale",
        "Browsing for trends"
      ],
      required: true
    },
    {
      id: 4,
      question: "Which price range do you usually prefer?",
      type: "single-select",
      options: [
        "Budget-friendly",
        "Mid-range",
        "Premium / Luxury"
      ],
      required: true
    },
    {
      id: 5,
      question: "Are you interested in receiving personalized deals or offers?",
      type: "boolean",
      options: ["Yes", "No"],
      required: true
    },
    {
      id: 6,
      question: "Which platforms/devices do you usually use to shop?",
      type: "multi-select",
      options: [
        "Mobile",
        "Desktop", 
        "Tablet",
        "All of the above"
      ],
      required: true
    },
    {
      id: 7,
      question: "Would you like to get product suggestions based on trends or your previous activity?",
      type: "single-select",
      options: [
        "Yes, based on trends",
        "Yes, based on my activity",
        "Both",
        "No"
      ],
      required: true
    },
    {
      id: 8,
      question: "Do you prefer eco-friendly or sustainable products?",
      type: "single-select",
      options: [
        "Yes",
        "No preference",
        "Not important to me"
      ],
      required: true
    },
    {
      id: 9,
      question: "Are you interested in new or trending product launches?",
      type: "boolean",
      options: ["Yes", "No"],
      required: true
    },
    {
      id: 10,
      question: "What categories would you like to see on your dashboard first?",
      type: "multi-select",
      options: [
        "Electronics",
        "Fashion",
        "Home & Garden",
        "Food & Beverages",
        "Personal Care",
        "Sports & Outdoors",
        "Books & Stationery",
        "Toys & Games"
      ],
      required: true
    }
  ];

  res.json({ questions });
});

// Check survey completion status
router.get('/status/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const preferences = await UserPreferences.findOne({ userId });
    
    res.json({
      completed: preferences ? preferences.surveyCompleted : false,
      completedAt: preferences ? preferences.completedAt : null
    });
  } catch (error) {
    console.error('Error checking survey status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit survey responses
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Survey submit - User ID:', userId);
    const {
      productInterests,
      shoppingFrequency,
      shoppingPurpose,
      priceRange,
      wantsDeals,
      preferredDevices,
      suggestionType,
      ecoFriendlyPreference,
      interestedInNewProducts,
      dashboardCategories
    } = req.body;

    // Validate required fields
    if (!productInterests || !shoppingFrequency || !shoppingPurpose || !priceRange || !dashboardCategories) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create or update user preferences
    const preferencesData = {
      userId,
      surveyCompleted: true,
      completedAt: new Date(),
      preferences: {
        productInterests,
        shoppingFrequency: shoppingFrequency.toLowerCase().replace(' ', '-'),
        shoppingPurpose: shoppingPurpose.toLowerCase().replace(' ', '-'),
        priceRange: priceRange.toLowerCase().replace(' ', '-'),
        wantsDeals: wantsDeals === 'Yes',
        preferredDevices: preferredDevices.map(device => device.toLowerCase()),
        suggestionType: suggestionType.toLowerCase().replace(' ', '-'),
        ecoFriendlyPreference: ecoFriendlyPreference.toLowerCase().replace(' ', '-'),
        interestedInNewProducts: interestedInNewProducts === 'Yes',
        dashboardCategories
      }
    };

    // Generate personalized recommendations
    const recommendations = await generatePersonalizedRecommendations(preferencesData.preferences);

    preferencesData.aiRecommendations = {
      lastUpdated: new Date(),
      recommendedProducts: recommendations.map(rec => rec._id),
      personalizedFilters: {
        categories: dashboardCategories,
        priceRange: priceRange.toLowerCase().replace(' ', '-'),
        ecoFriendly: ecoFriendlyPreference.toLowerCase().replace(' ', '-') === 'yes'
      },
      engagementScore: 0
    };

    const userPreferences = await UserPreferences.findOneAndUpdate(
      { userId },
      preferencesData,
      { upsert: true, new: true }
    );

    // Update user model to reference preferences
    await User.findByIdAndUpdate(userId, { 
      preferences: userPreferences._id 
    });

    res.json({
      message: 'Survey completed successfully',
      preferences: userPreferences,
      recommendations: recommendations.slice(0, 10) // Return top 10 recommendations
    });

  } catch (error) {
    console.error('Error submitting survey:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get personalized recommendations
router.get('/recommendations/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const preferences = await UserPreferences.findOne({ userId });
    
    if (!preferences || !preferences.surveyCompleted) {
      return res.status(404).json({ error: 'Survey not completed' });
    }

    // Get recommended products
    const recommendedProducts = await Product.find({
      _id: { $in: preferences.aiRecommendations.recommendedProducts }
    }).limit(20);

    res.json({
      recommendations: recommendedProducts,
      preferences: preferences.preferences,
      lastUpdated: preferences.aiRecommendations.lastUpdated
    });

  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update preferences
router.put('/update/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const userPreferences = await UserPreferences.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          'preferences': updates,
          'aiRecommendations.lastUpdated': new Date()
        }
      },
      { new: true }
    );

    if (!userPreferences) {
      return res.status(404).json({ error: 'User preferences not found' });
    }

    // Regenerate recommendations with updated preferences
    const recommendations = await generatePersonalizedRecommendations(userPreferences.preferences);
    
    userPreferences.aiRecommendations.recommendedProducts = recommendations.map(rec => rec._id);
    userPreferences.aiRecommendations.lastUpdated = new Date();
    await userPreferences.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: userPreferences
    });

  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to generate personalized recommendations
async function generatePersonalizedRecommendations(preferences) {
  try {
    let query = { isActive: true };

    // Filter by preferred categories
    if (preferences.dashboardCategories && preferences.dashboardCategories.length > 0) {
      query.category = { $in: preferences.dashboardCategories };
    }

    // Filter by price range
    if (preferences.priceRange === 'budget') {
      query.price = { $lt: 25 };
    } else if (preferences.priceRange === 'mid-range') {
      query.price = { $gte: 25, $lte: 100 };
    } else if (preferences.priceRange === 'premium') {
      query.price = { $gt: 100 };
    }

    // Filter by eco-friendly preference
    if (preferences.ecoFriendlyPreference === 'yes') {
      query.sustainabilityGrade = { $in: ['A', 'B'] };
    }

    // Get products matching preferences
    let products = await Product.find(query);

    // If no products match, get all products
    if (products.length === 0) {
      products = await Product.find({ isActive: true });
    }

    // Calculate recommendation scores
    const scoredProducts = products.map(product => ({
      ...product.toObject(),
      recommendationScore: calculateRecommendationScore(product, preferences)
    }));

    // Sort by recommendation score
    scoredProducts.sort((a, b) => b.recommendationScore - a.recommendationScore);

    return scoredProducts;

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
}

// Calculate recommendation score based on user preferences
function calculateRecommendationScore(product, preferences) {
  let score = 0;

  // Category match (40% weight)
  if (preferences.dashboardCategories && preferences.dashboardCategories.includes(product.category)) {
    score += 40;
  }

  // Price range match (20% weight)
  if (preferences.priceRange === 'budget' && product.price < 25) {
    score += 20;
  } else if (preferences.priceRange === 'mid-range' && product.price >= 25 && product.price <= 100) {
    score += 20;
  } else if (preferences.priceRange === 'premium' && product.price > 100) {
    score += 20;
  }

  // Eco-friendly preference (20% weight)
  if (preferences.ecoFriendlyPreference === 'yes' && ['A', 'B'].includes(product.sustainabilityGrade)) {
    score += 20;
  } else if (preferences.ecoFriendlyPreference === 'no-preference') {
    score += 10; // Neutral score
  }

  // Product interest match (20% weight)
  if (preferences.productInterests && preferences.productInterests.some(interest => 
    product.category.toLowerCase().includes(interest.toLowerCase().split(' ')[0])
  )) {
    score += 20;
  }

  return Math.min(score, 100);
}

module.exports = router;
