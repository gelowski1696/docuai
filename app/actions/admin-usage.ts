'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/middleware';

export interface UsageStat {
  provider: string;
  totalTokens: number;
  docCount: number;
}

export interface DayUsage {
  date: string;
  tokens: number;
}

export interface AIUsageStats {
  byProvider: UsageStat[];
  totalTokens: number;
  totalDocs: number;
  dailyTrends: DayUsage[];
}

/**
 * Fetches aggregated AI usage statistics for admin dashboard
 */
export async function getAIUsageStats(): Promise<AIUsageStats> {
  await requireAdmin();

  const usageRecords = await prisma.usage.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const statsByProvider: Record<string, UsageStat> = {};
  let totalTokens = 0;
  const dailyMap: Record<string, number> = {};

  usageRecords.forEach((record) => {
    const provider = record.aiProvider;
    if (!statsByProvider[provider]) {
      statsByProvider[provider] = { provider, totalTokens: 0, docCount: 0 };
    }
    statsByProvider[provider].totalTokens += record.tokensUsed;
    statsByProvider[provider].docCount += 1;
    totalTokens += record.tokensUsed;

    const dateKey = record.createdAt.toISOString().split('T')[0];
    dailyMap[dateKey] = (dailyMap[dateKey] || 0) + record.tokensUsed;
  });

  // Convert daily map to sorted array
  const dailyTrends = Object.entries(dailyMap)
    .map(([date, tokens]) => ({ date, tokens }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7); // Last 7 days

  return {
    byProvider: Object.values(statsByProvider),
    totalTokens,
    totalDocs: usageRecords.length,
    dailyTrends,
  };
}
