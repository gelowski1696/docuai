'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/middleware';
import { revalidatePath } from 'next/cache';

export async function toggleTemplateStatus(templateId: string, isActive: boolean) {
  try {
    await requireAdmin();

    await prisma.template.update({
      where: { id: templateId },
      data: { isActive },
    });

    revalidatePath('/admin/templates');
    revalidatePath('/generate');
    return { success: true };
  } catch (error) {
    console.error('Error toggling template status:', error);
    return { success: false, error: 'Failed to update template' };
  }
}

export async function createTemplate(data: any) {
  try {
    await requireAdmin();

    const template = await prisma.template.create({
      data: {
        name: data.name,
        type: data.type,
        structure: JSON.stringify(data.structure),
        supportedFormats: data.supportedFormats || "DOCX,PDF,XLSX",
        isActive: true,
      }
    });

    revalidatePath('/admin/templates');
    revalidatePath('/generate');
    return { success: true, id: template.id };
  } catch (error) {
    console.error('Error creating template:', error);
    return { success: false, error: 'Failed to create template' };
  }
}

export async function updateTemplate(templateId: string, data: any) {
  try {
    await requireAdmin();

    await prisma.template.update({
      where: { id: templateId },
      data: {
        name: data.name,
        type: data.type,
        structure: data.structure ? JSON.stringify(data.structure) : undefined,
        supportedFormats: data.supportedFormats,
        isActive: data.isActive,
      }
    });

    revalidatePath('/admin/templates');
    revalidatePath('/generate');
    return { success: true };
  } catch (error) {
    console.error('Error updating template:', error);
    return { success: false, error: 'Failed to update template' };
  }
}
