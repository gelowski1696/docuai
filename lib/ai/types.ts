/**
 * AI Provider Types
 * 
 * This module defines the interfaces for AI providers in DocuAI.
 * All AI providers (Ollama, OpenAI, Gemini) must implement the AIProvider interface.
 */

export interface GenerateRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateResponse {
  content: string; // JSON string
  tokensUsed: number;
  provider: string;
}

export interface AIProvider {
  /**
   * Generate content based on the prompt
   * The response content should be a valid JSON string
   */
  generateContent(request: GenerateRequest): Promise<GenerateResponse>;
  
  /**
   * Get the provider name
   */
  getName(): string;
}
