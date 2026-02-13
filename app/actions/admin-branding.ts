'use server';

import { requireAdmin } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getBrandSettings() {
  try {
    await requireAdmin();
    const settings = await prisma.brandSettings.findUnique({ where: { id: 'singleton' } });
    return { success: true, settings };
  } catch (error) {
    console.error('Error fetching brand settings:', error);
    return { success: false, error: 'Failed to fetch brand settings' };
  }
}

export async function updateBrandSettings(data: {
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  fontHeading: string;
  fontBody: string;
}) {
  try {
    await requireAdmin();

    await prisma.brandSettings.upsert({
      where: { id: 'singleton' },
      update: {
        logoUrl: data.logoUrl || null,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        fontHeading: data.fontHeading,
        fontBody: data.fontBody,
      },
      create: {
        id: 'singleton',
        logoUrl: data.logoUrl || null,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        fontHeading: data.fontHeading,
        fontBody: data.fontBody,
      },
    });

    revalidatePath('/admin/branding');
    revalidatePath('/generate');
    return { success: true };
  } catch (error) {
    console.error('Error updating brand settings:', error);
    return { success: false, error: 'Failed to update brand settings' };
  }
}
