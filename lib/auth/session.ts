import { cookies } from 'next/headers';
import { verifyAppSessionToken, verifyToken } from './jwt';
import { prisma } from '../prisma';

export interface SessionUser {
  userId: string;
  email: string;
  role: string;
  authId?: string;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const useSupabaseAuth = process.env.DATABASE_PROVIDER === 'postgresql';
  const cookieStore = await cookies();

  if (useSupabaseAuth) {
    const token = cookieStore.get('app-session')?.value;
    if (!token) return null;

    const payload = verifyAppSessionToken(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, authId: true },
    });

    if (!user) return null;
    if (user.authId && user.authId !== payload.authId) return null;

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      authId: user.authId ?? payload.authId,
    };
  }

  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true },
  });

  if (!user) return null;

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
}
