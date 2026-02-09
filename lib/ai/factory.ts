import type { AIProvider } from './types';
import { OllamaProvider } from './providers/ollama';
import { OpenAIProvider } from './providers/openai';
import { GeminiProvider } from './providers/gemini';

/**
 * AI Provider Factory
 * 
 * Creates the appropriate AI provider based on environment configuration.
 * Supports switching between Ollama (dev), OpenAI (prod), and Gemini (prod).
 */
export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || 'ollama';

  switch (provider.toLowerCase()) {
    case 'ollama':
      return new OllamaProvider();
    
    case 'openai':
      return new OpenAIProvider();
    
    case 'gemini':
      return new GeminiProvider();
    
    default:
      throw new Error(
        `Unknown AI provider: ${provider}. Valid options are: ollama, openai, gemini`
      );
  }
}
