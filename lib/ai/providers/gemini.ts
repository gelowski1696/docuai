import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIProvider, GenerateRequest, GenerateResponse } from '../types';

/**
 * Google Gemini Provider for production use
 * 
 * Uses Gemini 1.5 Flash for speed and cost efficiency.
 * Supports JSON mode for structured outputs.
 */
export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = 'gemini-flash-latest';
  }

  getName(): string {
    return 'gemini';
  }

  async generateContent(request: GenerateRequest): Promise<GenerateResponse> {
    const { prompt, systemPrompt, temperature = 0.7 } = request;

    try {
      const model = this.client.getGenerativeModel({
        model: this.model,
        generationConfig: {
          temperature,
          responseMimeType: 'application/json', // JSON mode
        },
      });

      // Combine system prompt and user prompt
      const fullPrompt = systemPrompt
        ? `${systemPrompt}\n\n${prompt}`
        : prompt;

      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      const content = response.text();

      // Validate JSON
      try {
        JSON.parse(content);
      } catch (e) {
        console.error('Invalid JSON from Gemini:', content);
        throw new Error('AI response is not valid JSON');
      }

      // Estimate tokens (Gemini doesn't provide exact token count in the same way)
      // Rough estimation: ~4 characters per token
      const tokensUsed = Math.ceil(content.length / 4);

      return {
        content,
        tokensUsed,
        provider: 'gemini',
      };
    } catch (error) {
      console.error('Gemini generation error:', error);
      throw new Error(
        `Failed to generate content with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
