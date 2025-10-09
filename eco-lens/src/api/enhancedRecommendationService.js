/**
 * Enhanced Recommendation Service
 * Combines survey data with search history for dynamic recommendations
 */

import SearchAnalyticsService from './searchAnalyticsService';
import SurveyService from './surveyService';
import ProductService from './productService';

class EnhancedRecommendationService {
  constructor() {
    this.searchAnalytics = SearchAnalyticsService;
    this.surveyService = SurveyService;
    this.productService = ProductService;
  }

  /**
   * Get comprehensive recommendations combining survey and search data
   */
  async getEnhancedRecommendations(userId, authToken, options = {}) {
    try {
      const {
        limit = 20,
        days = 30,
        includeSearchHistory = true,
        includeSurveyData = true,
        prioritizeRecent = true
      } = options;

      // Get data from multiple sources
      const [searchData, surveyData, generalProducts] = await Promise.allSettled([
        includeSearchHistory ? this.searchAnalytics.getPersonalizedRecommendations(limit, days) : null,
        includeSurveyData ? this.surveyService.getRecommendations(userId, authToken) : null,
        this.productService.getProducts({ limit: limit * 2 }) // Get more for better filtering
      ]);

      // Log the results for debugging
      console.log('Search data status:', searchData.status);
      console.log('Survey data status:', surveyData.status);
      console.log('General products status:', generalProducts.status);

      // Extract successful results
      const searchRecommendations = searchData.status === 'fulfilled' ? searchData.value : null;
      const surveyRecommendations = surveyData.status === 'fulfilled' ? surveyData.value : null;
      const allProducts = generalProducts.status === 'fulfilled' ? generalProducts.value.products : [];

      // Combine and rank recommendations
      const combinedRecommendations = await this.combineRecommendations({
        searchRecommendations,
        surveyRecommendations,
        allProducts,
        limit,
        prioritizeRecent
      });

      return {
        success: true,
        recommendations: combinedRecommendations.products,
        source: combinedRecommendations.source,
        confidenceScore: combinedRecommendations.confidenceScore,
        insights: combinedRecommendations.insights,
        searchPatterns: searchRecommendations?.patterns || null,
        surveyPreferences: surveyRecommendations?.preferences || null
      };

    } catch (error) {
      console.error('Error getting enhanced recommendations:', error);
      throw error;
    }
  }

  /**
   * Combine recommendations from different sources with intelligent weighting
   */
  async combineRecommendations({ searchRecommendations, surveyRecommendations, allProducts, limit, prioritizeRecent }) {
    const recommendations = [];
    const productMap = new Map();
    const sourceWeights = this.calculateSourceWeights(searchRecommendations, surveyRecommendations, prioritizeRecent);

    // Process search-based recommendations (highest priority for recent activity)
    if (searchRecommendations?.recommendations && sourceWeights.search > 0) {
      searchRecommendations.recommendations.forEach((product, index) => {
        const weight = sourceWeights.search * (1 - index * 0.1); // Decrease weight for lower-ranked items
        productMap.set(product.id, {
          ...product,
          recommendationScore: weight,
          source: 'search_history',
          searchRank: index
        });
      });
    }

    // Process survey-based recommendations
    if (surveyRecommendations?.recommendations && sourceWeights.survey > 0) {
      surveyRecommendations.recommendations.forEach((product, index) => {
        const existingProduct = productMap.get(product.id);
        if (existingProduct) {
          // Combine scores if product appears in both sources
          existingProduct.recommendationScore += sourceWeights.survey * (1 - index * 0.1);
          existingProduct.source = 'combined';
          existingProduct.surveyRank = index;
        } else {
          productMap.set(product.id, {
            ...product,
            recommendationScore: sourceWeights.survey * (1 - index * 0.1),
            source: 'survey',
            surveyRank: index
          });
        }
      });
    }

    // Add general products with lower weight if we don't have enough recommendations
    if (productMap.size < limit && allProducts.length > 0) {
      const usedProductIds = new Set(productMap.keys());
      const availableProducts = allProducts.filter(p => !usedProductIds.has(p.id));
      
      availableProducts.slice(0, limit - productMap.size).forEach((product, index) => {
        productMap.set(product.id, {
          ...product,
          recommendationScore: sourceWeights.general * (1 - index * 0.05),
          source: 'general',
          generalRank: index
        });
      });
    }

    // Convert to array and sort by recommendation score
    const sortedRecommendations = Array.from(productMap.values())
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit);

    // Calculate overall confidence score
    const confidenceScore = this.calculateConfidenceScore(
      searchRecommendations,
      surveyRecommendations,
      sortedRecommendations.length
    );

    // Determine primary source
    const source = this.determinePrimarySource(searchRecommendations, surveyRecommendations);

    return {
      products: sortedRecommendations,
      source,
      confidenceScore,
      insights: this.generateRecommendationInsights(sortedRecommendations, searchRecommendations, surveyRecommendations)
    };
  }

  /**
   * Calculate dynamic weights for different recommendation sources
   */
  calculateSourceWeights(searchRecommendations, surveyRecommendations, prioritizeRecent) {
    const weights = {
      search: 0,
      survey: 0,
      general: 0.1
    };

    // Search history weight (higher if recent activity)
    if (searchRecommendations?.patterns) {
      const { totalSearches, recentSearches } = searchRecommendations.patterns;
      const recentActivity = recentSearches?.filter(s => {
        const daysSince = (new Date() - new Date(s.timestamp)) / (1000 * 60 * 60 * 24);
        return daysSince <= 7; // Last 7 days
      }).length || 0;

      weights.search = Math.min(0.8, 0.3 + (recentActivity * 0.1) + (totalSearches * 0.02));
    }

    // Survey weight (stable baseline)
    if (surveyRecommendations?.recommendations?.length > 0) {
      weights.survey = Math.min(0.6, 0.4 + (surveyRecommendations.recommendations.length * 0.01));
    }

    // Adjust weights to sum to 1
    const totalWeight = weights.search + weights.survey + weights.general;
    if (totalWeight > 0) {
      weights.search /= totalWeight;
      weights.survey /= totalWeight;
      weights.general /= totalWeight;
    } else {
      weights.general = 1; // Fallback to general recommendations
    }

    return weights;
  }

  /**
   * Calculate overall confidence score for recommendations
   */
  calculateConfidenceScore(searchRecommendations, surveyRecommendations, recommendationCount) {
    let score = 20; // Base score

    // Search history confidence
    if (searchRecommendations?.confidenceScore) {
      score += searchRecommendations.confidenceScore * 0.4;
    }

    // Survey data confidence
    if (surveyRecommendations?.recommendations?.length > 0) {
      score += Math.min(30, surveyRecommendations.recommendations.length * 2);
    }

    // Recommendation diversity bonus
    if (recommendationCount >= 10) {
      score += 10;
    }

    return Math.min(95, Math.max(20, score));
  }

  /**
   * Determine primary source of recommendations
   */
  determinePrimarySource(searchRecommendations, surveyRecommendations) {
    if (searchRecommendations?.patterns?.totalSearches > 5) {
      return 'search_history';
    } else if (surveyRecommendations?.recommendations?.length > 0) {
      return 'survey_preferences';
    } else {
      return 'general';
    }
  }

  /**
   * Generate insights about the recommendations
   */
  generateRecommendationInsights(recommendations, searchRecommendations, surveyRecommendations) {
    const insights = {
      totalRecommendations: recommendations.length,
      sourceBreakdown: {},
      categoryDistribution: {},
      sustainabilityDistribution: {},
      averageScore: 0,
      topCategories: [],
      ecoFriendlyPercentage: 0
    };

    // Analyze source breakdown
    recommendations.forEach(rec => {
      insights.sourceBreakdown[rec.source] = (insights.sourceBreakdown[rec.source] || 0) + 1;
    });

    // Analyze categories
    recommendations.forEach(rec => {
      insights.categoryDistribution[rec.category] = (insights.categoryDistribution[rec.category] || 0) + 1;
    });

    // Analyze sustainability grades
    recommendations.forEach(rec => {
      insights.sustainabilityDistribution[rec.sustainabilityGrade] = 
        (insights.sustainabilityDistribution[rec.sustainabilityGrade] || 0) + 1;
    });

    // Calculate averages
    insights.averageScore = recommendations.reduce((sum, rec) => sum + rec.sustainabilityScore, 0) / recommendations.length;
    insights.ecoFriendlyPercentage = (insights.sustainabilityDistribution.A + insights.sustainabilityDistribution.B) / recommendations.length * 100;

    // Get top categories
    insights.topCategories = Object.entries(insights.categoryDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }));

    return insights;
  }

  /**
   * Get search behavior insights for user profile
   */
  async getSearchBehaviorInsights(userId, authToken, days = 30) {
    try {
      const insights = await this.searchAnalytics.getSearchInsights(days);
      
      return {
        behaviorScore: this.searchAnalytics.calculateBehaviorScore(insights.patterns),
        personalizedTips: this.searchAnalytics.getPersonalizedTips(insights.patterns),
        searchPatterns: insights.patterns,
        dashboardInsights: insights.insights,
        trendingSearches: insights.trendingSearches
      };
    } catch (error) {
      console.error('Error getting search behavior insights:', error);
      // Return default insights if there's an auth error
      if (error.message.includes('Access token required')) {
        console.log('Authentication required for search insights, returning default insights');
        return {
          behaviorScore: 0,
          personalizedTips: [{
            type: 'getting_started',
            message: 'Complete your first search to see personalized insights!',
            icon: '🔍'
          }],
          searchPatterns: {
            totalSearches: 0,
            categoryFrequency: {},
            topMaterials: [],
            topBrands: [],
            recentSearches: []
          },
          dashboardInsights: {
            totalSearches: 0,
            mostSearchedCategory: null,
            preferredSustainabilityGrade: null,
            searchFrequency: 0,
            diversityScore: 0,
            recentActivity: []
          },
          trendingSearches: []
        };
      }
      throw error;
    }
  }

  /**
   * Update recommendations based on user interaction
   */
  async updateRecommendationsOnInteraction(userId, authToken, interaction) {
    try {
      const { type, productId, searchId, timeSpent } = interaction;

      switch (type) {
        case 'product_click':
          if (searchId && productId) {
            await this.searchAnalytics.trackProductClick(searchId, productId, timeSpent);
          }
          break;
        case 'search':
          // Search tracking is handled separately
          break;
        default:
          console.log('Unknown interaction type:', type);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating recommendations on interaction:', error);
      throw error;
    }
  }

  /**
   * Get recommendation explanation for a specific product
   */
  getRecommendationExplanation(product, searchPatterns, surveyPreferences) {
    const explanations = [];

    // Search-based explanations
    if (searchPatterns?.topCategories?.some(cat => cat[0] === product.category)) {
      explanations.push({
        type: 'search_history',
        message: `You've been searching for ${product.category} products recently`,
        confidence: 'high'
      });
    }

    if (searchPatterns?.topMaterials?.some(mat => 
      product.description.toLowerCase().includes(mat.material.toLowerCase())
    )) {
      explanations.push({
        type: 'material_preference',
        message: `This product matches materials you've been interested in`,
        confidence: 'medium'
      });
    }

    // Survey-based explanations
    if (surveyPreferences?.productInterests?.includes(product.category)) {
      explanations.push({
        type: 'survey_preference',
        message: `You indicated interest in ${product.category} during onboarding`,
        confidence: 'high'
      });
    }

    if (surveyPreferences?.ecoFriendlyPreference === 'Yes' && 
        ['A', 'B'].includes(product.sustainabilityGrade)) {
      explanations.push({
        type: 'sustainability_preference',
        message: `You prefer eco-friendly products, and this has a great sustainability rating`,
        confidence: 'high'
      });
    }

    // General explanations
    if (product.sustainabilityGrade === 'A') {
      explanations.push({
        type: 'sustainability',
        message: `This product has an excellent A-grade sustainability rating`,
        confidence: 'high'
      });
    }

    if (product.rating >= 4.5) {
      explanations.push({
        type: 'popularity',
        message: `Highly rated by other users (${product.rating}/5 stars)`,
        confidence: 'medium'
      });
    }

    return explanations;
  }
}

export default new EnhancedRecommendationService();
