import { API_BASE_URL } from '../config/api';
import AuthService from './authService';

class ProfileService {
  // Get current user profile
  static async getProfile() {
    try {
      const headers = await AuthService.getAuthHeaders();
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
      const headers = await AuthService.getAuthHeaders();
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

  // Delete profile photo
  static async deleteProfilePhoto() {
    try {
      const headers = await AuthService.getAuthHeaders();
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

export default ProfileService;