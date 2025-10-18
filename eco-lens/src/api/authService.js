import { API_BASE_URL } from '../config/api';
import { showNetworkTroubleshootingTips } from '../utils/networkUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  // Token storage keys
  static TOKEN_KEY = '@eco_lens_token';
  static USER_KEY = '@eco_lens_user';

  // Get stored authentication data
  static async getStoredAuth() {
    try {
      const [token, userJson] = await Promise.all([
        AsyncStorage.getItem(this.TOKEN_KEY),
        AsyncStorage.getItem(this.USER_KEY)
      ]);
      
      if (token && userJson) {
        const user = JSON.parse(userJson);
        return { token, user };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting stored auth:', error);
      return null;
    }
  }

  // Store authentication data
  static async storeAuth(token, user) {
    try {
      await Promise.all([
        AsyncStorage.setItem(this.TOKEN_KEY, token),
        AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user))
      ]);
    } catch (error) {
      console.error('Error storing auth:', error);
      throw error;
    }
  }

  // Clear authentication data
  static async clearAuth() {
    try {
      await Promise.all([
        AsyncStorage.removeItem(this.TOKEN_KEY),
        AsyncStorage.removeItem(this.USER_KEY)
      ]);
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  }

  // Get authorization headers
  static async getAuthHeaders() {
    try {
      const token = await AsyncStorage.getItem(this.TOKEN_KEY);
      if (token) {
        return {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
      }
      return {
        'Content-Type': 'application/json'
      };
    } catch (error) {
      console.error('Error getting auth headers:', error);
      return {
        'Content-Type': 'application/json'
      };
    }
  }

  // Check if current user is admin
  static async isAdmin() {
    try {
      const auth = await this.getStoredAuth();
      return auth?.user?.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  // Check if current user is customer
  static async isCustomer() {
    try {
      const auth = await this.getStoredAuth();
      return auth?.user?.role === 'customer';
    } catch (error) {
      console.error('Error checking customer status:', error);
      return false;
    }
  }
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
      
      // Store authentication data
      await this.storeAuth(data.token, data.user);
      
      console.log(`✅ Login successful for ${data.user.role}: ${data.user.email}`);
      
      return {
        ...data,
        isAdmin: data.user.role === 'admin',
        isCustomer: data.user.role === 'customer'
      };
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

  // Logout user
  static async logoutUser() {
    try {
      await this.clearAuth();
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  // Verify current token is still valid
  static async verifyToken() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers
      });
      return response.ok;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }

  // Refresh authentication status
  static async refreshAuth() {
    try {
      const isValid = await this.verifyToken();
      if (!isValid) {
        await this.clearAuth();
        return null;
      }
      return await this.getStoredAuth();
    } catch (error) {
      console.error('Error refreshing auth:', error);
      await this.clearAuth();
      return null;
    }
  }

  // Request password reset
  static async requestPasswordReset(email) {
    try {
      console.log(`Requesting password reset for: ${email}`);
      
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send reset email');
      }

      const data = await response.json();
      console.log('✅ Password reset request successful');
      return data;
    } catch (error) {
      console.error('Error requesting password reset:', error);
      
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        console.log('Network troubleshooting tips:', showNetworkTroubleshootingTips());
        throw new Error('Unable to connect to server. Please check your network connection.');
      }
      
      throw error;
    }
  }

  // Verify reset token
  static async verifyResetToken(token) {
    try {
      console.log('Verifying reset token...');
      
      const response = await fetch(`${API_BASE_URL}/auth/verify-reset-token?token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid or expired token');
      }

      const data = await response.json();
      console.log('✅ Reset token is valid');
      return data;
    } catch (error) {
      console.error('Error verifying reset token:', error);
      
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        console.log('Network troubleshooting tips:', showNetworkTroubleshootingTips());
        throw new Error('Unable to connect to server. Please check your network connection.');
      }
      
      throw error;
    }
  }

  // Reset password with token
  static async resetPassword(token, newPassword) {
    try {
      console.log('Resetting password with token...');

      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to reset password');
      }

      const data = await response.json();
      console.log('✅ Password reset successful');
      return data;
    } catch (error) {
      console.error('Error resetting password:', error);

      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        console.log('Network troubleshooting tips:', showNetworkTroubleshootingTips());
        throw new Error('Unable to connect to server. Please check your network connection.');
      }

      throw error;
    }
  }

  // Get user profile
  static async getUserProfile() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch profile');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(profileData) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Update fingerprint setting
  static async updateFingerprintSetting(fingerprintEnabled) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/profile/fingerprint-settings`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ fingerprintEnabled })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update fingerprint setting');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating fingerprint setting:', error);
      throw error;
    }
  }

  // Delete profile photo
  static async deleteProfilePhoto() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/profile/delete-photo`, {
        method: 'POST',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete profile photo');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error deleting profile photo:', error);
      throw error;
    }
  }

}

export default AuthService;
