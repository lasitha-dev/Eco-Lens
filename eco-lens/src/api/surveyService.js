/**
 * Survey Service
 * Handles survey-related API calls
 */

import { API_BASE_URL } from '../config/api';

class SurveyService {
  // Check if user has completed the survey
  static async checkSurveyStatus(userId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/survey/status/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check survey status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking survey status:', error);
      return { completed: false, completedAt: null };
    }
  }

  // Get survey questions
  static async getSurveyQuestions() {
    try {
      const response = await fetch(`${API_BASE_URL}/survey/questions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get survey questions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting survey questions:', error);
      return { questions: [] };
    }
  }

  // Submit survey responses
  static async submitSurvey(surveyData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/survey/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(surveyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit survey');
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting survey:', error);
      throw error;
    }
  }

  // Get personalized recommendations
  static async getRecommendations(userId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/survey/recommendations/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return { recommendations: [], preferences: null };
    }
  }

  // Update user preferences
  static async updatePreferences(userId, preferences, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/survey/update/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }
}

export default SurveyService;
