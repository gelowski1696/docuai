'use server';

import { getCurrentUser } from '@/lib/auth/middleware';

export async function getSession() {
  return await getCurrentUser();
}
