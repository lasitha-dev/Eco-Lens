/**
 * Search Analytics Service
 * Handles search tracking, pattern analysis, and dynamic recommendations
 */

import { API_BASE_URL } from '../config/api';

class SearchAnalyticsService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/search`;
    this.sessionId = this.generateSessionId();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getAuthToken();

    if (!token) {
      throw new Error('Access token required');
    }

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    console.log(`Making request to: ${url}`);
    console.log('Token present:', !!token);

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAuthToken() {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      // Try both possible keys for the auth token
      let token = await AsyncStorage.getItem('@eco_lens_auth_token');
      if (!token) {
        token = await AsyncStorage.getItem('@eco_lens_token');
      }
      console.log('Retrieved auth token:', token ? 'Present' : 'Missing');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Track a search query
   */
  async trackSearch(searchData) {
    try {
      const {
        searchQuery,
        searchType = 'general',
        category,
        filters = {},
        resultsCount = 0
      } = searchData;

      const response = await this.makeRequest('/track-search', {
        method: 'POST',
        body: JSON.stringify({
          searchQuery,
          searchType,
          category,
          filters,
          resultsCount,
          sessionId: this.sessionId,
          userAgent: 'Eco-Lens Mobile App'
        })
      });

      return response;
    } catch (error) {
      console.error('Error tracking search:', error);
      throw error;
    }
  }

  /**
   * Track a product click from search results
   */
  async trackProductClick(searchId, productId, timeSpent = 0) {
    try {
      const response = await this.makeRequest('/track-click', {
        method: 'POST',
        body: JSON.stringify({
          searchId,
          productId,
          timeSpent
        })
      });

      return response;
    } catch (error) {
      console.error('Error tracking product click:', error);
      throw error;
    }
  }

  /**
   * Get user search patterns and analytics
   */
  async getSearchPatterns(days = 30) {
    try {
      const response = await this.makeRequest(`/patterns?days=${days}`);
      return response;
    } catch (error) {
      console.error('Error getting search patterns:', error);
      throw error;
    }
  }

  /**
   * Get personalized recommendations based on search history
   */
  async getPersonalizedRecommendations(limit = 20, days = 30) {
    try {
      const response = await this.makeRequest(`/recommendations?limit=${limit}&days=${days}`);
      return response;
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      throw error;
    }
  }

  /**
   * Get search analytics dashboard data
   */
  async getDashboardData(days = 30) {
    try {
      const response = await this.makeRequest(`/dashboard?days=${days}`);
      return response;
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get search suggestions based on user history
   */
  async getSearchSuggestions(query, limit = 5) {
    try {
      if (!query || query.length < 2) {
        return { success: true, suggestions: [] };
      }

      const response = await this.makeRequest(`/suggestions?query=${encodeURIComponent(query)}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      throw error;
    }
  }

  /**
   * Clear user search history
   */
  async clearSearchHistory(days = null) {
    try {
      const response = await this.makeRequest('/clear-history', {
        method: 'DELETE',
        body: JSON.stringify({ days })
      });

      return response;
    } catch (error) {
      console.error('Error clearing search history:', error);
      throw error;
    }
  }

  /**
   * Enhanced search with tracking and suggestions
   */
  async searchWithTracking(searchQuery, filters = {}) {
    try {
      // Track the search
      const trackResponse = await this.trackSearch({
        searchQuery,
        searchType: 'product',
        category: filters.category,
        filters: {
          sustainabilityGrade: filters.sustainabilityGrade,
          priceRange: filters.priceRange,
          materials: filters.materials || [],
          brands: filters.brands || []
        },
        resultsCount: 0 // Will be updated after getting results
      });

      // Get search suggestions for autocomplete
      const suggestionsResponse = await this.getSearchSuggestions(searchQuery);

      return {
        searchId: trackResponse.searchId,
        suggestions: suggestionsResponse.suggestions,
        sessionId: this.sessionId
      };
    } catch (error) {
      console.error('Error in search with tracking:', error);
      throw error;
    }
  }

  /**
   * Get search insights for user profile
   */
  async getSearchInsights(days = 30) {
    try {
      const [patterns, dashboard] = await Promise.all([
        this.getSearchPatterns(days),
        this.getDashboardData(days)
      ]);

      return {
        patterns: patterns.patterns,
        insights: dashboard.insights,
        trendingSearches: dashboard.trendingSearches
      };
    } catch (error) {
      console.error('Error getting search insights:', error);
      // Return default insights if there's an auth error
      if (error.message.includes('Access token required')) {
        console.log('Authentication required for search insights, returning default data');
        return {
          patterns: {
            totalSearches: 0,
            categoryFrequency: {},
            searchTypeFrequency: {},
            sustainabilityGradeFrequency: {},
            allMaterials: [],
            allBrands: [],
            recentSearches: []
          },
          insights: {
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
   * Calculate search behavior score
   */
  calculateBehaviorScore(patterns) {
    const {
      totalSearches = 0,
      categoryFrequency = {},
      sustainabilityGradeFrequency = {},
      topMaterials = [],
      topBrands = []
    } = patterns;

    let score = 0;

    // Base score from search activity
    score += Math.min(30, totalSearches * 2);

    // Diversity bonus
    const categoryDiversity = Object.keys(categoryFrequency).length;
    score += Math.min(20, categoryDiversity * 3);

    // Sustainability focus bonus
    const ecoGrades = ['A', 'B'];
    const ecoSearchCount = ecoGrades.reduce((sum, grade) => 
      sum + (sustainabilityGradeFrequency[grade] || 0), 0
    );
    score += Math.min(25, ecoSearchCount * 5);

    // Material and brand awareness bonus
    score += Math.min(15, topMaterials.length * 2);
    score += Math.min(10, topBrands.length * 1);

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Get personalized search tips based on user behavior
   */
  getPersonalizedTips(patterns) {
    const tips = [];

    if (patterns.totalSearches < 5) {
      tips.push({
        type: 'exploration',
        message: 'Try searching for different product categories to discover more eco-friendly options!',
        icon: '🔍'
      });
    }

    const categoryEntries = Object.entries(patterns.categoryFrequency || {});
    if (categoryEntries.length > 0) {
      const topCategory = categoryEntries.sort(([,a], [,b]) => b - a)[0][0];
      tips.push({
        type: 'category',
        message: `You seem to love ${topCategory} products! Check out our A-grade options in this category.`,
        icon: '⭐'
      });
    }

    const gradeEntries = Object.entries(patterns.sustainabilityGradeFrequency || {});
    if (gradeEntries.length > 0) {
      const topGrade = gradeEntries.sort(([,a], [,b]) => b - a)[0][0];
      if (['A', 'B'].includes(topGrade)) {
        tips.push({
          type: 'sustainability',
          message: 'Great job prioritizing sustainable products! Keep up the eco-friendly shopping!',
          icon: '🌱'
        });
      } else {
        tips.push({
          type: 'sustainability',
          message: 'Consider looking for products with higher sustainability grades (A or B) for better environmental impact.',
          icon: '🌍'
        });
      }
    }

    if (patterns.topMaterials && patterns.topMaterials.length > 0) {
      const topMaterial = patterns.topMaterials[0].material;
      tips.push({
        type: 'materials',
        message: `You frequently search for ${topMaterial} products. Look for recycled or sustainable ${topMaterial} options!`,
        icon: '♻️'
      });
    }

    return tips;
  }
}

export default new SearchAnalyticsService();
