'use server';

import { requireAdmin } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

function normalizeFormats(input: string) {
  return input
    .split(',')
    .map((f) => f.trim().toUpperCase())
    .filter(Boolean)
    .join(',');
}

function parseTokens(raw: string) {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return JSON.stringify(parsed);
  } catch {
    return null;
  }
}

export async function getAllDesignTemplates() {
  try {
    await requireAdmin();
    const templates = await prisma.designTemplate.findMany({ orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] });
    return { success: true, templates };
  } catch (error) {
    console.error('Error fetching design templates:', error);
    return { success: false, error: 'Failed to fetch design templates' };
  }
}

export async function createDesignTemplate(data: {
  name: string;
  description?: string;
  previewImage?: string;
  targetFormats: string;
  tokensJson: string;
}) {
  try {
    const admin = await requireAdmin();
    const tokens = parseTokens(data.tokensJson);
    if (!tokens) return { success: false, error: 'Invalid JSON tokens.' };

    await prisma.designTemplate.create({
      data: {
        name: data.name,
        description: data.description || null,
        previewImage: data.previewImage || null,
        targetFormats: normalizeFormats(data.targetFormats || 'DOCX,PDF'),
        tokens,
        createdBy: admin.id,
      },
    });

    revalidatePath('/admin/designs');
    revalidatePath('/generate');
    return { success: true };
  } catch (error) {
    console.error('Error creating design template:', error);
    return { success: false, error: 'Failed to create design template' };
  }
}

export async function updateDesignTemplate(
  designId: string,
  data: {
    name: string;
    description?: string;
    previewImage?: string;
    targetFormats: string;
    tokensJson: string;
    isActive: boolean;
  },
) {
  try {
    await requireAdmin();
    const tokens = parseTokens(data.tokensJson);
    if (!tokens) return { success: false, error: 'Invalid JSON tokens.' };

    await prisma.designTemplate.update({
      where: { id: designId },
      data: {
        name: data.name,
        description: data.description || null,
        previewImage: data.previewImage || null,
        targetFormats: normalizeFormats(data.targetFormats || 'DOCX,PDF'),
        tokens,
        isActive: data.isActive,
      },
    });

    revalidatePath('/admin/designs');
    revalidatePath('/generate');
    return { success: true };
  } catch (error) {
    console.error('Error updating design template:', error);
    return { success: false, error: 'Failed to update design template' };
  }
}

export async function toggleDesignTemplateStatus(designId: string, isActive: boolean) {
  try {
    await requireAdmin();
    await prisma.designTemplate.update({ where: { id: designId }, data: { isActive } });

    revalidatePath('/admin/designs');
    revalidatePath('/generate');
    return { success: true };
  } catch (error) {
    console.error('Error toggling design status:', error);
    return { success: false, error: 'Failed to update design status' };
  }
}

export async function setDefaultDesignTemplate(designId: string) {
  try {
    await requireAdmin();

    await prisma.$transaction([
      prisma.designTemplate.updateMany({ data: { isDefault: false } }),
      prisma.designTemplate.update({ where: { id: designId }, data: { isDefault: true, isActive: true } }),
    ]);

    revalidatePath('/admin/designs');
    revalidatePath('/generate');
    return { success: true };
  } catch (error) {
    console.error('Error setting default design:', error);
    return { success: false, error: 'Failed to set default design' };
  }
}
