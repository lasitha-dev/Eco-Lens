import { API_BASE_URL } from '../config/api';
import AuthService from '../api/authService';

/**
 * Enhanced API client with automatic token refresh
 * Intercepts 401 errors and attempts to refresh the access token
 */
class ApiClient {
  static isRefreshing = false;
  static failedQueue = [];

  /**
   * Process queued requests after token refresh
   */
  static processQueue(error, token = null) {
    this.failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });

    this.failedQueue = [];
  }

  /**
   * Enhanced fetch with automatic token refresh on 401
   * @param {string} url - API endpoint URL
   * @param {Object} options - Fetch options
   * @param {boolean} retry - Internal flag to prevent infinite retry loop
   * @returns {Promise<Response>}
   */
  static async fetch(url, options = {}, retry = true) {
    try {
      const response = await fetch(url, options);

      // If 401 and we haven't retried yet, attempt token refresh
      if (response.status === 401 && retry) {
        if (this.isRefreshing) {
          // Token refresh already in progress, queue this request
          return new Promise((resolve, reject) => {
            this.failedQueue.push({
              resolve: (token) => {
                // Retry original request with new token
                const newOptions = {
                  ...options,
                  headers: {
                    ...options.headers,
                    'Authorization': `Bearer ${token}`
                  }
                };
                resolve(this.fetch(url, newOptions, false));
              },
              reject: (err) => {
                reject(err);
              }
            });
          });
        }

        this.isRefreshing = true;

        try {
          // Attempt to refresh the token
          const newToken = await AuthService.refreshAccessToken();
          
          // Update the request with new token
          const newOptions = {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${newToken}`
            }
          };

          // Process queued requests
          this.processQueue(null, newToken);
          this.isRefreshing = false;

          // Retry original request with new token
          return await this.fetch(url, newOptions, false);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          
          // Clear auth and process queue with error
          await AuthService.clearAuth();
          this.processQueue(refreshError, null);
          this.isRefreshing = false;

          // Return original 401 response
          return response;
        }
      }

      return response;
    } catch (error) {
      console.error('API Client error:', error);
      throw error;
    }
  }

  /**
   * GET request with automatic token refresh
   */
  static async get(endpoint, options = {}) {
    const headers = await AuthService.getAuthHeaders();
    return this.fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: { ...headers, ...options.headers },
      ...options
    });
  }

  /**
   * POST request with automatic token refresh
   */
  static async post(endpoint, body, options = {}) {
    const headers = await AuthService.getAuthHeaders();
    return this.fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { ...headers, ...options.headers },
      body: JSON.stringify(body),
      ...options
    });
  }

  /**
   * PATCH request with automatic token refresh
   */
  static async patch(endpoint, body, options = {}) {
    const headers = await AuthService.getAuthHeaders();
    return this.fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: { ...headers, ...options.headers },
      body: JSON.stringify(body),
      ...options
    });
  }

  /**
   * PUT request with automatic token refresh
   */
  static async put(endpoint, body, options = {}) {
    const headers = await AuthService.getAuthHeaders();
    return this.fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { ...headers, ...options.headers },
      body: JSON.stringify(body),
      ...options
    });
  }

  /**
   * DELETE request with automatic token refresh
   */
  static async delete(endpoint, options = {}) {
    const headers = await AuthService.getAuthHeaders();
    return this.fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: { ...headers, ...options.headers },
      ...options
    });
  }
}

export default ApiClient;
