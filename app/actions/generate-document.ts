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

/**
 * Generate Document Server Action (Async version)
 * 1. Instantly creates a "PROCESSING" record.
 * 2. Backgrounds the AI + File generation using after().
 * 3. Returns immediately to allow queuing/immediate redirect UI.
 */

export interface GenerateDocumentInput {
  templateId: string;
  format: 'DOCX' | 'PDF' | 'XLSX';
  designTemplateId?: string;
  wizardMode?: boolean;
  experienceLevel?: 'non_technical' | 'general' | 'technical';
  userInput: any;
  tone?: string;
}

export interface GenerateDocumentResult {
  success: boolean;
  documentId?: string;
  error?: string;
}

function splitLines(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value !== 'string') return [];
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeTemplateInput(templateType: string, rawInput: any): any {
  const input = rawInput && typeof rawInput === 'object' ? rawInput : {};

  switch (templateType.toUpperCase()) {
    case 'INVOICE':
      return {
        clientName: input.clientName || '',
        clientAddress: input.clientAddress || '',
        invoiceNumber: input.invoiceNumber || '',
        invoiceDate: input.invoiceDate || '',
        dueDate: input.dueDate || '',
        items:
          Array.isArray(input.items) && input.items.length > 0
            ? input.items
            : splitLines(input.itemsText).map((description) => ({ description })),
      };
    case 'REPORT':
      return {
        title: input.title || '',
        dateRange: input.dateRange || '',
        department: input.department || '',
        keyPoints:
          Array.isArray(input.keyPoints) && input.keyPoints.length > 0
            ? input.keyPoints
            : splitLines(input.keyPointsText),
      };
    case 'CONTENT':
      return {
        title: input.title || '',
        topic: input.topic || '',
        targetAudience: input.targetAudience || '',
        tone: input.tone || '',
        keyPoints:
          Array.isArray(input.keyPoints) && input.keyPoints.length > 0
            ? input.keyPoints
            : splitLines(input.keyPointsText),
      };
    case 'PROJECT_PROPOSAL':
      return {
        projectTitle: input.projectTitle || input.title || '',
        clientName: input.clientName || input.client || '',
        goals: input.goals || input.goalsText || '',
        scope: input.scope || input.scopeText || '',
        timeline: input.timeline || input.timelineText || '',
        budget: input.budget || '',
      };
    case 'PRODUCT_SPEC':
      return {
        productName: input.productName || '',
        objectives: input.objectives || input.objectivesText || '',
        userStories: input.userStories || input.userStoriesText || '',
        requirements:
          input.requirements || input.functionalRequirements || input.functionalRequirementsText || '',
        successMetrics: input.successMetrics || input.successMetricsText || '',
      };
    case 'PRESS_RELEASE':
      return {
        headline: input.headline || '',
        locationDate: input.locationDate || '',
        leadParagraph: input.leadParagraph || input.lead || '',
        bodyContent:
          input.bodyContent ||
          [input.bodyText, input.quote1Text, input.partnerQuoteText].filter(Boolean).join('\n'),
        companyInfo: input.companyInfo || input.boilerplate || '',
        contactMedia: input.contactMedia || input.contact || '',
      };
    case 'CASE_STUDY':
      return {
        projectTitle: input.projectTitle || '',
        clientName: input.clientName || input.client || '',
        challenge: input.challenge || input.theChallenge || '',
        solution: input.solution || input.theSolution || '',
        results: input.results || input.theResultsText || input.result || '',
      };
    default:
      // For template types already aligned, preserve as-is.
      return input;
  }
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

    const normalizedInput = normalizeTemplateInput(template.type, input.userInput);
    let resolvedDesign: Awaited<ReturnType<typeof resolveDesignForGeneration>> | null = null;
    try {
      resolvedDesign = await resolveDesignForGeneration({
        requestedDesignTemplateId: input.designTemplateId,
        format: input.format,
      });
    } catch (designError) {
      return {
        success: false,
        error: designError instanceof Error ? designError.message : 'Invalid design selection',
      };
    }

    // 3. Create a processing placeholder record instantly
    const document = await prisma.document.create({
      data: {
        userId: user.id,
        templateId: template.id,
        content: '', // Placeholder
        metadata: JSON.stringify(normalizedInput),
        fileUrl: '', // Placeholder
        format: input.format,
        status: 'PROCESSING',
        tone: input.tone,
        designTemplateId: resolvedDesign?.id !== 'system-fallback' ? resolvedDesign?.id : null,
      },
    });

    // 4. Trigger background work after returning the response
    after(async () => {
      try {
        // Build AI prompt
        const { systemPrompt, userPrompt } = buildPromptForTemplate(
          template.type,
          normalizedInput,
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
            fileBuffer = await generateDocx(aiContent, template.type, resolvedDesign || undefined);
            break;
          case 'PDF':
            fileBuffer = await generatePdf(aiContent, template.type, resolvedDesign || undefined);
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
