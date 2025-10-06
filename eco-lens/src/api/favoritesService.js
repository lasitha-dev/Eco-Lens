import { API_BASE_URL } from '../config/api';
import { showNetworkTroubleshootingTips } from '../utils/networkUtils';
import AuthService from './authService';

class FavoritesService {
  // Get user's favorite products
  static async getFavorites() {
    try {
      console.log('Fetching user favorites...');
      
      const headers = await AuthService.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch favorites`);
      }
      
      const data = await response.json();
      console.log(`✅ Successfully fetched ${data.count || 0} favorite products`);
      return data;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        console.log('Network troubleshooting tips:', showNetworkTroubleshootingTips());
        throw new Error('Unable to connect to server. Please check your network connection.');
      }
      
      throw error;
    }
  }

  // Add product to favorites
  static async addToFavorites(productId) {
    try {
      console.log(`Adding product ${productId} to favorites...`);
      
      const headers = await AuthService.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/favorites/${productId}`, {
        method: 'POST',
        headers,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to add to favorites`);
      }
      
      const data = await response.json();
      console.log(`✅ Successfully added ${data.productName || 'product'} to favorites`);
      return data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        console.log('Network troubleshooting tips:', showNetworkTroubleshootingTips());
        throw new Error('Unable to connect to server. Please check your network connection.');
      }
      
      throw error;
    }
  }

  // Remove product from favorites
  static async removeFromFavorites(productId) {
    try {
      console.log(`Removing product ${productId} from favorites...`);
      
      const headers = await AuthService.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/favorites/${productId}`, {
        method: 'DELETE',
        headers,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to remove from favorites`);
      }
      
      const data = await response.json();
      console.log(`✅ Successfully removed product from favorites`);
      return data;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        console.log('Network troubleshooting tips:', showNetworkTroubleshootingTips());
        throw new Error('Unable to connect to server. Please check your network connection.');
      }
      
      throw error;
    }
  }

  // Check if product is in favorites
  static async checkFavoriteStatus(productId) {
    try {
      console.log(`Checking favorite status for product ${productId}...`);
      
      const headers = await AuthService.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/favorites/check/${productId}`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to check favorite status`);
      }
      
      const data = await response.json();
      console.log(`✅ Favorite status checked: ${data.isFavorite ? 'favorited' : 'not favorited'}`);
      return data;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        console.log('Network troubleshooting tips:', showNetworkTroubleshootingTips());
        // Return default state instead of throwing error for status checks
        return { productId, isFavorite: false, favoritesCount: 0 };
      }
      
      throw error;
    }
  }

  // Toggle favorite status (add if not favorite, remove if favorite)
  static async toggleFavorite(productId, currentlyFavorited = false) {
    try {
      if (currentlyFavorited) {
        return await this.removeFromFavorites(productId);
      } else {
        return await this.addToFavorites(productId);
      }
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      throw error;
    }
  }

  // Batch operations for multiple products
  static async batchCheckFavorites(productIds) {
    try {
      console.log(`Batch checking favorites for ${productIds.length} products...`);
      
      // Check favorites in parallel for better performance
      const results = await Promise.allSettled(
        productIds.map(productId => this.checkFavoriteStatus(productId))
      );

      // Process results and handle any failures gracefully
      const favoriteStatuses = {};
      results.forEach((result, index) => {
        const productId = productIds[index];
        if (result.status === 'fulfilled') {
          favoriteStatuses[productId] = result.value.isFavorite;
        } else {
          console.warn(`Failed to check favorite status for product ${productId}:`, result.reason);
          favoriteStatuses[productId] = false; // Default to not favorited on error
        }
      });

      console.log(`✅ Batch favorite check completed for ${Object.keys(favoriteStatuses).length} products`);
      return favoriteStatuses;
    } catch (error) {
      console.error('Error in batch favorite check:', error);
      throw error;
    }
  }

  // Helper method to check if favorites service is available
  static async healthCheck() {
    try {
      const headers = await AuthService.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/favorites`, { 
        method: 'GET',
        headers 
      });
      return response.ok;
    } catch (error) {
      console.error('Favorites service health check failed:', error);
      return false;
    }
  }
}

export default FavoritesService;
