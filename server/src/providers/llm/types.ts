export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMCompletionResult {
  content: string;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
}

export interface LLMCompletionParams {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  responseFormat?: "text" | "json";
}

/**
 * Provider-agnostic LLM interface.
 * Implementations: OpenRouterProvider, (future) OpenAIProvider, AnthropicProvider, etc.
 */
export interface ILLMProvider {
  readonly name: string;
  complete(params: LLMCompletionParams): Promise<LLMCompletionResult>;
}
