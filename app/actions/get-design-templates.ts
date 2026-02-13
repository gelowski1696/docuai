'use server';

import { requireAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';

export async function getDesignTemplates() {
  try {
    const user = await requireAuth();

    const templates = await prisma.designTemplate.findMany({
      where: { isActive: true },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        description: true,
        previewImage: true,
        targetFormats: true,
        isDefault: true,
        tokens: true,
      },
    });

    return {
      success: true,
      templates,
      isAdmin: user.role === 'ADMIN',
    };
  } catch (error) {
    console.error('Error fetching design templates:', error);
    return { success: false, error: 'Failed to fetch design templates', templates: [], isAdmin: false };
  }
}
