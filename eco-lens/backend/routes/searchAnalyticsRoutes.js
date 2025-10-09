const express = require('express');
const router = express.Router();
const SearchHistory = require('../models/SearchHistory');
const Product = require('../models/Product');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Track search query
router.post('/track-search', authenticateToken, async (req, res) => {
  try {
    const {
      searchQuery,
      searchType = 'general',
      category,
      filters = {},
      resultsCount = 0,
      sessionId,
      userAgent
    } = req.body;

    if (!searchQuery || !sessionId) {
      return res.status(400).json({ 
        error: 'Search query and session ID are required' 
      });
    }

    const searchHistory = new SearchHistory({
      userId: req.user.id,
      searchQuery: searchQuery.trim(),
      searchType,
      category,
      filters,
      resultsCount,
      sessionId,
      userAgent
    });

    await searchHistory.save();

    res.json({
      success: true,
      message: 'Search tracked successfully',
      searchId: searchHistory._id
    });

  } catch (error) {
    console.error('Error tracking search:', error);
    res.status(500).json({ error: 'Failed to track search' });
  }
});

// Track product click from search
router.post('/track-click', authenticateToken, async (req, res) => {
  try {
    const {
      searchId,
      productId,
      timeSpent = 0
    } = req.body;

    if (!searchId || !productId) {
      return res.status(400).json({ 
        error: 'Search ID and product ID are required' 
      });
    }

    const searchHistory = await SearchHistory.findOne({
      _id: searchId,
      userId: req.user.id
    });

    if (!searchHistory) {
      return res.status(404).json({ error: 'Search history not found' });
    }

    // Add or update clicked product
    const existingClick = searchHistory.clickedProducts.find(
      click => click.productId.toString() === productId
    );

    if (existingClick) {
      existingClick.timeSpent += timeSpent;
      existingClick.clickedAt = new Date();
    } else {
      searchHistory.clickedProducts.push({
        productId,
        timeSpent,
        clickedAt: new Date()
      });
    }

    await searchHistory.save();

    res.json({
      success: true,
      message: 'Product click tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking product click:', error);
    res.status(500).json({ error: 'Failed to track product click' });
  }
});

// Get user search patterns and analytics
router.get('/patterns', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.user.id;

    const patterns = await SearchHistory.getUserSearchPatterns(userId, parseInt(days));

    // Calculate material and brand frequencies
    const materialFrequency = {};
    const brandFrequency = {};

    patterns.allMaterials.forEach(material => {
      if (material) {
        materialFrequency[material] = (materialFrequency[material] || 0) + 1;
      }
    });

    patterns.allBrands.forEach(brand => {
      if (brand) {
        brandFrequency[brand] = (brandFrequency[brand] || 0) + 1;
      }
    });

    // Get top materials and brands
    const topMaterials = Object.entries(materialFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([material, count]) => ({ material, count }));

    const topBrands = Object.entries(brandFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([brand, count]) => ({ brand, count }));

    res.json({
      success: true,
      patterns: {
        ...patterns,
        topMaterials,
        topBrands,
        analysisPeriod: `${days} days`
      }
    });

  } catch (error) {
    console.error('Error getting search patterns:', error);
    res.status(500).json({ error: 'Failed to get search patterns' });
  }
});

// Get personalized recommendations based on search history
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const { limit = 20, days = 30 } = req.query;
    const userId = req.user.id;

    // Get user search patterns
    const patterns = await SearchHistory.getUserSearchPatterns(userId, parseInt(days));

    if (patterns.totalSearches === 0) {
      // No search history, return diverse general recommendations with multiple categories
      const popularCategories = ['Electronics', 'Fashion', 'Home & Garden', 'Personal Care', 'Sports & Outdoors'];
      const generalProducts = await Product.find({ 
        isActive: true,
        category: { $in: popularCategories }
      })
        .sort({ sustainabilityScore: -1, rating: -1 })
        .limit(parseInt(limit));

      return res.json({
        success: true,
        recommendations: generalProducts,
        source: 'general',
        message: 'No search history found, showing diverse general recommendations',
        patterns: {
          totalSearches: 0,
          topCategories: popularCategories.slice(0, 3).map(cat => [cat, 0]),
          topMaterials: [],
          topBrands: [],
          recentSearches: []
        }
      });
    }

    // Build dynamic query based on search patterns
    const query = { isActive: true };
    const sortOptions = {};

    // Category preferences (most searched categories get higher weight)
    const categoryEntries = Object.entries(patterns.categoryFrequency);
    if (categoryEntries.length > 0) {
      // Sort categories by frequency and get top categories
      const sortedCategories = categoryEntries.sort(([,a], [,b]) => b - a);
      
      // Always show minimum 3 categories for professional dashboard
      const topCategories = sortedCategories.slice(0, 3).map(([category]) => category);
      
      // If user has searched fewer than 3 categories, fill with popular categories
      if (topCategories.length < 3) {
        const popularCategories = ['Electronics', 'Fashion', 'Home & Garden', 'Personal Care', 'Sports & Outdoors'];
        const additionalCategories = popularCategories.filter(cat => !topCategories.includes(cat));
        topCategories.push(...additionalCategories.slice(0, 3 - topCategories.length));
      }
      
      console.log(`🎯 Using ${topCategories.length} categories for personalized recommendations:`, topCategories);
      query.category = { $in: topCategories };
    }

    // Sustainability grade preferences
    const gradeEntries = Object.entries(patterns.sustainabilityGradeFrequency);
    if (gradeEntries.length > 0) {
      const topGrade = gradeEntries.sort(([,a], [,b]) => b - a)[0][0];
      query.sustainabilityGrade = topGrade;
    }

    // Material preferences (if any)
    const materialCounts = {};
    patterns.allMaterials.forEach(material => {
      if (material) {
        materialCounts[material] = (materialCounts[material] || 0) + 1;
      }
    });
    const topMaterials = Object.entries(materialCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([material, count]) => ({ material, count }));

    if (topMaterials.length > 0) {
      // This would require a more complex query if materials were stored in products
      // For now, we'll use it for sorting
    }

    // Brand preferences (if any)
    const brandCounts = {};
    patterns.allBrands.forEach(brand => {
      if (brand) {
        brandCounts[brand] = (brandCounts[brand] || 0) + 1;
      }
    });
    const topBrands = Object.entries(brandCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([brand, count]) => ({ brand, count }));

    if (topBrands.length > 0) {
      // This would require brand field in products
    }

    // Dynamic sorting based on search patterns
    if (patterns.searchTypeFrequency.product > patterns.searchTypeFrequency.category) {
      // User searches for specific products, prioritize sustainability
      sortOptions.sustainabilityScore = -1;
      sortOptions.rating = -1;
    } else {
      // User browses categories, prioritize popularity
      sortOptions.reviewCount = -1;
      sortOptions.sustainabilityScore = -1;
    }

    // Get recommendations
    const recommendations = await Product.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit));

    // Calculate recommendation confidence score
    const confidenceScore = Math.min(95, Math.max(20, 
      (patterns.totalSearches / 10) * 20 + 
      (Object.keys(patterns.categoryFrequency).length * 5) +
      (topMaterials.length * 3)
    ));

    res.json({
      success: true,
      recommendations,
      source: 'search_history',
      confidenceScore: Math.round(confidenceScore),
      patterns: {
        totalSearches: patterns.totalSearches,
        topCategories: Object.entries(patterns.categoryFrequency)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3),
        topMaterials: topMaterials.slice(0, 3),
        topBrands: topBrands.slice(0, 3),
        recentSearches: patterns.recentSearches.slice(0, 5)
      }
    });

  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Get search analytics dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    // Get user search patterns
    const patterns = await SearchHistory.getUserSearchPatterns(userId, parseInt(days));

    // Get trending searches globally
    const trendingSearches = await SearchHistory.getTrendingSearches(7, 10);

    // Calculate search insights
    const insights = {
      totalSearches: patterns.totalSearches,
      mostSearchedCategory: Object.entries(patterns.categoryFrequency)
        .sort(([,a], [,b]) => b - a)[0] || null,
      preferredSustainabilityGrade: Object.entries(patterns.sustainabilityGradeFrequency)
        .sort(([,a], [,b]) => b - a)[0] || null,
      searchFrequency: patterns.totalSearches / parseInt(days),
      diversityScore: Object.keys(patterns.categoryFrequency).length,
      recentActivity: patterns.recentSearches.slice(0, 10)
    };

    // Process materials and brands to get top ones
    const materialCounts = {};
    patterns.allMaterials.forEach(material => {
      materialCounts[material] = (materialCounts[material] || 0) + 1;
    });
    const topMaterials = Object.entries(materialCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([material, count]) => ({ material, count }));

    const brandCounts = {};
    patterns.allBrands.forEach(brand => {
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    });
    const topBrands = Object.entries(brandCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([brand, count]) => ({ brand, count }));

    res.json({
      success: true,
      insights,
      patterns: {
        categories: patterns.categoryFrequency,
        searchTypes: patterns.searchTypeFrequency,
        sustainabilityGrades: patterns.sustainabilityGradeFrequency,
        topMaterials,
        topBrands
      },
      trendingSearches,
      analysisPeriod: `${days} days`
    });

  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

// Get search suggestions based on user history
router.get('/suggestions', authenticateToken, async (req, res) => {
  try {
    const { query: searchQuery, limit = 5 } = req.query;
    const userId = req.user.id;

    if (!searchQuery || searchQuery.length < 2) {
      return res.json({
        success: true,
        suggestions: []
      });
    }

    // Get user's recent searches that match the query
    const userSuggestions = await SearchHistory.find({
      userId,
      searchQuery: { $regex: searchQuery, $options: 'i' }
    })
    .sort({ timestamp: -1 })
    .limit(parseInt(limit))
    .select('searchQuery category searchType timestamp');

    // Get trending searches that match the query
    const trendingSuggestions = await SearchHistory.aggregate([
      {
        $match: {
          searchQuery: { $regex: searchQuery, $options: 'i' },
          timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        }
      },
      {
        $group: {
          _id: '$searchQuery',
          count: { $sum: 1 },
          category: { $first: '$category' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    // Combine and deduplicate suggestions
    const allSuggestions = [
      ...userSuggestions.map(s => ({
        query: s.searchQuery,
        category: s.category,
        type: 'user_history',
        timestamp: s.timestamp
      })),
      ...trendingSuggestions.map(s => ({
        query: s._id,
        category: s.category,
        type: 'trending',
        popularity: s.count
      }))
    ];

    // Remove duplicates and sort by relevance
    const uniqueSuggestions = allSuggestions.reduce((acc, current) => {
      const existing = acc.find(item => item.query === current.query);
      if (!existing) {
        acc.push(current);
      } else if (current.type === 'user_history' && existing.type === 'trending') {
        // Prioritize user history over trending
        const index = acc.indexOf(existing);
        acc[index] = current;
      }
      return acc;
    }, []);

    res.json({
      success: true,
      suggestions: uniqueSuggestions.slice(0, parseInt(limit))
    });

  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// Clear user search history
router.delete('/clear-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { days } = req.body; // Optional: clear only recent history

    let query = { userId };
    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      query.timestamp = { $gte: cutoffDate };
    }

    const result = await SearchHistory.deleteMany(query);

    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} search records`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error clearing search history:', error);
    res.status(500).json({ error: 'Failed to clear search history' });
  }
});

module.exports = router;
