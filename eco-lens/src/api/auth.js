import { mockUsers } from '../mock/mockData';

export const forgotPassword = async (email) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(u => u.email === email);
      if (user) {
        resolve({ message: 'Reset link sent' });
      } else {
        reject(new Error('User not found'));
      }
    }, 1000); // Simulate network delay
  });
};

export default { forgotPassword };