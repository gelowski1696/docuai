'use server';

import { getCurrentUser } from '@/lib/auth/middleware';

export async function getCurrentUserAction() {
  try {
    const user = await getCurrentUser();
    return { success: true, user };
  } catch (error) {
    return { success: false, user: null };
  }
}
