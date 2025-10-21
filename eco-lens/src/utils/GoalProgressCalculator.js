/**
 * GoalProgressCalculator.js
 * Advanced utility for calculating sustainability goal progress with optimized algorithms
 */

/**
 * Core progress calculation algorithms
 */
export class GoalProgressCalculator {
  
  /**
   * Calculate comprehensive goal progress based on purchase history
   * @param {Object} goal - The sustainability goal object
   * @param {Array} purchaseHistory - Array of completed orders/purchases
   * @param {Object} options - Calculation options
   * @returns {Object} Detailed progress information
   */
  static calculateGoalProgress(goal, purchaseHistory = [], options = {}) {
    const {
      includePartialProgress = true,
      weightByPrice = false,
      weightByQuantity = true,
      includeProjections = false,
      timeframe = null, // null = all time, or { start: Date, end: Date }
    } = options;

    // Filter purchases by timeframe if specified
    const filteredPurchases = timeframe 
      ? purchaseHistory.filter(purchase => {
          const purchaseDate = new Date(purchase.createdAt || purchase.paidAt);
          return purchaseDate >= timeframe.start && purchaseDate <= timeframe.end;
        })
      : purchaseHistory;

    // Initialize progress tracking
    const progress = {
      totalItems: 0,
      goalMetItems: 0,
      totalValue: 0,
      goalMetValue: 0,
      totalPurchases: filteredPurchases.length,
      goalMetPurchases: 0,
      currentPercentage: 0,
      targetPercentage: goal.goalConfig?.percentage || 100,
      isAchieved: false,
      progressStatus: 'not_started',
      breakdown: {
        byCategory: {},
        byGrade: {},
        byScore: {},
        byTimeMonth: {},
      },
      streaks: {
        current: 0,
        longest: 0,
        recent: []
      },
      insights: []
    };

    // Process each purchase
    filteredPurchases.forEach((purchase, index) => {
      let purchaseMetGoal = false;
      const purchaseDate = new Date(purchase.createdAt || purchase.paidAt);
      const monthKey = `${purchaseDate.getFullYear()}-${String(purchaseDate.getMonth() + 1).padStart(2, '0')}`;

      // Initialize monthly tracking
      if (!progress.breakdown.byTimeMonth[monthKey]) {
        progress.breakdown.byTimeMonth[monthKey] = { total: 0, goalMet: 0 };
      }

      // Process items in this purchase
      (purchase.items || []).forEach(item => {
        const product = item.product || item;
        const quantity = weightByQuantity ? (item.quantity || 1) : 1;
        const price = weightByPrice ? (item.price || product.price || 0) : 0;

        progress.totalItems += quantity;
        progress.totalValue += price * quantity;
        progress.breakdown.byTimeMonth[monthKey].total += quantity;

        // Check if item meets goal criteria
        const meetsGoal = this.checkProductAlignment(product, goal);
        
        if (meetsGoal) {
          progress.goalMetItems += quantity;
          progress.goalMetValue += price * quantity;
          progress.breakdown.byTimeMonth[monthKey].goalMet += quantity;
          purchaseMetGoal = true;

          // Track by category
          const category = product.category || 'Unknown';
          progress.breakdown.byCategory[category] = (progress.breakdown.byCategory[category] || 0) + quantity;

          // Track by grade
          const grade = product.sustainabilityGrade || 'Unknown';
          progress.breakdown.byGrade[grade] = (progress.breakdown.byGrade[grade] || 0) + quantity;

          // Track by score range
          const score = product.sustainabilityScore || 0;
          const scoreRange = this.getScoreRange(score);
          progress.breakdown.byScore[scoreRange] = (progress.breakdown.byScore[scoreRange] || 0) + quantity;
        }
      });

      // Track purchase-level goal alignment
      if (purchaseMetGoal) {
        progress.goalMetPurchases++;
      }

      // Update streaks
      this.updateStreaks(progress.streaks, purchaseMetGoal, index === filteredPurchases.length - 1);
    });

    // Calculate percentages
    if (progress.totalItems > 0) {
      progress.currentPercentage = (progress.goalMetItems / progress.totalItems) * 100;
    }

    // Determine achievement status
    progress.isAchieved = progress.currentPercentage >= progress.targetPercentage;
    progress.progressStatus = this.determineProgressStatus(
      progress.currentPercentage, 
      progress.targetPercentage,
      progress.totalItems
    );

    // Generate insights
    progress.insights = this.generateProgressInsights(progress, goal, filteredPurchases);

    // Add projections if requested
    if (includeProjections && filteredPurchases.length > 0) {
      progress.projections = this.calculateProjections(progress, goal, filteredPurchases);
    }

    return progress;
  }

  /**
   * Check if a product aligns with a specific goal
   * @param {Object} product - Product to check
   * @param {Object} goal - Goal to check against
   * @returns {boolean} Whether product meets goal criteria
   */
  static checkProductAlignment(product, goal) {
    if (!product || !goal) return false;

    switch (goal.goalType) {
      case 'grade_based':
      case 'grade-based':
        return this.checkGradeAlignment(product, goal.goalConfig);
      
      case 'score_based':
      case 'score-based':
        return this.checkScoreAlignment(product, goal.goalConfig);
      
      case 'category_based':
      case 'category-based':
        return this.checkCategoryAlignment(product, goal.goalConfig);
      
      default:
        return false;
    }
  }

  /**
   * Update goal progress with new purchase data
   * @param {Object} currentProgress - Current progress state
   * @param {Object} newPurchase - New purchase to add
   * @param {Object} goal - The goal being tracked
   * @returns {Object} Updated progress
   */
  static updateGoalProgress(currentProgress, newPurchase, goal) {
    // Create a minimal purchase history with just the new purchase
    const newPurchaseHistory = [newPurchase];
    
    // Calculate progress for just the new purchase
    const newProgress = this.calculateGoalProgress(goal, newPurchaseHistory);
    
    // Merge with current progress
    const updatedProgress = {
      ...currentProgress,
      totalItems: currentProgress.totalItems + newProgress.totalItems,
      goalMetItems: currentProgress.goalMetItems + newProgress.goalMetItems,
      totalValue: currentProgress.totalValue + newProgress.totalValue,
      goalMetValue: currentProgress.goalMetValue + newProgress.goalMetValue,
      totalPurchases: currentProgress.totalPurchases + 1,
      goalMetPurchases: currentProgress.goalMetPurchases + newProgress.goalMetPurchases,
    };

    // Recalculate percentage
    if (updatedProgress.totalItems > 0) {
      updatedProgress.currentPercentage = (updatedProgress.goalMetItems / updatedProgress.totalItems) * 100;
    }

    // Update achievement status
    updatedProgress.isAchieved = updatedProgress.currentPercentage >= updatedProgress.targetPercentage;
    updatedProgress.progressStatus = this.determineProgressStatus(
      updatedProgress.currentPercentage,
      updatedProgress.targetPercentage,
      updatedProgress.totalItems
    );

    return updatedProgress;
  }

  /**
   * Batch calculate progress for multiple goals
   * @param {Array} goals - Array of goals to calculate
   * @param {Array} purchaseHistory - Complete purchase history
   * @param {Object} options - Calculation options
   * @returns {Map} Map of goalId -> progress
   */
  static batchCalculateProgress(goals, purchaseHistory, options = {}) {
    const progressMap = new Map();
    
    goals.forEach(goal => {
      const progress = this.calculateGoalProgress(goal, purchaseHistory, options);
      progressMap.set(goal._id, progress);
    });

    return progressMap;
  }

  /**
   * Calculate goal achievement projections
   * @param {Object} progress - Current progress
   * @param {Object} goal - The goal
   * @param {Array} purchaseHistory - Purchase history for trend analysis
   * @returns {Object} Projection data
   */
  static calculateProjections(progress, goal, purchaseHistory) {
    if (purchaseHistory.length < 2) {
      return { insufficient_data: true };
    }

    // Analyze recent trends (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentPurchases = purchaseHistory.filter(purchase => 
      new Date(purchase.createdAt || purchase.paidAt) >= thirtyDaysAgo
    );

    const recentProgress = this.calculateGoalProgress(goal, recentPurchases);
    
    // Calculate trends
    const projections = {
      trend: 'stable',
      estimatedTimeToGoal: null,
      confidenceLevel: 'low',
      suggestions: []
    };

    if (recentProgress.totalItems > 0) {
      const recentSuccessRate = recentProgress.currentPercentage;
      const overallSuccessRate = progress.currentPercentage;
      
      // Determine trend
      if (recentSuccessRate > overallSuccessRate + 5) {
        projections.trend = 'improving';
        projections.confidenceLevel = 'medium';
      } else if (recentSuccessRate < overallSuccessRate - 5) {
        projections.trend = 'declining';
        projections.confidenceLevel = 'medium';
      }

      // Estimate time to goal if trending upward
      if (projections.trend === 'improving' && !progress.isAchieved) {
        const remainingProgress = progress.targetPercentage - progress.currentPercentage;
        const recentImprovementRate = recentSuccessRate - overallSuccessRate;
        
        if (recentImprovementRate > 0) {
          projections.estimatedTimeToGoal = Math.ceil(remainingProgress / recentImprovementRate * 30); // days
          projections.confidenceLevel = 'high';
        }
      }
    }

    return projections;
  }

  // Private helper methods

  static checkGradeAlignment(product, goalConfig) {
    const productGrade = product.sustainabilityGrade;
    return goalConfig.targetGrades && goalConfig.targetGrades.includes(productGrade);
  }

  static checkScoreAlignment(product, goalConfig) {
    const productScore = product.sustainabilityScore || 0;
    return productScore >= (goalConfig.minimumScore || 0);
  }

  static checkCategoryAlignment(product, goalConfig) {
    const productCategory = product.category;
    const categoryMatch = goalConfig.targetCategories && 
                         goalConfig.targetCategories.includes(productCategory);
    
    // Also check grade requirements for category-based goals
    if (categoryMatch && goalConfig.targetGrades) {
      return goalConfig.targetGrades.includes(product.sustainabilityGrade);
    }
    
    return categoryMatch;
  }

  static getScoreRange(score) {
    if (score >= 90) return '90-100';
    if (score >= 80) return '80-89';
    if (score >= 70) return '70-79';
    if (score >= 60) return '60-69';
    if (score >= 50) return '50-59';
    return '0-49';
  }

  static updateStreaks(streaks, purchaseMetGoal, isLastPurchase) {
    if (purchaseMetGoal) {
      streaks.current++;
      streaks.recent.unshift(true);
    } else {
      if (streaks.current > streaks.longest) {
        streaks.longest = streaks.current;
      }
      streaks.current = 0;
      streaks.recent.unshift(false);
    }

    // Keep only last 10 purchases in recent
    if (streaks.recent.length > 10) {
      streaks.recent = streaks.recent.slice(0, 10);
    }

    // Update longest streak if this is the last purchase
    if (isLastPurchase && streaks.current > streaks.longest) {
      streaks.longest = streaks.current;
    }
  }

  static determineProgressStatus(currentPercentage, targetPercentage, totalItems) {
    if (totalItems === 0) return 'not_started';
    if (currentPercentage >= targetPercentage) return 'achieved';
    if (currentPercentage >= targetPercentage * 0.8) return 'almost_there';
    if (currentPercentage >= targetPercentage * 0.5) return 'on_track';
    if (currentPercentage >= targetPercentage * 0.25) return 'getting_started';
    return 'needs_improvement';
  }

  static generateProgressInsights(progress, goal, purchaseHistory) {
    const insights = [];

    // Achievement insight
    if (progress.isAchieved) {
      insights.push({
        type: 'achievement',
        message: `🎉 Congratulations! You've achieved your goal of ${progress.targetPercentage}% sustainable purchases.`,
        priority: 'high'
      });
    }

    // Streak insights
    if (progress.streaks.current >= 3) {
      insights.push({
        type: 'streak',
        message: `🔥 Great job! You're on a ${progress.streaks.current}-purchase sustainability streak.`,
        priority: 'medium'
      });
    }

    // Progress insights
    if (!progress.isAchieved) {
      const remaining = progress.targetPercentage - progress.currentPercentage;
      if (remaining <= 10) {
        insights.push({
          type: 'almost_there',
          message: `⭐ You're almost there! Just ${remaining.toFixed(1)}% more to reach your goal.`,
          priority: 'medium'
        });
      }
    }

    // Category insights
    const topCategory = Object.entries(progress.breakdown.byCategory)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topCategory) {
      insights.push({
        type: 'category',
        message: `📊 Your most sustainable category is ${topCategory[0]} with ${topCategory[1]} goal-aligned purchases.`,
        priority: 'low'
      });
    }

    // Improvement suggestions
    if (progress.currentPercentage < progress.targetPercentage * 0.5) {
      insights.push({
        type: 'suggestion',
        message: `💡 Try focusing on ${goal.goalType.replace('_', ' ')} products to improve your progress faster.`,
        priority: 'medium'
      });
    }

    return insights;
  }
}

/**
 * Specialized calculators for different goal types
 */
export class GradeBasedCalculator extends GoalProgressCalculator {
  static calculateProgress(goal, purchaseHistory, options = {}) {
    const progress = super.calculateGoalProgress(goal, purchaseHistory, options);
    
    // Add grade-specific insights
    const gradeDistribution = progress.breakdown.byGrade;
    const targetGrades = goal.goalConfig.targetGrades || [];
    
    progress.gradeSpecificInsights = targetGrades.map(grade => ({
      grade,
      count: gradeDistribution[grade] || 0,
      percentage: progress.totalItems > 0 ? ((gradeDistribution[grade] || 0) / progress.totalItems * 100) : 0
    }));

    return progress;
  }
}

export class ScoreBasedCalculator extends GoalProgressCalculator {
  static calculateProgress(goal, purchaseHistory, options = {}) {
    const progress = super.calculateGoalProgress(goal, purchaseHistory, options);
    
    // Add score-specific insights
    const minimumScore = goal.goalConfig.minimumScore || 0;
    let totalScore = 0;
    let scoredItems = 0;

    purchaseHistory.forEach(purchase => {
      (purchase.items || []).forEach(item => {
        const product = item.product || item;
        if (product.sustainabilityScore) {
          totalScore += product.sustainabilityScore * (item.quantity || 1);
          scoredItems += (item.quantity || 1);
        }
      });
    });

    progress.scoreSpecificInsights = {
      averageScore: scoredItems > 0 ? totalScore / scoredItems : 0,
      minimumRequired: minimumScore,
      scoreDistribution: progress.breakdown.byScore
    };

    return progress;
  }
}

export class CategoryBasedCalculator extends GoalProgressCalculator {
  static calculateProgress(goal, purchaseHistory, options = {}) {
    const progress = super.calculateGoalProgress(goal, purchaseHistory, options);
    
    // Add category-specific insights
    const targetCategories = goal.goalConfig.targetCategories || [];
    
    progress.categorySpecificInsights = {
      targetCategories,
      categoryPerformance: targetCategories.map(category => ({
        category,
        totalPurchases: progress.breakdown.byCategory[category] || 0,
        percentage: progress.totalItems > 0 ? ((progress.breakdown.byCategory[category] || 0) / progress.totalItems * 100) : 0
      }))
    };

    return progress;
  }
}

/**
 * Utility functions for progress calculations
 */
export const ProgressUtils = {
  
  /**
   * Format progress percentage for display
   */
  formatPercentage: (percentage, decimals = 1) => {
    return `${percentage.toFixed(decimals)}%`;
  },

  /**
   * Get progress color based on percentage
   */
  getProgressColor: (currentPercentage, targetPercentage, colorScheme = 'default') => {
    const ratio = currentPercentage / targetPercentage;
    
    const schemes = {
      default: {
        achieved: '#4CAF50',
        high: '#8BC34A',
        medium: '#FFC107',
        low: '#FF9800',
        critical: '#F44336'
      },
      eco: {
        achieved: '#2E7D32',
        high: '#388E3C',
        medium: '#689F38',
        low: '#AFD135',
        critical: '#FF8F00'
      }
    };

    const colors = schemes[colorScheme] || schemes.default;

    if (ratio >= 1) return colors.achieved;
    if (ratio >= 0.8) return colors.high;
    if (ratio >= 0.5) return colors.medium;
    if (ratio >= 0.25) return colors.low;
    return colors.critical;
  },

  /**
   * Calculate goal difficulty score
   */
  calculateDifficulty: (goal, averageMarketData = {}) => {
    // This would ideally use market data to determine how challenging a goal is
    // For now, we'll use basic heuristics
    
    let difficulty = 1; // 1 = easy, 5 = very hard

    switch (goal.goalType) {
      case 'grade_based':
        const hasStrictGrades = goal.goalConfig.targetGrades?.includes('A');
        difficulty = hasStrictGrades ? 4 : 2;
        break;
      
      case 'score_based':
        const highScore = goal.goalConfig.minimumScore >= 80;
        difficulty = highScore ? 4 : 2;
        break;
      
      case 'category_based':
        const restrictiveCategory = goal.goalConfig.targetCategories?.length === 1;
        difficulty = restrictiveCategory ? 3 : 2;
        break;
    }

    // Adjust for percentage target
    const highPercentage = goal.goalConfig.percentage >= 80;
    if (highPercentage) difficulty = Math.min(5, difficulty + 1);

    return difficulty;
  },

  /**
   * Generate progress comparison data
   */
  compareProgress: (currentProgress, previousPeriodProgress) => {
    if (!previousPeriodProgress) return null;

    return {
      percentageChange: currentProgress.currentPercentage - previousPeriodProgress.currentPercentage,
      itemsChange: currentProgress.goalMetItems - previousPeriodProgress.goalMetItems,
      trend: currentProgress.currentPercentage > previousPeriodProgress.currentPercentage ? 'improving' : 'declining'
    };
  }
};

export default GoalProgressCalculator;
