import { ILLMProvider } from "./types";
import { OpenRouterProvider } from "./OpenRouterProvider";

/**
 * Factory: returns the active LLM provider based on config.
 * Future providers (OpenAI, Anthropic, Gemini, Ollama) can be added here
 * without changing any business logic that depends on ILLMProvider.
 */
let _provider: ILLMProvider | null = null;

export function getLLMProvider(): ILLMProvider {
  if (!_provider) {
    _provider = new OpenRouterProvider();
  }
  return _provider;
}

export * from "./types";
