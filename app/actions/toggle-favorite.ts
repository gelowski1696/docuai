'use server';

import { requireAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface ToggleFavoriteResult {
  success: boolean;
  isFavorite?: boolean;
  error?: string;
}

export async function toggleFavorite(documentId: string): Promise<ToggleFavoriteResult> {
  try {
    const user = await requireAuth();

    // Verify document belongs to user
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { userId: true, isFavorite: true },
    });

    if (!document) {
      return { success: false, error: 'Document not found' };
    }

    if (document.userId !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Toggle favorite status
    const updated = await prisma.document.update({
      where: { id: documentId },
      data: { isFavorite: !document.isFavorite },
      select: { isFavorite: true },
    });

    revalidatePath('/documents');

    return { success: true, isFavorite: updated.isFavorite };
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle favorite',
    };
  }
}
