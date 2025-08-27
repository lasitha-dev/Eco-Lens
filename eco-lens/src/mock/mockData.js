// Mock data for dummy users and responses
const mockUsers = [
  { email: 'test@example.com' },
  { email: 'user@eco-lens.com' },
  // Add more dummy emails as needed for testing
];

export const mockForgotPassword = async (email) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => { // Simulate network delay
      const userExists = mockUsers.some(u => u.email === email);
      if (userExists) {
        resolve({ message: 'Reset link sent' });
      } else {
        reject(new Error('User not found'));
      }
    }, 1000); // 1 second delay
  });
};