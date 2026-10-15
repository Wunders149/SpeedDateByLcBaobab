import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User.js';
import { UserRole } from '@speed-date/shared';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 12);

export interface JwtPayload {
  userId: string;
  roles: string[];
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: IUser): string {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    roles: user.roles,
    email: user.email,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function hasRole(userRoles: string[], requiredRole: UserRole): boolean {
  if (requiredRole === UserRole.SuperAdmin) {
    return userRoles.includes(UserRole.SuperAdmin);
  }
  if (requiredRole === UserRole.EventAdmin) {
    return userRoles.includes(UserRole.EventAdmin) || userRoles.includes(UserRole.SuperAdmin);
  }
  if (requiredRole === UserRole.Moderator) {
    return (
      userRoles.includes(UserRole.Moderator) ||
      userRoles.includes(UserRole.EventAdmin) ||
      userRoles.includes(UserRole.SuperAdmin)
    );
  }
  return true;
}

export function isAdmin(userRoles: string[]): boolean {
  return userRoles.includes(UserRole.EventAdmin) || userRoles.includes(UserRole.SuperAdmin);
}
