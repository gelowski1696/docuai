'use server';

import { prisma } from '@/lib/prisma';

export async function getTemplates() {
  try {
    const templates = await prisma.template.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return { success: true, templates };
  } catch (error) {
    console.error('Error fetching templates:', error);
    return { success: false, error: 'Failed to fetch templates' };
  }
}
