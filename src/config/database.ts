import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
  if (!env.MONGO_URL) {
    throw new Error('MONGO_URL is not defined in environment variables');
  }

  await mongoose.connect(env.MONGO_URL);
  console.log('MongoDB connected');
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log('MongoDB disconnected');
};
