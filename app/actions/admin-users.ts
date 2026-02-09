'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/middleware';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(userId: string, newRole: string) {
  try {
    await requireAdmin();

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole as any },
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: 'Failed to update user role' };
  }
}
