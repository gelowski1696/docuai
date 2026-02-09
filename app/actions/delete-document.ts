'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/middleware';
import { revalidatePath } from 'next/cache';
import { deleteFile } from '@/lib/storage';

export async function deleteDocument(documentId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Find document and check ownership
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return { success: false, error: 'Document not found' };
    }

    if (document.userId !== user.id && user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized to delete this document' };
    }

    // Delete file from configured storage backend
    try {
      if (document.fileUrl) {
        await deleteFile(document.fileUrl);
      }
    } catch (err) {
      console.warn(`Could not delete stored file: ${document.fileUrl}`, err);
    }

    // Delete from database
    await prisma.document.delete({
      where: { id: documentId },
    });

    revalidatePath('/documents');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    return { success: false, error: 'Failed to delete document' };
  }
}
