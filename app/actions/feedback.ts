'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/middleware';
import { revalidatePath } from 'next/cache';

export async function submitFeedback(data: {
  type: 'ERROR' | 'SUGGESTION';
  title: string;
  content: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const feedback = await prisma.feedback.create({
      data: {
        userId: user.id,
        type: data.type,
        title: data.title,
        content: data.content,
        priority: data.priority || 'MEDIUM',
      },
    });

    revalidatePath('/admin/feedback');
    return { success: true, feedback };
  } catch (error) {
    console.error('Feedback submission error:', error);
    return { success: false, error: 'Failed to submit feedback' };
  }
}

export async function getAllFeedback() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const feedback = await prisma.feedback.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, feedback };
  } catch (error) {
    console.error('Fetch feedback error:', error);
    return { success: false, error: 'Failed to fetch feedback' };
  }
}

export async function updateFeedbackStatus(
  id: string,
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'
) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await prisma.feedback.update({
      where: { id },
      data: { status },
    });

    revalidatePath('/admin/feedback');
    return { success: true };
  } catch (error) {
    console.error('Update feedback status error:', error);
    return { success: false, error: 'Failed to update status' };
  }
}
