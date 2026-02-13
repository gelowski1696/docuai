'use server';

import { requireAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { getUserSubscription } from '@/lib/subscription';
import { getAIProvider } from '@/lib/ai/factory';
import { buildPromptForTemplate } from '@/lib/ai/prompts';
import { generateDocx } from '@/lib/generators/docx';
import { generatePdf } from '@/lib/generators/pdf';
import { generateXlsx } from '@/lib/generators/xlsx';
import { resolveDesignForGeneration } from '@/lib/generators/design/resolve-design';
import { saveFile, generateFilename } from '@/lib/storage';
import { revalidatePath } from 'next/cache';
import { after } from 'next/server';

export interface CloneDocumentResult {
  success: boolean;
  documentId?: string;
  error?: string;
}

export async function cloneDocument(originalDocumentId: string): Promise<CloneDocumentResult> {
  try {
    const user = await requireAuth();

    // Check subscription limits
    const sub = await getUserSubscription(user.id);
    if (sub && sub.isLimitReached) {
      return {
        success: false,
        error: `Monthly limit reached (${sub.limit} generations). Upgrade to PRO for unlimited access.`,
      };
    }

    // Fetch original document
    const original = await prisma.document.findUnique({
      where: { id: originalDocumentId },
      include: { template: true },
    });

    if (!original) {
      return { success: false, error: 'Original document not found' };
    }

    if (original.userId !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Parse original metadata to get user input
    const userInput = JSON.parse(original.metadata);
    const clonedFormat = original.format as 'DOCX' | 'PDF' | 'XLSX';
    const resolvedDesign =
      clonedFormat === 'XLSX'
        ? null
        : await resolveDesignForGeneration({
            requestedDesignTemplateId: original.designTemplateId || undefined,
            format: clonedFormat,
          });

    // Create new processing document
    const clonedDocument = await prisma.document.create({
      data: {
        userId: user.id,
        templateId: original.templateId,
        content: '',
        metadata: original.metadata,
        fileUrl: '',
        format: original.format,
        status: 'PROCESSING',
        tone: (original as any).tone,
        designTemplateId: resolvedDesign?.id !== 'system-fallback' ? resolvedDesign?.id : original.designTemplateId,
        tags: (original as any).tags,
        isFavorite: false,
      },
    });

    // Background generation
    after(async () => {
      try {
        const { systemPrompt, userPrompt } = buildPromptForTemplate(
          original.template.type,
          userInput,
          (original as any).tone || undefined
        );

        const aiProvider = getAIProvider();
        const aiResponse = await aiProvider.generateContent({
          prompt: userPrompt,
          systemPrompt,
          temperature: 0.7,
        });

        const aiContent = JSON.parse(aiResponse.content);

        // Generate file
        let fileBuffer: Buffer;
        switch (original.format) {
          case 'DOCX':
            fileBuffer = await generateDocx(aiContent, original.template.type, resolvedDesign || undefined);
            break;
          case 'PDF':
            fileBuffer = await generatePdf(aiContent, original.template.type, resolvedDesign || undefined);
            break;
          case 'XLSX':
            fileBuffer = await generateXlsx(aiContent, original.template.type);
            break;
          default:
            throw new Error('Invalid format');
        }

        const filename = generateFilename(user.id, original.template.type, original.format as any);
        await saveFile(fileBuffer, filename);

        await prisma.document.update({
          where: { id: clonedDocument.id },
          data: {
            content: JSON.stringify(aiContent),
            fileUrl: filename,
            status: 'COMPLETED',
          },
        });

        await prisma.usage.create({
          data: {
            userId: user.id,
            documentId: clonedDocument.id,
            tokensUsed: aiResponse.tokensUsed,
            aiProvider: aiResponse.provider,
          },
        });

        console.log(`Successfully cloned document ${clonedDocument.id}`);
        revalidatePath('/documents');
      } catch (innerError) {
        console.error('Clone generation failure:', innerError);
        try {
          await prisma.document.update({
            where: { id: clonedDocument.id },
            data: { status: 'FAILED' },
          });
        } catch (e) {
          console.error('Could not mark cloned document as failed:', e);
        }
        revalidatePath('/documents');
      }
    });

    revalidatePath('/documents');

    return {
      success: true,
      documentId: clonedDocument.id,
    };
  } catch (error) {
    console.error('Clone document error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clone document',
    };
  }
}
