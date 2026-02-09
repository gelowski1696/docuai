'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/app/actions/get-session';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function getAllUsersSubscriptions() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }

    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        subscriptionTier: true,
        createdAt: true,
        _count: {
          select: {
            documents: {
              where: {
                createdAt: {
                  gte: start,
                  lte: end,
                },
                status: 'COMPLETED',
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { 
      success: true, 
      users: users.map(u => ({
        ...u,
        usageCount: u._count.documents,
      }))
    };
  } catch (error) {
    console.error('Admin Fetch Error:', error);
    return { success: false, error: 'Failed to fetch user subscriptions' };
  }
}
