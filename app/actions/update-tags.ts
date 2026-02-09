'use server';

import { requireAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface UpdateTagsResult {
  success: boolean;
  tags?: string;
  error?: string;
}

export async function updateTags(documentId: string, tags: string): Promise<UpdateTagsResult> {
  try {
    const user = await requireAuth();

    // Verify document belongs to user
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { userId: true },
    });

    if (!document) {
      return { success: false, error: 'Document not found' };
    }

    if (document.userId !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Update tags (store as comma-separated string)
    const updated = await prisma.document.update({
      where: { id: documentId },
      data: { tags: tags.trim() || null },
      select: { tags: true },
    });

    revalidatePath('/documents');

    return { success: true, tags: updated.tags || '' };
  } catch (error) {
    console.error('Update tags error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update tags',
    };
  }
}
