const ProductRating = require('../models/ProductRating');
const Product = require('../models/Product');
const mongoose = require('mongoose');

class RatingCalculationService {
  /**
   * Calculate and update rating statistics for a product
   * @param {string} productId - Product ID
   */
  static async updateProductRatingStats(productId) {
    try {
      console.log(`Calculating rating stats for product: ${productId}`);

      // Get all visible ratings for the product
      const ratings = await ProductRating.find({
        product: productId,
        isVisible: true
      });

      if (ratings.length === 0) {
        // No ratings, reset to default values
        await Product.findByIdAndUpdate(productId, {
          $set: {
            rating: 0,
            reviewCount: 0,
            'ratingStats.averageRating': 0,
            'ratingStats.totalRatings': 0,
            'ratingStats.ratingDistribution': { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
            'ratingStats.lastUpdated': new Date()
          }
        });
        console.log(`Reset rating stats for product ${productId} (no ratings)`);
        return;
      }

      // Calculate statistics
      const totalRatings = ratings.length;
      const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
      const averageRating = Math.round((sum / totalRatings) * 10) / 10; // Round to 1 decimal

      // Calculate rating distribution
      const distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
      ratings.forEach(rating => {
        distribution[rating.rating.toString()]++;
      });

      // Update product with new statistics
      await Product.findByIdAndUpdate(productId, {
        $set: {
          rating: averageRating,
          reviewCount: totalRatings,
          'ratingStats.averageRating': averageRating,
          'ratingStats.totalRatings': totalRatings,
          'ratingStats.ratingDistribution': distribution,
          'ratingStats.lastUpdated': new Date()
        }
      });

      console.log(`Updated rating stats for product ${productId}:`, {
        averageRating,
        totalRatings,
        distribution
      });

      return {
        averageRating,
        totalRatings,
        distribution
      };

    } catch (error) {
      console.error(`Error updating rating stats for product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate rating statistics for multiple products
   * @param {Array} productIds - Array of product IDs
   */
  static async updateMultipleProductRatingStats(productIds) {
    try {
      const results = [];
      
      for (const productId of productIds) {
        const result = await this.updateProductRatingStats(productId);
        results.push({ productId, ...result });
      }

      return results;
    } catch (error) {
      console.error('Error updating multiple product rating stats:', error);
      throw error;
    }
  }

  /**
   * Get rating statistics for a product
   * @param {string} productId - Product ID
   */
  static async getProductRatingStats(productId) {
    try {
      const stats = await ProductRating.calculateAverageRating(productId);
      return stats;
    } catch (error) {
      console.error(`Error getting rating stats for product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Get top-rated products
   * @param {number} limit - Number of products to return
   * @param {number} minRatings - Minimum number of ratings required
   */
  static async getTopRatedProducts(limit = 10, minRatings = 1) {
    try {
      const products = await Product.find({
        isActive: true,
        'ratingStats.totalRatings': { $gte: minRatings }
      })
      .sort({ 'ratingStats.averageRating': -1, 'ratingStats.totalRatings': -1 })
      .limit(limit)
      .select('name image price rating ratingStats category sustainabilityGrade');

      return products;
    } catch (error) {
      console.error('Error getting top-rated products:', error);
      throw error;
    }
  }

  /**
   * Get products with low ratings (for improvement suggestions)
   * @param {number} maxRating - Maximum rating to consider as "low"
   * @param {number} minRatings - Minimum number of ratings required
   * @param {number} limit - Number of products to return
   */
  static async getLowRatedProducts(maxRating = 3, minRatings = 5, limit = 10) {
    try {
      const products = await Product.find({
        isActive: true,
        'ratingStats.averageRating': { $lte: maxRating },
        'ratingStats.totalRatings': { $gte: minRatings }
      })
      .sort({ 'ratingStats.averageRating': 1, 'ratingStats.totalRatings': -1 })
      .limit(limit)
      .select('name image price rating ratingStats category sustainabilityGrade');

      return products;
    } catch (error) {
      console.error('Error getting low-rated products:', error);
      throw error;
    }
  }

  /**
   * Get rating trends for analytics
   * @param {number} days - Number of days to look back
   */
  static async getRatingTrends(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const trends = await ProductRating.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            isVisible: true
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              rating: '$rating'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.date',
            ratings: {
              $push: {
                rating: '$_id.rating',
                count: '$count'
              }
            },
            totalRatings: { $sum: '$count' }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ]);

      return trends;
    } catch (error) {
      console.error('Error getting rating trends:', error);
      throw error;
    }
  }

  /**
   * Calculate user's rating contribution score
   * @param {string} userId - User ID
   */
  static async getUserRatingContribution(userId) {
    try {
      const userRatings = await ProductRating.find({
        user: userId,
        isVisible: true
      }).populate('product', 'name category');

      const totalRatings = userRatings.length;
      const averageRating = totalRatings > 0 
        ? userRatings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings 
        : 0;

      const ratingDistribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
      userRatings.forEach(rating => {
        ratingDistribution[rating.rating.toString()]++;
      });

      return {
        totalRatings,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
        ratings: userRatings
      };
    } catch (error) {
      console.error(`Error getting user rating contribution for ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Recalculate all product ratings (for maintenance)
   */
  static async recalculateAllProductRatings() {
    try {
      console.log('Starting recalculation of all product ratings...');
      
      const products = await Product.find({ isActive: true }).select('_id');
      const productIds = products.map(p => p._id);
      
      const results = await this.updateMultipleProductRatingStats(productIds);
      
      console.log(`Recalculation complete. Updated ${results.length} products.`);
      return results;
    } catch (error) {
      console.error('Error recalculating all product ratings:', error);
      throw error;
    }
  }
}

module.exports = RatingCalculationService;
