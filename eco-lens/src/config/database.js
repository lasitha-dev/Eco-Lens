// Database configuration - This file is deprecated
// Backend now uses environment variables for MongoDB connection
// See backend/.env for configuration

// Note: This file is kept for reference but not used in production
// All database connections should be handled through the backend API
export const MONGODB_URI = process.env.MONGODB_URI || 'Please use backend environment variables';

export const databaseConfig = {
  uri: MONGODB_URI,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};


