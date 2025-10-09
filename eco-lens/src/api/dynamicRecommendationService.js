/**
 * Dynamic Recommendation Service
 * Frontend service for real-time recommendation updates
 */

import { API_BASE_URL } from '../config/api';
import AuthService from './authService';

class DynamicRecommendationService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/dynamic`;
  }

  /**
   * Make authenticated request
   */
  async makeRequest(endpoint, options = {}) {
    try {
      const authHeaders = await AuthService.getAuthHeaders();
      
      console.log(`🔐 Making request to: ${this.baseURL}${endpoint}`);
      console.log(`🔑 Auth headers present:`, !!authHeaders.Authorization);
      console.log(`📝 Request body:`, JSON.stringify(options.body || {}));
      
      if (!authHeaders.Authorization) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...authHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ Request failed: ${endpoint}`, {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error || 'Unknown error',
          url: `${API_BASE_URL}${endpoint}`
        });
        throw new Error(errorData.error || `HTTP ${response.status}: Request failed`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error making request to ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Track user interaction and get updated recommendations
   */
  async trackInteraction(interaction) {
    try {
      const {
        type, // 'search', 'product_view', 'product_click', 'add_to_cart', 'purchase'
        productId,
        category,
        searchQuery,
        timeSpent = 0,
        metadata = {}
      } = interaction;

      const response = await this.makeRequest('/track-interaction', {
        method: 'POST',
        body: JSON.stringify({
          type,
          productId,
          category,
          searchQuery,
          timeSpent,
          metadata
        })
      });

      console.log(`✅ Tracked ${type} interaction and updated recommendations`);
      return response;

    } catch (error) {
      console.error('Error tracking interaction:', error);
      throw error;
    }
  }

  /**
   * Track search with dynamic updates
   */
  async trackSearch(searchData) {
    try {
      const {
        searchQuery,
        category,
        resultsCount = 0,
        sessionId,
        userAgent
      } = searchData;

      const response = await this.makeRequest('/track-search-dynamic', {
        method: 'POST',
        body: JSON.stringify({
          searchQuery,
          category,
          resultsCount,
          sessionId,
          userAgent
        })
      });

      console.log(`✅ Tracked search: "${searchQuery}" and updated recommendations`);
      return response;

    } catch (error) {
      console.error('Error tracking search:', error);
      throw error;
    }
  }

  /**
   * Track product view with dynamic updates
   */
  async trackProductView(productId, timeSpent = 0, source = 'search') {
    try {
      const response = await this.makeRequest('/track-product-view', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          timeSpent,
          source
        })
      });

      console.log(`✅ Tracked product view for product ${productId}`);
      return response;

    } catch (error) {
      console.error('Error tracking product view:', error);
      throw error;
    }
  }

  /**
   * Track add to cart with dynamic updates
   */
  async trackAddToCart(productId, quantity = 1, source = 'search') {
    try {
      const response = await this.makeRequest('/track-add-to-cart', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          quantity,
          source
        })
      });

      console.log(`✅ Tracked add to cart for product ${productId}`);
      return response;

    } catch (error) {
      console.error('Error tracking add to cart:', error);
      throw error;
    }
  }

  /**
   * Get real-time personalized recommendations
   */
  async getRealTimeRecommendations(limit = 20) {
    try {
      const response = await this.makeRequest(`/real-time-recommendations?limit=${limit}`);
      
      console.log(`✅ Retrieved ${response.recommendations.length} real-time recommendations`);
      return response;

    } catch (error) {
      console.error('Error getting real-time recommendations:', error);
      throw error;
    }
  }

  /**
   * Get user behavior insights
   */
  async getBehaviorInsights() {
    try {
      const response = await this.makeRequest('/behavior-insights');
      
      console.log('✅ Retrieved user behavior insights');
      return response;

    } catch (error) {
      console.error('Error getting behavior insights:', error);
      throw error;
    }
  }

  /**
   * Get dynamic dashboard data
   */
  async getDynamicDashboard() {
    try {
      const response = await this.makeRequest('/dynamic-dashboard');
      
      console.log('✅ Retrieved dynamic dashboard data');
      return response;

    } catch (error) {
      console.error('Error getting dynamic dashboard:', error);
      throw error;
    }
  }

  /**
   * Track product click from search results
   */
  async trackProductClick(productId, searchQuery, category, timeSpent = 0) {
    try {
      const response = await this.trackInteraction({
        type: 'product_click',
        productId,
        category,
        searchQuery,
        timeSpent,
        metadata: {
          source: 'search',
          timestamp: new Date().toISOString()
        }
      });

      return response;

    } catch (error) {
      console.error('Error tracking product click:', error);
      throw error;
    }
  }

  /**
   * Track product view from recommendations
   */
  async trackRecommendationView(productId, timeSpent = 0) {
    try {
      const response = await this.trackProductView(productId, timeSpent, 'recommendation');
      return response;

    } catch (error) {
      console.error('Error tracking recommendation view:', error);
      throw error;
    }
  }

  /**
   * Track category filter usage
   */
  async trackCategoryFilter(category, productCount) {
    try {
      const response = await this.trackInteraction({
        type: 'search',
        category,
        metadata: {
          source: 'category_filter',
          productCount,
          timestamp: new Date().toISOString()
        }
      });

      return response;

    } catch (error) {
      console.error('Error tracking category filter:', error);
      throw error;
    }
  }

  /**
   * Track sustainability filter usage
   */
  async trackSustainabilityFilter(sustainabilityGrade, productCount) {
    try {
      const response = await this.trackInteraction({
        type: 'search',
        metadata: {
          source: 'sustainability_filter',
          sustainabilityGrade,
          productCount,
          timestamp: new Date().toISOString()
        }
      });

      return response;

    } catch (error) {
      console.error('Error tracking sustainability filter:', error);
      throw error;
    }
  }

  /**
   * Track price filter usage
   */
  async trackPriceFilter(priceRange, productCount) {
    try {
      const response = await this.trackInteraction({
        type: 'search',
        metadata: {
          source: 'price_filter',
          priceRange,
          productCount,
          timestamp: new Date().toISOString()
        }
      });

      return response;

    } catch (error) {
      console.error('Error tracking price filter:', error);
      throw error;
    }
  }

  /**
   * Force refresh recommendations after user interaction
   */
  async refreshRecommendations(limit = 20) {
    try {
      console.log('🔄 Force refreshing recommendations...');
      const response = await this.getRealTimeRecommendations(limit);
      console.log(`✅ Refreshed ${response.recommendations.length} personalized recommendations`);
      return response;
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
      throw error;
    }
  }
}

export default new DynamicRecommendationService();
