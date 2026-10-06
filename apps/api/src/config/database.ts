import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/speeddate';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`[DB] Connected to MongoDB at ${MONGODB_URI}`);
  } catch (error) {
    console.error('[DB] Connection failed:', error);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log('[DB] Disconnected from MongoDB');
}
