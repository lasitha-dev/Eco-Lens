import { API_BASE_URL } from '../config/api';
import { showNetworkTroubleshootingTips } from '../utils/networkUtils';

class AuthService {
  // Check if email already exists
  static async checkEmailExists(email) {
    try {
      console.log(`Checking email at: ${API_BASE_URL}/check-email`);
      
      const response = await fetch(`${API_BASE_URL}/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to check email availability');
      }
      
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Error checking email:', error);
      
      // Provide helpful network troubleshooting info
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        console.log('Network troubleshooting tips:', showNetworkTroubleshootingTips());
        throw new Error('Unable to connect to server. Please check your network connection and ensure your device and computer are on the same WiFi network.');
      }
      
      throw new Error('Failed to check email availability');
    }
  }

  // Register new user
  static async registerUser(userData) {
    try {
      console.log(`Registering user at: ${API_BASE_URL}/register`);
      
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          address: userData.address,
          dateOfBirth: userData.dateOfBirth,
          country: userData.country,
          password: userData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error registering user:', error);
      
      // Provide helpful network troubleshooting info
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        console.log('Network troubleshooting tips:', showNetworkTroubleshootingTips());
        throw new Error('Unable to connect to server. Please check your network connection and ensure your device and computer are on the same WiFi network.');
      }
      
      throw error;
    }
  }

  // Login user
  static async loginUser(email, password) {
    try {
      console.log(`Logging in user at: ${API_BASE_URL}/login`);
      
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error logging in:', error);
      
      // Provide helpful network troubleshooting info
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        console.log('Network troubleshooting tips:', showNetworkTroubleshootingTips());
        throw new Error('Unable to connect to server. Please check your network connection and ensure your device and computer are on the same WiFi network.');
      }
      
      throw error;
    }
  }

  // Health check
  static async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

export default AuthService;
