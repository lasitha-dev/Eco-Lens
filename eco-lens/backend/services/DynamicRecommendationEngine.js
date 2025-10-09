/**
 * Dynamic Recommendation Engine
 * Updates personalized recommendations in real-time based on user interactions
 */

const mongoose = require('mongoose');
const UserPreferences = require('../models/UserPreferences');
const SearchHistory = require('../models/SearchHistory');
const Product = require('../models/Product');

class DynamicRecommendationEngine {
  constructor() {
    this.interactionWeights = {
      search: 1.0,
      product_view: 2.0,
      product_click: 3.0,
      add_to_cart: 5.0,
      purchase: 10.0
    };
    
    this.timeDecayFactor = 0.1; // How much older interactions decay
    this.maxHistoryDays = 90; // Maximum days to consider for recommendations
  }

  /**
   * Track user interaction and update recommendations dynamically
   */
  async trackInteraction(userId, interaction) {
    try {
      const {
        type, // 'search', 'product_view', 'product_click', 'add_to_cart', 'purchase'
        productId,
        category,
        searchQuery,
        timeSpent = 0,
        metadata = {}
      } = interaction;

      console.log(`🔄 Tracking interaction: ${type} for user ${userId}`);

      // Get or create user preferences
      let userPrefs = await UserPreferences.findOne({ userId });
      if (!userPrefs) {
        userPrefs = new UserPreferences({
          userId,
          preferences: {},
          aiRecommendations: {
            personalizedFilters: {},
            recommendedProducts: [],
            engagementScore: 0,
            lastUpdated: new Date()
          }
        });
      }

      // Update preferences based on interaction
      await this.updatePreferencesFromInteraction(userPrefs, interaction);

      // Update AI recommendations
      await this.updateAIRecommendations(userPrefs, interaction);

      // Clean preferences to ensure they match schema enums before saving
      await this.cleanPreferencesForSchema(userPrefs);

      // Save updated preferences
      await userPrefs.save();

      // Refresh user preferences from database to ensure we have the latest data
      const refreshedUserPrefs = await UserPreferences.findOne({ userId });
      if (refreshedUserPrefs) {
        userPrefs = refreshedUserPrefs;
      }

      // Generate new personalized recommendations
      const newRecommendations = await this.generateDynamicRecommendations(userId, userPrefs);

      console.log(`✅ Successfully tracked ${type} interaction for user ${userId}`);
      console.log(`📊 Updated dashboard categories: ${userPrefs.aiRecommendations.personalizedFilters.dashboardCategories?.join(', ') || 'none'}`);
      console.log(`🎯 Updated sustainability grades: ${userPrefs.aiRecommendations.personalizedFilters.sustainabilityGrades?.join(', ') || 'none'}`);
      console.log(`💰 Updated price ranges: ${userPrefs.aiRecommendations.personalizedFilters.priceRanges?.join(', ') || 'none'}`);
      console.log(`📈 Total recent interactions: ${userPrefs.aiRecommendations.recentInteractions?.length || 0}`);
      console.log(`🎯 Generated ${newRecommendations.length} new personalized recommendations`);
      console.log(`✅ Updated recommendations for user ${userId} based on ${type} interaction`);

      return {
        success: true,
        newRecommendations,
        updatedPreferences: userPrefs.preferences,
        engagementScore: userPrefs.aiRecommendations.engagementScore
      };

    } catch (error) {
      console.error('Error tracking interaction:', error);
      throw error;
    }
  }

  /**
   * Update user preferences based on interaction
   */
  async updatePreferencesFromInteraction(userPrefs, interaction) {
    const { type, productId, category, searchQuery } = interaction;

    // Initialize preferences if not exists
    if (!userPrefs.preferences) {
      userPrefs.preferences = {};
    }

    // Update category preferences
    if (category) {
      if (!userPrefs.preferences.categoryFrequency) {
        userPrefs.preferences.categoryFrequency = {};
      }
      userPrefs.preferences.categoryFrequency[category] = 
        (userPrefs.preferences.categoryFrequency[category] || 0) + this.interactionWeights[type];
    }

    // Update search preferences
    if (searchQuery) {
      if (!userPrefs.preferences.searchHistory) {
        userPrefs.preferences.searchHistory = [];
      }
      
      // Add search query with timestamp and weight
      userPrefs.preferences.searchHistory.push({
        query: searchQuery,
        timestamp: new Date(),
        weight: this.interactionWeights[type],
        category: category
      });

      // Keep only recent searches (last 50)
      userPrefs.preferences.searchHistory = userPrefs.preferences.searchHistory
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 50);
    }

    // Update product interaction history
    if (productId) {
      if (!userPrefs.preferences.productInteractions) {
        userPrefs.preferences.productInteractions = [];
      }

      // Add or update product interaction
      const existingInteraction = userPrefs.preferences.productInteractions.find(
        p => p.productId.toString() === productId.toString()
      );

      if (existingInteraction) {
        existingInteraction.interactionCount += 1;
        existingInteraction.lastInteraction = new Date();
        existingInteraction.interactionTypes.push(type);
      } else {
        userPrefs.preferences.productInteractions.push({
          productId,
          interactionCount: 1,
          firstInteraction: new Date(),
          lastInteraction: new Date(),
          interactionTypes: [type],
          category: category
        });
      }

      // Keep only recent interactions (last 100)
      userPrefs.preferences.productInteractions = userPrefs.preferences.productInteractions
        .sort((a, b) => b.lastInteraction - a.lastInteraction)
        .slice(0, 100);
    }

    // Update dashboard categories dynamically
    await this.updateDashboardCategories(userPrefs);
  }

  /**
   * Update AI recommendations based on interaction
   */
  async updateAIRecommendations(userPrefs, interaction) {
    const { type, productId, category } = interaction;

    // Initialize AI recommendations if not exists
    if (!userPrefs.aiRecommendations) {
      userPrefs.aiRecommendations = {
        personalizedFilters: {},
        recommendedProducts: [],
        engagementScore: 0,
        lastUpdated: new Date()
      };
    }

    // Update engagement score
    userPrefs.aiRecommendations.engagementScore += this.interactionWeights[type] * 0.1;
    userPrefs.aiRecommendations.engagementScore = Math.min(userPrefs.aiRecommendations.engagementScore, 100);

    // Update personalized filters
    if (category) {
      if (!userPrefs.aiRecommendations.personalizedFilters.categoryWeights) {
        userPrefs.aiRecommendations.personalizedFilters.categoryWeights = {};
      }
      
      userPrefs.aiRecommendations.personalizedFilters.categoryWeights[category] = 
        (userPrefs.aiRecommendations.personalizedFilters.categoryWeights[category] || 0) + this.interactionWeights[type];
    }

    // Update last updated timestamp
    userPrefs.aiRecommendations.lastUpdated = new Date();
  }

  /**
   * Clean preferences to ensure they match schema enums
   */
  async cleanPreferencesForSchema(userPrefs) {
    if (!userPrefs.preferences) {
      return;
    }

    // Clean shoppingPurpose - map invalid values to valid ones
    if (userPrefs.preferences.shoppingPurpose) {
      const validShoppingPurposes = ['personal', 'Personal use', 'gifts', 'business', 'browsing'];
      if (!validShoppingPurposes.includes(userPrefs.preferences.shoppingPurpose)) {
        // Map common invalid values to valid ones
        const purposeMapping = {
          'personal-use': 'personal',
          'personal_use': 'personal',
          'Personal use': 'Personal use'
        };
        userPrefs.preferences.shoppingPurpose = purposeMapping[userPrefs.preferences.shoppingPurpose] || 'personal';
      }
    }

    // Clean priceRange - map invalid values to valid ones
    if (userPrefs.preferences.priceRange) {
      const validPriceRanges = ['budget', 'Budget-friendly', 'mid-range', 'Mid-range', 'premium', 'Premium'];
      if (!validPriceRanges.includes(userPrefs.preferences.priceRange)) {
        // Map common invalid values to valid ones
        const priceMapping = {
          'budget-friendly': 'Budget-friendly',
          'budget_friendly': 'Budget-friendly',
          'mid-range': 'Mid-range',
          'mid_range': 'Mid-range',
          'premium': 'Premium'
        };
        userPrefs.preferences.priceRange = priceMapping[userPrefs.preferences.priceRange] || 'Mid-range';
      }
    }

    // Clean shoppingFrequency
    if (userPrefs.preferences.shoppingFrequency) {
      const validFrequencies = ['daily', 'weekly', 'occasionally', 'Occasionally', 'sales-only'];
      if (!validFrequencies.includes(userPrefs.preferences.shoppingFrequency)) {
        userPrefs.preferences.shoppingFrequency = 'Occasionally';
      }
    }

    // Clean suggestionType
    if (userPrefs.preferences.suggestionType) {
      const validSuggestionTypes = ['trends', 'activity', 'both', 'Both', 'yes,-based on trends', 'none'];
      if (!validSuggestionTypes.includes(userPrefs.preferences.suggestionType)) {
        userPrefs.preferences.suggestionType = 'Both';
      }
    }

    console.log('🧹 Cleaned preferences to match schema enums');
  }

  /**
   * Update dashboard categories based on user behavior
   */
  async updateDashboardCategories(userPrefs) {
    if (!userPrefs.preferences.categoryFrequency) {
      return;
    }

    // Valid dashboard categories from schema
    const validCategories = [
      'Electronics',
      'Fashion',
      'Home & Garden',
      'Food & Beverages',
      'Personal Care',
      'Sports & Outdoors',
      'Books & Stationery',
      'Toys & Games'
    ];

    // Get top 3 categories by frequency, but only include valid ones
    const topCategories = Object.entries(userPrefs.preferences.categoryFrequency)
      .filter(([category]) => validCategories.includes(category))
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    // Update dashboard categories only with valid enum values
    userPrefs.preferences.dashboardCategories = topCategories;

    console.log(`📊 Updated dashboard categories for user: ${topCategories.join(', ')}`);
  }

  /**
   * Generate dynamic recommendations based on current user behavior
   */
  async generateDynamicRecommendations(userId, userPrefs, limit = 20) {
    try {
      console.log(`🎯 Generating dynamic recommendations for user ${userId}`);
      
      // Get user's interaction patterns
      const categoryWeights = userPrefs.aiRecommendations?.personalizedFilters?.categoryWeights || {};
      const productInteractions = userPrefs.preferences?.productInteractions || [];
      const searchHistory = userPrefs.preferences?.searchHistory || [];
      const categoryFrequency = userPrefs.preferences?.categoryFrequency || {};

      console.log(`📊 User interaction data:`, {
        categoryWeights: Object.keys(categoryWeights).length,
        productInteractions: productInteractions.length,
        searchHistory: searchHistory.length,
        categoryFrequency: Object.keys(categoryFrequency).length
      });

      // Build dynamic query
      const query = { isActive: true };
      const sortOptions = {};

      // PRIORITY 1: Use survey preferences if available
      if (userPrefs.preferences && userPrefs.surveyCompleted) {
        console.log(`📋 Using survey preferences for user ${userId}:`, {
          dashboardCategories: userPrefs.preferences.dashboardCategories,
          priceRange: userPrefs.preferences.priceRange,
          ecoFriendlyPreference: userPrefs.preferences.ecoFriendlyPreference
        });

        // Apply survey category preferences
        if (userPrefs.preferences.dashboardCategories && userPrefs.preferences.dashboardCategories.length > 0) {
          query.category = { $in: userPrefs.preferences.dashboardCategories };
        }

        // Apply survey price preferences
        if (userPrefs.preferences.priceRange) {
          if (userPrefs.preferences.priceRange === 'budget' || userPrefs.preferences.priceRange === 'Budget-friendly') {
            query.price = { $lt: 25 };
          } else if (userPrefs.preferences.priceRange === 'mid-range' || userPrefs.preferences.priceRange === 'Mid-range') {
            query.price = { $gte: 25, $lte: 100 };
          } else if (userPrefs.preferences.priceRange === 'premium' || userPrefs.preferences.priceRange === 'Premium') {
            query.price = { $gt: 100 };
          }
        }

        // Apply survey eco-friendly preferences
        if (userPrefs.preferences.ecoFriendlyPreference === 'yes') {
          query.sustainabilityGrade = { $in: ['A', 'B'] };
        }
      }

      // PRIORITY 2: Override with interaction-based preferences if user has significant interaction history
      const hasSignificantInteractions = productInteractions.length > 5 || searchHistory.length > 3;
      
      if (hasSignificantInteractions) {
        console.log(`🔄 User ${userId} has significant interactions, applying behavior-based preferences`);
        
        // Apply category preferences from both AI recommendations and direct frequency tracking
        const allCategoryWeights = { ...categoryWeights, ...categoryFrequency };
        
        if (Object.keys(allCategoryWeights).length > 0) {
          const topCategories = Object.entries(allCategoryWeights)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([category]) => category);

          console.log(`🏆 Top categories for user ${userId}:`, topCategories);

          if (topCategories.length > 0) {
            query.category = { $in: topCategories };
          }
        }

        // Apply sustainability preferences based on interaction history
        const sustainabilityPreference = await this.inferSustainabilityPreference(productInteractions);
        if (sustainabilityPreference) {
          query.sustainabilityGrade = sustainabilityPreference;
        }

        // Apply price preferences based on interaction history
        const pricePreference = await this.inferPricePreference(productInteractions);
        if (pricePreference) {
          query.price = pricePreference;
        }
      }

      // Get products matching dynamic criteria
      let products = await Product.find(query).limit(limit * 2);
      
      console.log(`🔍 Found ${products.length} products matching user preferences for user ${userId}`);

      // If no products match, get general recommendations
      if (products.length === 0) {
        console.log(`⚠️ No products match user preferences, using general recommendations for user ${userId}`);
        products = await Product.find({ isActive: true })
          .sort({ sustainabilityScore: -1, rating: -1 })
          .limit(limit * 2);
      }

      // Calculate dynamic recommendation scores
      const scoredProducts = products.map(product => ({
        ...product.toObject(),
        recommendationScore: this.calculateDynamicScore(product, userPrefs, {
          categoryWeights,
          productInteractions,
          searchHistory
        })
      }));

      // Sort by recommendation score
      scoredProducts.sort((a, b) => b.recommendationScore - a.recommendationScore);

      // Return top recommendations
      return scoredProducts.slice(0, limit);

    } catch (error) {
      console.error('Error generating dynamic recommendations:', error);
      return [];
    }
  }

  /**
   * Calculate dynamic recommendation score
   */
  calculateDynamicScore(product, userPrefs, patterns) {
    let score = 0;
    const { categoryWeights, productInteractions, searchHistory } = patterns;

    // Base score from product rating and sustainability
    score += (product.rating || 0) * 10;
    score += (product.sustainabilityScore || 0) * 0.5;

    // SURVEY PREFERENCES SCORING (High Priority)
    if (userPrefs.preferences && userPrefs.surveyCompleted) {
      // Category match from survey (40% weight)
      if (userPrefs.preferences.dashboardCategories && 
          userPrefs.preferences.dashboardCategories.includes(product.category)) {
        score += 40;
      }

      // Price range match from survey (20% weight)
      if (userPrefs.preferences.priceRange) {
        if (userPrefs.preferences.priceRange === 'budget' && product.price < 25) {
          score += 20;
        } else if (userPrefs.preferences.priceRange === 'mid-range' && 
                   product.price >= 25 && product.price <= 100) {
          score += 20;
        } else if (userPrefs.preferences.priceRange === 'premium' && product.price > 100) {
          score += 20;
        }
      }

      // Eco-friendly preference from survey (20% weight)
      if (userPrefs.preferences.ecoFriendlyPreference === 'yes' && 
          ['A', 'B'].includes(product.sustainabilityGrade)) {
        score += 20;
      } else if (userPrefs.preferences.ecoFriendlyPreference === 'no-preference') {
        score += 10; // Neutral score
      }

      // Product interests match from survey (20% weight)
      if (userPrefs.preferences.productInterests && 
          userPrefs.preferences.productInterests.some(interest => 
            product.category.toLowerCase().includes(interest.toLowerCase().split(' ')[0])
          )) {
        score += 20;
      }
    }

    // INTERACTION-BASED SCORING (Lower Priority)
    // Category preference score from interactions
    if (categoryWeights[product.category]) {
      score += categoryWeights[product.category] * 2;
    }

    // Recent interaction boost
    const recentInteraction = productInteractions.find(
      p => p.productId.toString() === product._id.toString()
    );
    if (recentInteraction) {
      score += recentInteraction.interactionCount * 5;
      
      // Boost for recent interactions
      const daysSinceLastInteraction = (new Date() - recentInteraction.lastInteraction) / (1000 * 60 * 60 * 24);
      if (daysSinceLastInteraction < 7) {
        score += 10; // Recent interaction boost
      }
    }

    // Search history relevance
    const relevantSearches = searchHistory.filter(search => 
      product.name.toLowerCase().includes(search.query.toLowerCase()) ||
      product.description.toLowerCase().includes(search.query.toLowerCase())
    );
    score += relevantSearches.length * 3;

    // Time decay for older interactions
    const now = new Date();
    const timeDecay = Math.exp(-this.timeDecayFactor * (now - product.createdAt) / (1000 * 60 * 60 * 24));
    score *= timeDecay;

    return Math.round(score);
  }

  /**
   * Infer sustainability preference from interaction history
   */
  async inferSustainabilityPreference(productInteractions) {
    if (productInteractions.length === 0) return null;

    // Get products that user has interacted with
    const productIds = productInteractions.map(p => p.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length === 0) return null;

    // Calculate average sustainability grade preference
    const gradeCounts = {};
    products.forEach(product => {
      const grade = product.sustainabilityGrade;
      gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
    });

    // Return most preferred grade
    const topGrade = Object.entries(gradeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    return topGrade;
  }

  /**
   * Infer price preference from interaction history
   */
  async inferPricePreference(productInteractions) {
    if (productInteractions.length === 0) return null;

    // Get products that user has interacted with
    const productIds = productInteractions.map(p => p.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length === 0) return null;

    // Calculate average price preference
    const prices = products.map(p => p.price);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    // Determine price range preference
    if (avgPrice < 25) {
      return { $lt: 25 }; // Budget preference
    } else if (avgPrice <= 100) {
      return { $gte: 25, $lte: 100 }; // Mid-range preference
    } else {
      return { $gt: 100 }; // Premium preference
    }
  }

  /**
   * Get real-time personalized recommendations
   */
  async getRealTimeRecommendations(userId, limit = 20) {
    try {
      const userPrefs = await UserPreferences.findOne({ userId });
      if (!userPrefs) {
        // Return general recommendations for new users
        const products = await Product.find({ isActive: true })
          .sort({ sustainabilityScore: -1, rating: -1 })
          .limit(limit);
        return products;
      }

      return await this.generateDynamicRecommendations(userId, userPrefs, limit);

    } catch (error) {
      console.error('Error getting real-time recommendations:', error);
      return [];
    }
  }

  /**
   * Get user behavior insights
   */
  async getUserBehaviorInsights(userId) {
    try {
      const userPrefs = await UserPreferences.findOne({ userId });
      if (!userPrefs) {
        return {
          engagementScore: 0,
          topCategories: [],
          recentSearches: [],
          interactionCount: 0
        };
      }

      const categoryFrequency = userPrefs.preferences?.categoryFrequency || {};
      const topCategories = Object.entries(categoryFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([category, count]) => ({ category, count }));

      const recentSearches = userPrefs.preferences?.searchHistory?.slice(0, 10) || [];
      const interactionCount = userPrefs.preferences?.productInteractions?.length || 0;

      return {
        engagementScore: userPrefs.aiRecommendations?.engagementScore || 0,
        topCategories,
        recentSearches,
        interactionCount,
        lastUpdated: userPrefs.aiRecommendations?.lastUpdated
      };

    } catch (error) {
      console.error('Error getting user behavior insights:', error);
      return {
        engagementScore: 0,
        topCategories: [],
        recentSearches: [],
        interactionCount: 0
      };
    }
  }
}

module.exports = new DynamicRecommendationEngine();
