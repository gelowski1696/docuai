import { cookies } from 'next/headers';
import { verifyAppSessionToken, verifyToken } from './jwt';
import { prisma } from '../prisma';
import { cache } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  subscriptionTier: string;
}

/**
 * Get the current authenticated user from the JWT cookie
 * Returns null if not authenticated
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const useSupabaseAuth = process.env.DATABASE_PROVIDER === 'postgresql';
  const cookieStore = await cookies();

  if (useSupabaseAuth) {
    const appSessionToken = cookieStore.get('app-session')?.value;
    if (!appSessionToken) {
      return null;
    }

    const payload = verifyAppSessionToken(appSessionToken);
    if (!payload) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, subscriptionTier: true, authId: true },
    });

    if (!user) {
      return null;
    }

    // Extra guard to ensure token user still matches auth identity.
    if (user.authId && user.authId !== payload.authId) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      subscriptionTier: user.subscriptionTier,
    };
  }

  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  // Verify user still exists in database
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true, subscriptionTier: true },
  });

  return user;
});

/**
 * Require authentication - throws error if not authenticated
 * Use in Server Actions and API routes
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * Require admin role - throws error if not admin
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  
  if (user.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required');
  }

  return user;
}
