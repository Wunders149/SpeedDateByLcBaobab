import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { hashPassword } from './utils/auth.js';
import { UserRole } from '@speed-date/shared';

dotenv.config({
  path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../.env'),
});

async function bootstrapAdmin() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const uri = process.env.MONGODB_URI;

  if (!email || !password || !uri) {
    throw new Error('Set BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD, and MONGODB_URI before running this command.');
  }
  if (password.length < 12) throw new Error('BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters.');

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  try {
    const adminCount = await User.countDocuments({
      roles: { $in: [UserRole.EventAdmin, UserRole.SuperAdmin] },
    });
    if (adminCount > 0) throw new Error('An administrator already exists. Use the admin console to create additional accounts.');

    const existing = await User.findOne({ normalizedEmail: email });
    if (existing) throw new Error('That email already belongs to an account.');

    const admin = await User.create({
      email,
      normalizedEmail: email,
      passwordHash: await hashPassword(password),
      roles: [UserRole.SuperAdmin],
      accountStatus: 'active',
      emailVerifiedAt: new Date(),
    });
    console.log(`Created initial administrator: ${admin.email}`);
  } finally {
    await mongoose.disconnect();
  }
}

bootstrapAdmin().catch((error) => {
  console.error('Admin bootstrap failed:', error instanceof Error ? error.message : 'Unknown error');
  process.exitCode = 1;
});
