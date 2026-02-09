'use server';

import { requireAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { getUserSubscription } from '@/lib/subscription';
import { getAIProvider } from '@/lib/ai/factory';
import { buildPromptForTemplate } from '@/lib/ai/prompts';
import { generateDocx } from '@/lib/generators/docx';
import { generatePdf } from '@/lib/generators/pdf';
import { generateXlsx } from '@/lib/generators/xlsx';
import { saveFile, generateFilename } from '@/lib/storage';
import { revalidatePath } from 'next/cache';
import { after } from 'next/server';

/**
 * Generate Document Server Action (Async version)
 * 1. Instantly creates a "PROCESSING" record.
 * 2. Backgrounds the AI + File generation using after().
 * 3. Returns immediately to allow queuing/immediate redirect UI.
 */

export interface GenerateDocumentInput {
  templateId: string;
  format: 'DOCX' | 'PDF' | 'XLSX';
  userInput: any;
  tone?: string;
}

export interface GenerateDocumentResult {
  success: boolean;
  documentId?: string;
  error?: string;
}

export async function generateDocument(
  input: GenerateDocumentInput
): Promise<GenerateDocumentResult> {
  try {
    // 1. Validate authentication
    const user = await requireAuth();

    // Check subscription limits
    const sub = await getUserSubscription(user.id);
    if (sub && sub.isLimitReached) {
      return { 
        success: false, 
        error: `Monthly limit reached (${sub.limit} generations). Upgrade to PRO for unlimited access.` 
      };
    }

    // 2. Fetch template
    const template = await prisma.template.findUnique({
      where: { id: input.templateId },
    });

    if (!template || !template.isActive) {
      return { success: false, error: 'Template not found or inactive' };
    }

    // 3. Create a processing placeholder record instantly
    const document = await prisma.document.create({
      data: {
        userId: user.id,
        templateId: template.id,
        content: '', // Placeholder
        metadata: JSON.stringify(input.userInput),
        fileUrl: '', // Placeholder
        format: input.format,
        status: 'PROCESSING',
        tone: input.tone,
      },
    });

    // 4. Trigger background work after returning the response
    after(async () => {
      try {
        // Build AI prompt
        const { systemPrompt, userPrompt } = buildPromptForTemplate(
          template.type,
          input.userInput,
          input.tone
        );

        // Call AI provider
        const aiProvider = getAIProvider();
        const aiResponse = await aiProvider.generateContent({
          prompt: userPrompt,
          systemPrompt,
          temperature: 0.7,
        });

        const aiContent = JSON.parse(aiResponse.content);

        // Generate file based on format
        let fileBuffer: Buffer;
        switch (input.format) {
          case 'DOCX':
            fileBuffer = await generateDocx(aiContent, template.type);
            break;
          case 'PDF':
            fileBuffer = await generatePdf(aiContent, template.type);
            break;
          case 'XLSX':
            fileBuffer = await generateXlsx(aiContent, template.type);
            break;
          default:
            throw new Error('Invalid format');
        }

        // Save file to storage
        const filename = generateFilename(user.id, template.type, input.format as any);
        await saveFile(fileBuffer, filename);

        // Update record to COMPLETED
        await prisma.document.update({
          where: { id: document.id },
          data: {
            content: JSON.stringify(aiContent),
            fileUrl: filename,
            status: 'COMPLETED',
          },
        });

        // Add usage metrics
        await prisma.usage.create({
          data: {
            userId: user.id,
            documentId: document.id,
            tokensUsed: aiResponse.tokensUsed,
            aiProvider: aiResponse.provider,
          },
        });

        console.log(`Successfully generated document ${document.id} in the background.`);
        revalidatePath('/documents');
      } catch (innerError) {
        console.error('Background generation failure:', innerError);
        // Mark as FAILED so user knows what happened
        try {
           await prisma.document.update({
            where: { id: document.id },
            data: { status: 'FAILED' },
          });
        } catch (e) {
          console.error('Could not mark document as failed:', e);
        }
        revalidatePath('/documents');
      }
    });

    // Revalidate library immediately so placeholder shows up
    revalidatePath('/documents');
    
    return {
      success: true,
      documentId: document.id,
    };
  } catch (error) {
    console.error('Initial generation failure:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initiate generation',
    };
  }
}
