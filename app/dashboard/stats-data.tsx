import { prisma } from '@/lib/prisma';
import { StatsSection } from '@/components/dashboard/stats-section';
import { getAccessibleTemplatesCount } from '@/lib/templates';

interface StatsDataProps {
  userId: string;
}

export default async function StatsData({ userId }: StatsDataProps) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });
  const documentCount = await prisma.document.count({
    where: { userId },
  });
  const allTemplates = await prisma.template.findMany({
    where: { isActive: true },
    select: { type: true },
  });
  const usageStats = await prisma.usage.aggregate({
    where: { userId },
    _sum: {
      tokensUsed: true,
    },
  });

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
