// Use your computer's IP address instead of localhost for mobile testing
const API_BASE_URL = 'http://192.168.8.153:4000/api';

export const api = {
  // Test connection
  testConnection: async () => {
    try {
      console.log('Testing connection to:', API_BASE_URL);
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      const data = await response.json();
      console.log('Health check response:', data);
      return data;
    } catch (error) {
      console.error('Connection test error:', error);
      throw error;
    }
  },

  // Register a new user
  register: async (userData) => {
    console.log('HI - API register function called!');
    try {
      console.log('=== API REGISTER CALL ===');
      console.log('Attempting to register user:', userData.email);
      console.log('API URL:', `${API_BASE_URL}/users/register`);
      console.log('Request data:', userData);
      
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('Response received');
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        console.log('Response not OK, throwing error');
        throw new Error(data.message || 'Registration failed');
      }

      console.log('Registration successful, returning data');
      return data;
    } catch (error) {
      console.error('=== API REGISTER ERROR ===');
      console.error('Registration error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      console.log('Attempting to login user:', credentials.email);
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  },
};
