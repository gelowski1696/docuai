'use server';

import { requireAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

import { SubscriptionTier } from '@/lib/subscription';

const VALID_TIERS: SubscriptionTier[] = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'];
export type BillingCycle = 'MONTHLY' | 'ANNUAL';
const VALID_BILLING_CYCLES: BillingCycle[] = ['MONTHLY', 'ANNUAL'];

export interface ChangeSubscriptionInput {
  tier: SubscriptionTier;
  billingCycle?: BillingCycle;
}

export async function changeSubscriptionTier(input: SubscriptionTier | ChangeSubscriptionInput) {
  try {
    const user = await requireAuth();
    if (user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Self-service plan changes are disabled. Please contact an administrator.',
      };
    }

    const tier = typeof input === 'string' ? input : input.tier;
    const billingCycle = typeof input === 'string' ? 'MONTHLY' : (input.billingCycle || 'MONTHLY');

    if (!VALID_TIERS.includes(tier)) {
      return { success: false, error: `Invalid subscription tier: ${tier}` };
    }
    if (!VALID_BILLING_CYCLES.includes(billingCycle)) {
      return { success: false, error: `Invalid billing cycle: ${billingCycle}` };
    }

    const current = await prisma.user.findUnique({
      where: { id: user.id },
      select: { subscriptionTier: true, billingCycle: true },
    });

    if (!current) {
      return { success: false, error: 'User not found' };
    }

    if (current.subscriptionTier === tier && current.billingCycle === billingCycle) {
      return {
        success: true,
        changed: false,
        tier,
        billingCycle,
        message: `You are already on the ${tier} plan.`,
      };
    }

    // In production, verify payment/subscription state (Stripe/PayMongo/etc.)
    // before applying tier and billing cycle changes.
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionTier: tier,
        billingCycle,
      },
    });

    revalidatePath('/');
    revalidatePath('/generate');
    revalidatePath('/pricing');
    revalidatePath('/dashboard');
    revalidatePath('/documents');

    return {
      success: true,
      changed: true,
      tier,
      billingCycle,
      message: `Subscription changed to ${tier} (${billingCycle.toLowerCase()}).`,
    };
  } catch (error) {
    console.error('Tier change failure:', error);
    return { success: false, error: 'Failed to change subscription plan' };
  }
}
