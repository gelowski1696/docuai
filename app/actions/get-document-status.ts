'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/middleware';
import { canAccessDocument } from '@/lib/authz/document-access';

export async function getDocumentStatus(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const document = await prisma.document.findUnique({
      where: { id },
      select: {
        userId: true,
        id: true,
        status: true,
        fileUrl: true,
        format: true,
      }
    });

    if (!document) {
      throw new Error('Document not found');
    }

    if (!canAccessDocument(document.userId, user.id, user.role)) {
      throw new Error('Forbidden');
    }

    return {
      success: true,
      document: {
        id: document.id,
        status: document.status,
        fileUrl: document.fileUrl,
        format: document.format,
      },
    };
  } catch (error) {
    return { success: false, error: 'Failed to fetch status' };
  }
}
