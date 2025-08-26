// src/utils/mockLogin.js

export const mockLogin = (email, password) => {
  return new Promise((resolve, reject) => {
    // Simulate a network delay
    setTimeout(() => {
      // Hardcoded user for testing
      const mockUser = {
        email: 'test@example.com',
        password: 'password123',
        username: 'TestUser',
        token: 'mock-auth-token-12345',
      };

      if (email === mockUser.email && password === mockUser.password) {
        resolve({
          user: { username: mockUser.username, email: mockUser.email },
          token: mockUser.token,
        });
      } else {
        reject(new Error('Invalid email or password.'));
      }
    }, 1000); // 1-second delay
  });
};