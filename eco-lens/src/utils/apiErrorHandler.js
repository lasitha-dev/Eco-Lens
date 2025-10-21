import AuthService from '../api/authService';

/**
 * Centralized API error handler
 * Handles common errors like token expiration and network issues
 */
class ApiErrorHandler {
  /**
   * Handle fetch response and check for auth errors
   * @param {Response} response - Fetch API response
   * @param {Function} onUnauthorized - Callback when 401 is detected
   * @returns {Promise<Response>}
   */
  static async handleResponse(response, onUnauthorized = null) {
    // Handle 401 Unauthorized - Token expired or invalid
    if (response.status === 401) {
      console.log('⚠️ Authentication error detected - clearing stored credentials');
      
      // Clear stored authentication
      await AuthService.clearAuth();
      
      // Call the unauthorized callback if provided
      if (onUnauthorized && typeof onUnauthorized === 'function') {
        onUnauthorized();
      }
      
      // Return the response so the caller can handle the error appropriately
      return response;
    }
    
    return response;
  }

  /**
   * Wrapper for fetch that automatically handles auth errors
   * @param {string} url - API endpoint URL
   * @param {Object} options - Fetch options
   * @param {Function} onUnauthorized - Callback when 401 is detected
   * @returns {Promise<Response>}
   */
  static async fetchWithErrorHandling(url, options = {}, onUnauthorized = null) {
    try {
      const response = await fetch(url, options);
      return await this.handleResponse(response, onUnauthorized);
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  /**
   * Check if error is a token expiration error
   * @param {Error} error - Error object
   * @returns {boolean}
   */
  static isTokenExpiredError(error) {
    if (!error) return false;
    
    const message = error.message?.toLowerCase() || '';
    return (
      message.includes('token expired') ||
      message.includes('session has expired') ||
      message.includes('invalid token')
    );
  }

  /**
   * Handle API errors with user-friendly messages
   * @param {Error} error - Error object
   * @returns {string} User-friendly error message
   */
  static getUserFriendlyMessage(error) {
    if (!error) return 'An unexpected error occurred';
    
    if (this.isTokenExpiredError(error)) {
      return 'Your session has expired. Please log in again.';
    }
    
    if (error.message?.includes('Network request failed') || 
        error.message?.includes('Failed to fetch')) {
      return 'Unable to connect to server. Please check your internet connection.';
    }
    
    return error.message || 'An unexpected error occurred';
  }
}

export default ApiErrorHandler;
