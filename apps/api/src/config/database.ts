import mongoose from 'mongoose';

export async function connectDatabase(): Promise<void> {
  const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/speeddate';

  try {
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    const safeUri = MONGODB_URI.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)[^@]+@/i, '$1***@');
    console.log(`[DB] Connected to MongoDB at ${safeUri}`);
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
