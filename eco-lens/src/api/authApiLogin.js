import axios from 'axios';

// Replace this with your actual back-end server URL
const API_URL = 'http://your-server-ip-or-domain:5000/api/auth';

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });

    // The response data should contain the token and user info from your backend
    return response.data;
  } catch (error) {
    // Check if the error is from the API (e.g., 401 Unauthorized)
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else {
      // Handle network errors or other issues
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};