import { API_BASE_URL } from '../config/api';

class RatingService {
  /**
   * Submit a product rating
   * @param {string} productId - Product ID
   * @param {string} orderId - Order ID
   * @param {number} rating - Rating from 1-5
   * @param {string} review - Optional review text
   * @param {string} token - Auth token
   */
  static async submitRating(productId, orderId, rating, review = '', token) {
    try {
      const response = await fetch(`${API_BASE_URL}/ratings/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          orderId,
          rating,
          review
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit rating');
      }

      return data;
    } catch (error) {
      console.error('Submit rating error:', error);
      throw error;
    }
  }

  /**
   * Get product ratings with pagination
   * @param {string} productId - Product ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   */
  static async getProductRatings(productId, page = 1, limit = 10) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/ratings/product/${productId}?page=${page}&limit=${limit}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get product ratings');
      }

      return data;
    } catch (error) {
      console.error('Get product ratings error:', error);
      throw error;
    }
  }

  /**
   * Get user's rating for a specific product
   * @param {string} productId - Product ID
   * @param {string} token - Auth token
   */
  static async getUserRating(productId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/ratings/user/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get user rating');
      }

      return data;
    } catch (error) {
      console.error('Get user rating error:', error);
      throw error;
    }
  }

  /**
   * Update user's rating
   * @param {string} ratingId - Rating ID
   * @param {number} rating - New rating from 1-5
   * @param {string} review - Optional review text
   * @param {string} token - Auth token
   */
  static async updateRating(ratingId, rating, review = '', token) {
    try {
      const response = await fetch(`${API_BASE_URL}/ratings/${ratingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating,
          review
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update rating');
      }

      return data;
    } catch (error) {
      console.error('Update rating error:', error);
      throw error;
    }
  }

  /**
   * Delete user's rating
   * @param {string} ratingId - Rating ID
   * @param {string} token - Auth token
   */
  static async deleteRating(ratingId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/ratings/${ratingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete rating');
      }

      return data;
    } catch (error) {
      console.error('Delete rating error:', error);
      throw error;
    }
  }

  /**
   * Get products that need rating (for post-purchase popup)
   * @param {string} token - Auth token
   */
  static async getPendingRatings(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/ratings/pending-ratings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get pending ratings');
      }

      return data;
    } catch (error) {
      console.error('Get pending ratings error:', error);
      throw error;
    }
  }

  /**
   * Format rating for display
   * @param {number} rating - Rating value
   * @param {number} totalRatings - Total number of ratings
   */
  static formatRating(rating, totalRatings = 0) {
    if (totalRatings === 0) {
      return { display: 'No ratings', stars: 0 };
    }

    const roundedRating = Math.round(rating * 10) / 10;
    const stars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return {
      display: `${roundedRating} (${totalRatings} ${totalRatings === 1 ? 'rating' : 'ratings'})`,
      stars,
      hasHalfStar,
      fullRating: roundedRating
    };
  }

  /**
   * Generate star display array
   * @param {number} rating - Rating value
   */
  static generateStars(rating) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }

    // Half star
    if (hasHalfStar) {
      stars.push('half');
    }

    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push('empty');
    }

    return stars;
  }
}

export default RatingService;
