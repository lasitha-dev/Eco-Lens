import { API_BASE_URL } from '../config/api';
import { showNetworkTroubleshootingTips } from '../utils/networkUtils';
import AuthService from './authService';

class CartService {
  // Add item to cart
  static async addToCart(productId, quantity = 1) {
    try {
      console.log(`Adding product ${productId} to cart, quantity: ${quantity}`);

      const headers = await AuthService.getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ productId, quantity }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to add item to cart`);
      }

      const data = await response.json();
      console.log(`✅ Successfully added item to cart`);
      return data;
    } catch (error) {
      console.error('Error adding to cart:', error);

      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        console.log('Network troubleshooting tips:', showNetworkTroubleshootingTips());
        throw new Error('Unable to connect to server. Please check your network connection.');
      }

      throw error;
    }
  }

  // Get user's cart
  static async getCart(userId) {
    try {
      console.log(`Fetching cart for user: ${userId}`);

      const headers = await AuthService.getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/cart/${userId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch cart`);
      }

      const data = await response.json();
      console.log(`✅ Successfully fetched cart with ${data.items?.length || 0} items`);
      return data;
    } catch (error) {
      console.error('Error fetching cart:', error);

      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        console.log('Network troubleshooting tips:', showNetworkTroubleshootingTips());
        throw new Error('Unable to connect to server. Please check your network connection.');
      }

      throw error;
    }
  }

  // Update item quantity in cart
  static async updateCartItem(userId, productId, quantity) {
    try {
      console.log(`Updating cart item ${productId} for user ${userId}, quantity: ${quantity}`);

      const headers = await AuthService.getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/cart/${userId}/${productId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to update cart item`);
      }

      const data = await response.json();
      console.log(`✅ Successfully updated cart item`);
      return data;
    } catch (error) {
      console.error('Error updating cart item:', error);

      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        console.log('Network troubleshooting tips:', showNetworkTroubleshootingTips());
        throw new Error('Unable to connect to server. Please check your network connection.');
      }

      throw error;
    }
  }

  // Remove item from cart
  static async removeFromCart(userId, productId) {
    try {
      console.log(`Removing item ${productId} from cart for user ${userId}`);

      const headers = await AuthService.getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/cart/${userId}/${productId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to remove item from cart`);
      }

      const data = await response.json();
      console.log(`✅ Successfully removed item from cart`);
      return data;
    } catch (error) {
      console.error('Error removing from cart:', error);

      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        console.log('Network troubleshooting tips:', showNetworkTroubleshootingTips());
        throw new Error('Unable to connect to server. Please check your network connection.');
      }

      throw error;
    }
  }

  // Clear entire cart
  static async clearCart(userId) {
    try {
      console.log(`Clearing cart for user: ${userId}`);

      const headers = await AuthService.getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/cart/${userId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to clear cart`);
      }

      const data = await response.json();
      console.log(`✅ Successfully cleared cart`);
      return data;
    } catch (error) {
      console.error('Error clearing cart:', error);

      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        console.log('Network troubleshooting tips:', showNetworkTroubleshootingTips());
        throw new Error('Unable to connect to server. Please check your network connection.');
      }

      throw error;
    }
  }

  // Get cart item count (helper method)
  static async getCartItemCount(userId) {
    try {
      const cart = await this.getCart(userId);
      return cart.items.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      console.error('Error getting cart item count:', error);
      return 0;
    }
  }
}

export default CartService;