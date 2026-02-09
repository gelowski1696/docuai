'use server';

import { requireAuth } from '@/lib/auth/middleware';
import { getUserSubscription } from '@/lib/subscription';

export async function getSubscription() {
  try {
    const user = await requireAuth();
    const subscription = await getUserSubscription(user.id);
    return { success: true, subscription };
  } catch (error) {
    return { success: false, error: 'Failed to fetch subscription' };
  }
}
