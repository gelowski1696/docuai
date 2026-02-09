import { prisma } from '@/lib/prisma';
import { StatsSection } from '@/components/dashboard/stats-section';
import { getAccessibleTemplatesCount } from '@/lib/templates';

interface StatsDataProps {
  userId: string;
}

export default async function StatsData({ userId }: StatsDataProps) {
  const [user, documentCount, allTemplates, usageStats] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true },
    }),
    prisma.document.count({
      where: { userId },
    }),
    prisma.template.findMany({
      where: { isActive: true },
      select: { type: true },
    }),
    prisma.usage.aggregate({
      where: { userId },
      _sum: {
        tokensUsed: true,
      },
    }),
  ]);

  const activeTemplatesCount = getAccessibleTemplatesCount(user?.subscriptionTier || 'FREE', allTemplates);
  const totalTokens = usageStats._sum.tokensUsed || 0;

  return (
    <StatsSection
      documentCount={documentCount}
      totalTokens={totalTokens}
      activeTemplatesCount={activeTemplatesCount}
    />
  );
}
