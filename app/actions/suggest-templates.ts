'use server';

import { getAIProvider } from '@/lib/ai/factory';
import { prisma } from '@/lib/prisma';

export interface TemplateSuggestion {
  templateId: string;
  templateName: string;
  templateType: string;
  confidence: number;
  reason: string;
}

export interface SuggestTemplatesResult {
  success: boolean;
  suggestions?: TemplateSuggestion[];
  error?: string;
}

export async function suggestTemplates(userQuery: string): Promise<SuggestTemplatesResult> {
  try {
    if (!userQuery || userQuery.trim().length < 3) {
      return { success: true, suggestions: [] };
    }

    // Fetch available templates
    const templates = await prisma.template.findMany({
      where: { isActive: true },
      select: { id: true, name: true, type: true },
    });

    if (templates.length === 0) {
      return { success: true, suggestions: [] };
    }

    // Build AI prompt for template recommendation
    const systemPrompt = `You are an AI assistant that recommends document templates based on user needs.
Respond ONLY with a valid JSON array. Do not include any explanations or markdown.

The JSON must be an array of objects with this structure:
[
  {
    "templateType": "string (INVOICE, REPORT, MEMO, CONTENT, or PRESENTATION)",
    "confidence": number (0-100),
    "reason": "string (brief explanation)"
  }
]

Rank templates by relevance. Include only templates with confidence >= 30.`;

    const userPrompt = `User wants to create: "${userQuery}"

Available templates:
${templates.map((t) => `- ${t.type}: ${t.name}`).join('\n')}

Recommend the most suitable templates with confidence scores and brief reasons.`;

    const aiProvider = getAIProvider();
    const aiResponse = await aiProvider.generateContent({
      prompt: userPrompt,
      systemPrompt,
      temperature: 0.3,
    });

    const recommendations = JSON.parse(aiResponse.content);

    // Map AI recommendations to actual templates
    const suggestions: TemplateSuggestion[] = recommendations
      .map((rec: any) => {
        const template = templates.find((t) => t.type === rec.templateType);
        if (!template) return null;
        return {
          templateId: template.id,
          templateName: template.name,
          templateType: template.type,
          confidence: rec.confidence,
          reason: rec.reason,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.confidence - a.confidence)
      .slice(0, 3); // Top 3 suggestions

    return { success: true, suggestions };
  } catch (error) {
    console.error('Template suggestion error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to suggest templates',
    };
  }
}
