import type { AIProvider, GenerateRequest, GenerateResponse } from '../types';

/**
 * Ollama Provider for local AI development
 * 
 * Uses local Ollama instance for cost-free development and testing.
 * Supports models like llama3, mistral, gemma.
 */
export class OllamaProvider implements AIProvider {
  private baseUrl: string;
  private model: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama3';
  }

  getName(): string {
    return 'ollama';
  }

  async generateContent(request: GenerateRequest): Promise<GenerateResponse> {
    const { prompt, systemPrompt, temperature = 0.7 } = request;

    // Build the full prompt with JSON instruction
    const fullPrompt = `${systemPrompt || ''}\n\n${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON. Do not include any explanatory text before or after the JSON.`;

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: fullPrompt,
          stream: false,
          options: {
            temperature,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract JSON from response
      let content = data.response.trim();
      
      // Robust JSON extraction: Find the first '{' and the last '}'
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        content = content.substring(firstBrace, lastBrace + 1);
      } else {
        // Fallback: Try to clean common markdown artifacts if braces not found (unlikely for valid JSON)
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }

      // Validate JSON
      try {
        JSON.parse(content);
      } catch (e) {
        console.error('Invalid JSON from Ollama. Raw response:', data.response);
        console.error('Parsed content attempt:', content);
        throw new Error('AI response is not valid JSON');
      }

      return {
        content,
        tokensUsed: data.eval_count || 0,
        provider: 'ollama',
      };
    } catch (error) {
      console.error('Ollama generation error:', error);
      throw new Error(
        `Failed to generate content with Ollama: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
