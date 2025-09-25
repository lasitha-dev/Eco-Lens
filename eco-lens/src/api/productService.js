import { API_BASE_URL } from '../config/api';
import { showNetworkTroubleshootingTips } from '../utils/networkUtils';
import AuthService from './authService';

class ProductService {
  // Get all products with filtering and pagination
  static async getProducts(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const url = `${API_BASE_URL}/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log(`Fetching products from: ${url}`);
      
      const headers = await AuthService.getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch products`);
      }
      
      const data = await response.json();
      console.log(`✅ Successfully fetched ${data.products?.length || 0} products`);
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // Provide helpful network troubleshooting info
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        console.log('Network troubleshooting tips:', showNetworkTroubleshootingTips());
        throw new Error('Unable to connect to server. Please check your network connection and ensure your device and computer are on the same WiFi network.');
      }
      
      throw error;
    }
  }

  // Get single product by ID
  static async getProduct(id) {
    try {
      console.log(`Fetching product by ID: ${id}`);
      
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch product`);
      }
      
      const data = await response.json();
      console.log(`✅ Successfully fetched product: ${data.name}`);
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        console.log('Network troubleshooting tips:', showNetworkTroubleshootingTips());
        throw new Error('Unable to connect to server. Please check your network connection.');
      }
      
      throw error;
    }
  }

  // Create new product (admin only)
  static async createProduct(productData) {
    try {
      console.log(`Creating new product: ${productData.name}`);
      
      const headers = await AuthService.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to create product`);
      }

      const data = await response.json();
      console.log(`✅ Successfully created product: ${data.product?.name} (ID: ${data.product?.id})`);
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        console.log('Network troubleshooting tips:', showNetworkTroubleshootingTips());
        throw new Error('Unable to connect to server. Please check your network connection.');
      }
      
      throw error;
    }
  }

  // Update existing product (admin only)
  static async updateProduct(id, productData) {
    try {
      console.log(`Updating product: ${id}`);
      
      const headers = await AuthService.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to update product`);
      }

      const data = await response.json();
      console.log(`✅ Successfully updated product: ${data.product?.name} (ID: ${id})`);
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        console.log('Network troubleshooting tips:', showNetworkTroubleshootingTips());
        throw new Error('Unable to connect to server. Please check your network connection.');
      }
      
      throw error;
    }
  }

  // Delete product (admin only)
  static async deleteProduct(id) {
    try {
      console.log(`Deleting product: ${id}`);
      
      const headers = await AuthService.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to delete product`);
      }

      const data = await response.json();
      console.log(`✅ Successfully deleted product (ID: ${id})`);
      return data;
    } catch (error) {
      console.error('Error deleting product:', error);
      
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        console.log('Network troubleshooting tips:', showNetworkTroubleshootingTips());
        throw new Error('Unable to connect to server. Please check your network connection.');
      }
      
      throw error;
    }
  }

  // Bulk create products (admin only)
  static async bulkCreateProducts(products) {
    try {
      console.log(`Bulk creating ${products.length} products`);
      
      const headers = await AuthService.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/products/bulk`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ products }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to create products`);
      }

      const data = await response.json();
      console.log(`✅ Successfully bulk created ${data.count} products`);
      return data;
    } catch (error) {
      console.error('Error bulk creating products:', error);
      
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        console.log('Network troubleshooting tips:', showNetworkTroubleshootingTips());
        throw new Error('Unable to connect to server. Please check your network connection.');
      }
      
      throw error;
    }
  }

  // Get product statistics for admin dashboard (admin only)
  static async getProductStats() {
    try {
      console.log('Fetching product statistics');
      
      const headers = await AuthService.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/products/stats/summary`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch product statistics`);
      }
      
      const data = await response.json();
      console.log('✅ Successfully fetched product statistics');
      return data;
    } catch (error) {
      console.error('Error fetching product statistics:', error);
      
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        console.log('Network troubleshooting tips:', showNetworkTroubleshootingTips());
        throw new Error('Unable to connect to server. Please check your network connection.');
      }
      
      throw error;
    }
  }

  // Helper method to check if backend is available
  static async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/products/stats/summary`);
      return response.ok;
    } catch (error) {
      console.error('Product service health check failed:', error);
      return false;
    }
  }

  // Helper method to seed mock data (for development/testing)
  static async seedMockData(mockProducts) {
    try {
      console.log('Seeding mock data to backend...');
      
      // Transform mock products to match backend schema
      const transformedProducts = mockProducts.map(product => ({
        ...product,
        // Remove the string ID if it exists, let backend generate it
        _id: undefined,
        id: undefined
      }));

      const result = await this.bulkCreateProducts(transformedProducts);
      console.log(`✅ Successfully seeded ${result.count} products to backend`);
      return result;
    } catch (error) {
      console.error('Error seeding mock data:', error);
      throw error;
    }
  }
}

export default ProductService;