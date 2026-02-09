import { cookies } from 'next/headers';
import { verifyAppSessionToken } from './jwt';

export interface SessionUser {
  userId: string;
  email: string;
  role: string;
  authId: string;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('app-session')?.value;
  if (!token) return null;

  const payload = verifyAppSessionToken(token);
  if (!payload) return null;

  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    authId: payload.authId,
  };
}
