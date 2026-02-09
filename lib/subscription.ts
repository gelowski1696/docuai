import { prisma } from './prisma';
import { startOfMonth, endOfMonth } from 'date-fns';

export type SubscriptionTier = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';

export const SUBSCRIPTION_LIMITS = {
  FREE: 3,
  STARTER: 15,
  PRO: 50,
  ENTERPRISE: 200,
};

export async function getUserSubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      billingCycle: true,
      lastReset: true,
    },
  });

  if (!user) return null;

  // Track usage for the current month
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const usageCount = await prisma.document.count({
    where: {
      userId,
      createdAt: {
        gte: start,
        lte: end,
      },
      status: 'COMPLETED',
    },
  });

  const tier = user.subscriptionTier as SubscriptionTier;
  const limit = SUBSCRIPTION_LIMITS[tier] || 0;

  return {
    tier,
    billingCycle: (user.billingCycle || 'MONTHLY') as 'MONTHLY' | 'ANNUAL',
    usageCount,
    limit,
    remaining: Math.max(0, limit - usageCount),
    isLimitReached: usageCount >= limit,
  };
}

export async function checkGenerationLimit(userId: string) {
  const sub = await getUserSubscription(userId);
  if (!sub) return false;
  return !sub.isLimitReached;
}
