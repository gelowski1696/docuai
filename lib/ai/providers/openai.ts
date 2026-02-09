import OpenAI from 'openai';
import type { AIProvider, GenerateRequest, GenerateResponse } from '../types';

/**
 * OpenAI Provider for production use
 * 
 * Uses GPT-4o-mini for cost efficiency while maintaining quality.
 * Supports structured JSON outputs.
 */
export class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    this.client = new OpenAI({ apiKey });
  }

  getName(): string {
    return 'openai';
  }

  async generateContent(request: GenerateRequest): Promise<GenerateResponse> {
    const { prompt, systemPrompt, temperature = 0.7, maxTokens = 2000 } = request;

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt || 'You are a helpful assistant that generates structured JSON responses.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' }, // Enforce JSON output
      });

      const content = completion.choices[0]?.message?.content || '{}';
      const tokensUsed = completion.usage?.total_tokens || 0;

      // Validate JSON
      try {
        JSON.parse(content);
      } catch (e) {
        console.error('Invalid JSON from OpenAI:', content);
        throw new Error('AI response is not valid JSON');
      }

      return {
        content,
        tokensUsed,
        provider: 'openai',
      };
    } catch (error) {
      console.error('OpenAI generation error:', error);
      throw new Error(
        `Failed to generate content with OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
