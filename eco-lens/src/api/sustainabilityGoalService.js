/**
 * Sustainability Goals Service
 * Handles sustainability goals-related API calls
 */

import { API_BASE_URL } from '../config/api';

class SustainabilityGoalService {
  // Get all user's sustainability goals
  static async getUserGoals(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/goals`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch sustainability goals');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching sustainability goals:', error);
      throw error;
    }
  }

  // Create new sustainability goal
  static async createGoal(goalData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/goals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create sustainability goal');
      }
      
      return data;
    } catch (error) {
      console.error('Error creating sustainability goal:', error);
      throw error;
    }
  }

  // Update existing sustainability goal
  static async updateGoal(goalId, updateData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update sustainability goal');
      }
      
      return data;
    } catch (error) {
      console.error('Error updating sustainability goal:', error);
      throw error;
    }
  }

  // Delete sustainability goal
  static async deleteGoal(goalId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/goals/${goalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete sustainability goal');
      }
      
      return data;
    } catch (error) {
      console.error('Error deleting sustainability goal:', error);
      throw error;
    }
  }

  // Get detailed progress for specific goal
  static async getGoalProgress(goalId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/goals/${goalId}/progress`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch goal progress');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching goal progress:', error);
      throw error;
    }
  }

  // Track purchase against all active goals
  static async trackPurchase(orderId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/goals/track-purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to track purchase');
      }
      
      return data;
    } catch (error) {
      console.error('Error tracking purchase:', error);
      throw error;
    }
  }

  // Get goal statistics/summary
  static async getGoalStats(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/goals/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch goal statistics');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching goal statistics:', error);
      throw error;
    }
  }

  // Helper method to check if a product meets any active goal
  static checkProductMeetsGoals(product, activeGoals) {
    if (!activeGoals || activeGoals.length === 0) {
      return { meetsAnyGoal: false, matchingGoals: [] };
    }

    const matchingGoals = [];

    for (const goal of activeGoals) {
      let meetsGoal = false;

      switch (goal.goalType) {
        case 'grade-based':
          meetsGoal = goal.goalConfig.targetGrades.includes(product.sustainabilityGrade);
          break;
        
        case 'score-based':
          meetsGoal = product.sustainabilityScore >= goal.goalConfig.minimumScore;
          break;
        
        case 'category-based':
          meetsGoal = goal.goalConfig.categories.includes(product.category) &&
                     goal.goalConfig.targetGrades.includes(product.sustainabilityGrade);
          break;
        
        default:
          meetsGoal = false;
      }

      if (meetsGoal) {
        matchingGoals.push({
          goalId: goal._id,
          goalTitle: goal.title,
          goalType: goal.goalType
        });
      }
    }

    return {
      meetsAnyGoal: matchingGoals.length > 0,
      matchingGoals
    };
  }

  // Helper method to generate goal descriptions
  static generateGoalDescription(goalType, goalConfig) {
    switch (goalType) {
      case 'grade-based':
        const grades = goalConfig.targetGrades.join(', ');
        return `Only buy products with ${grades} sustainability rating (${goalConfig.percentage}% of purchases)`;
      
      case 'score-based':
        return `Only buy products with ${goalConfig.minimumScore}+ sustainability score (${goalConfig.percentage}% of purchases)`;
      
      case 'category-based':
        const categories = goalConfig.categories.join(', ');
        const categoryGrades = goalConfig.targetGrades ? goalConfig.targetGrades.join(', ') : 'A, B';
        return `Only buy ${categoryGrades} rated products in ${categories} (${goalConfig.percentage}% of purchases)`;
      
      default:
        return 'Custom sustainability goal';
    }
  }

  // Helper method to validate goal configuration
  static validateGoalConfig(goalType, goalConfig) {
    const errors = [];

    if (!goalConfig.percentage || goalConfig.percentage < 1 || goalConfig.percentage > 100) {
      errors.push('Goal percentage must be between 1 and 100');
    }

    switch (goalType) {
      case 'grade-based':
        if (!goalConfig.targetGrades || goalConfig.targetGrades.length === 0) {
          errors.push('At least one target grade must be selected');
        }
        break;
      
      case 'score-based':
        if (goalConfig.minimumScore === undefined || goalConfig.minimumScore < 0 || goalConfig.minimumScore > 100) {
          errors.push('Minimum score must be between 0 and 100');
        }
        break;
      
      case 'category-based':
        if (!goalConfig.categories || goalConfig.categories.length === 0) {
          errors.push('At least one category must be selected');
        }
        if (!goalConfig.targetGrades || goalConfig.targetGrades.length === 0) {
          errors.push('At least one target grade must be selected for category-based goals');
        }
        break;
      
      default:
        errors.push('Invalid goal type');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Helper method to get goal progress color
  static getGoalProgressColor(progressPercentage, targetPercentage) {
    const ratio = progressPercentage / targetPercentage;
    
    if (ratio >= 1) return '#4CAF50'; // Green - Achieved
    if (ratio >= 0.7) return '#FF9800'; // Orange - Close
    if (ratio >= 0.3) return '#2196F3'; // Blue - In Progress
    return '#9E9E9E'; // Gray - Starting
  }

  // Helper method to get goal progress status text
  static getGoalProgressStatus(progressPercentage, targetPercentage) {
    const ratio = progressPercentage / targetPercentage;
    
    if (ratio >= 1) return 'Achieved';
    if (ratio >= 0.7) return 'Almost There';
    if (ratio >= 0.3) return 'In Progress';
    return 'Getting Started';
  }
}

export default SustainabilityGoalService;
