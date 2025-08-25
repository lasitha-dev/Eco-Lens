import mongoose from 'mongoose';

const mongoUrl = process.env.MONGODB_URL;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (!mongoUrl) {
    throw new Error('MONGODB_URL env var is not set');
  }
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }
  return mongoose.connect(mongoUrl, {
    serverSelectionTimeoutMS: 10000,
  });
}

export async function disconnectFromDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}


