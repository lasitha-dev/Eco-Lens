import { API_BASE_URL } from '../config/api';
import { showNetworkTroubleshootingTips } from '../utils/networkUtils';
import AuthService from './authService';

class OrderService {
  // Create checkout session
  static async createCheckout(shippingInfo) {
    try {
      console.log('Creating checkout session');

      const headers = await AuthService.getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/order/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ shippingInfo }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to create checkout`);
      }

      const data = await response.json();
      console.log(`✅ Successfully created checkout session`);
      return data;
    } catch (error) {
      console.error('Error creating checkout:', error);

      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        console.log('Network troubleshooting tips:', showNetworkTroubleshootingTips());
        throw new Error('Unable to connect to server. Please check your network connection.');
      }

      throw error;
    }
  }

  // Get user's order history
  static async getOrderHistory(userId) {
    try {
      console.log(`Fetching order history for user: ${userId}`);

      const headers = await AuthService.getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/order/${userId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch orders`);
      }

      const data = await response.json();
      console.log(`✅ Successfully fetched ${data.length} orders`);
      return data;
    } catch (error) {
      console.error('Error fetching order history:', error);

      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        console.log('Network troubleshooting tips:', showNetworkTroubleshootingTips());
        throw new Error('Unable to connect to server. Please check your network connection.');
      }

      throw error;
    }
  }

  // Get single order details
  static async getOrderDetail(orderId) {
    try {
      console.log(`Fetching order detail for order: ${orderId}`);

      const headers = await AuthService.getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/order/detail/${orderId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch order detail`);
      }

      const data = await response.json();
      console.log(`✅ Successfully fetched order detail`);
      return data;
    } catch (error) {
      console.error('Error fetching order detail:', error);

      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        console.log('Network troubleshooting tips:', showNetworkTroubleshootingTips());
        throw new Error('Unable to connect to server. Please check your network connection.');
      }

      throw error;
    }
  }
}

export default OrderService;