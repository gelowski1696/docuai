'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/middleware';
import { revalidatePath } from 'next/cache';
import type { SubscriptionTier } from '@/lib/subscription';

const VALID_TIERS: SubscriptionTier[] = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'];

export async function updateUserTier(userId: string, newTier: string) {
  try {
    await requireAdmin();

    if (!VALID_TIERS.includes(newTier as SubscriptionTier)) {
      return { success: false, error: `Invalid subscription tier: ${newTier}` };
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existingUser) {
      return { success: false, error: 'User not found' };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionTier: newTier as SubscriptionTier },
    });

    revalidatePath('/admin/users');
    revalidatePath('/admin/subscriptions');
    return { success: true, tier: newTier };
  } catch (error) {
    console.error('Error updating user tier:', error);
    return { success: false, error: 'Failed to update user tier' };
  }
}
