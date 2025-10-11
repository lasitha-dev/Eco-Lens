/**
 * Sustainability Goals Service
 * Handles sustainability goals-related API calls
 */

import { API_BASE_URL } from '../config/api';
import GoalProgressCalculator, { 
  GradeBasedCalculator, 
  ScoreBasedCalculator, 
  CategoryBasedCalculator,
  ProgressUtils 
} from '../utils/GoalProgressCalculator';

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
      // Use the advanced calculator for product alignment checking
      const meetsGoal = GoalProgressCalculator.checkProductAlignment(product, goal);
      
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
      matchingGoals,
      totalGoals: activeGoals.length,
      alignmentPercentage: (matchingGoals.length / activeGoals.length) * 100
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
    // Use the advanced progress utilities for better color calculation
    return ProgressUtils.getProgressColor(progressPercentage, targetPercentage, 'eco');
  }

  // Helper method to get goal progress status text
  static getGoalProgressStatus(progressPercentage, targetPercentage) {
    const ratio = progressPercentage / targetPercentage;
    
    if (ratio >= 1) return 'Achieved';
    if (ratio >= 0.7) return 'Almost There';
    if (ratio >= 0.3) return 'In Progress';
    return 'Getting Started';
  }

  // Advanced Progress Calculation Methods using GoalProgressCalculator

  /**
   * Calculate comprehensive progress for a goal using purchase history
   * @param {Object} goal - The goal to calculate progress for
   * @param {Array} purchaseHistory - Array of completed orders
   * @param {Object} options - Calculation options
   * @returns {Object} Detailed progress information
   */
  static calculateAdvancedProgress(goal, purchaseHistory, options = {}) {
    try {
      // Use specialized calculators based on goal type
      switch (goal.goalType) {
        case 'grade_based':
        case 'grade-based':
          return GradeBasedCalculator.calculateProgress(goal, purchaseHistory, options);
        
        case 'score_based':  
        case 'score-based':
          return ScoreBasedCalculator.calculateProgress(goal, purchaseHistory, options);
        
        case 'category_based':
        case 'category-based':
          return CategoryBasedCalculator.calculateProgress(goal, purchaseHistory, options);
        
        default:
          return GoalProgressCalculator.calculateGoalProgress(goal, purchaseHistory, options);
      }
    } catch (error) {
      console.error('Error calculating advanced progress:', error);
      return null;
    }
  }

  /**
   * Batch calculate progress for multiple goals
   * @param {Array} goals - Array of goals
   * @param {Array} purchaseHistory - Purchase history
   * @param {Object} options - Calculation options
   * @returns {Map} Map of goalId -> progress
   */
  static batchCalculateProgress(goals, purchaseHistory, options = {}) {
    try {
      return GoalProgressCalculator.batchCalculateProgress(goals, purchaseHistory, options);
    } catch (error) {
      console.error('Error in batch progress calculation:', error);
      return new Map();
    }
  }

  /**
   * Update goal progress with new purchase
   * @param {Object} currentProgress - Current progress state
   * @param {Object} newPurchase - New purchase data
   * @param {Object} goal - The goal being tracked
   * @returns {Object} Updated progress
   */
  static updateProgressWithPurchase(currentProgress, newPurchase, goal) {
    try {
      return GoalProgressCalculator.updateGoalProgress(currentProgress, newPurchase, goal);
    } catch (error) {
      console.error('Error updating progress with purchase:', error);
      return currentProgress;
    }
  }

  /**
   * Get goal difficulty assessment
   * @param {Object} goal - The goal to assess
   * @param {Object} marketData - Optional market data for context
   * @returns {number} Difficulty score (1-5)
   */
  static assessGoalDifficulty(goal, marketData = {}) {
    try {
      return ProgressUtils.calculateDifficulty(goal, marketData);
    } catch (error) {
      console.error('Error assessing goal difficulty:', error);
      return 2; // Default medium difficulty
    }
  }

  /**
   * Compare progress between two time periods
   * @param {Object} currentProgress - Current progress
   * @param {Object} previousProgress - Previous period progress
   * @returns {Object} Comparison data
   */
  static compareProgress(currentProgress, previousProgress) {
    try {
      return ProgressUtils.compareProgress(currentProgress, previousProgress);
    } catch (error) {
      console.error('Error comparing progress:', error);
      return null;
    }
  }

  /**
   * Generate progress projections for a goal
   * @param {Object} goal - The goal
   * @param {Array} purchaseHistory - Purchase history for trend analysis
   * @returns {Object} Projection data
   */
  static generateProgressProjections(goal, purchaseHistory) {
    try {
      const progress = this.calculateAdvancedProgress(goal, purchaseHistory, { includeProjections: true });
      return progress?.projections || null;
    } catch (error) {
      console.error('Error generating progress projections:', error);
      return null;
    }
  }
}

export default SustainabilityGoalService;
