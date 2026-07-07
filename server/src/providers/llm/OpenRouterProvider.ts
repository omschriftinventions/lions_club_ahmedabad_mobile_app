import { config } from "../../config";
import { ILLMProvider, LLMCompletionParams, LLMCompletionResult } from "./types";
import { HttpError } from "../../middleware/error";

/**
 * OpenRouter LLM provider.
 * Routes to multiple model families (Anthropic, Google, OpenAI, etc.)
 * with automatic fallback to a secondary model.
 */
export class OpenRouterProvider implements ILLMProvider {
  readonly name = "OpenRouter";
  private apiKey: string;
  private baseUrl: string;
  private primaryModel: string;
  private fallbackModel: string;

  constructor() {
    this.apiKey = config.ai.apiKey;
    this.baseUrl = config.ai.baseUrl;
    this.primaryModel = config.ai.chatModel;
    this.fallbackModel = config.ai.chatModelFallback;
  }

  async complete(params: LLMCompletionParams): Promise<LLMCompletionResult> {
    if (!this.apiKey) throw new HttpError(400, "ai_not_configured", "Set AI_API_KEY in server .env");

    const body: Record<string, any> = {
      model: this.primaryModel,
      messages: params.messages,
      max_tokens: params.maxTokens ?? 4000,
      temperature: params.temperature ?? 0.3,
    };
    if (params.responseFormat === "json") {
      body.response_format = { type: "json_object" };
    }

    try {
      return await this.callModel(this.primaryModel, body);
    } catch (primaryErr: any) {
      console.warn("[llm] primary model failed, trying fallback:", primaryErr?.message);
      try {
        const fallbackBody: Record<string, any> = { ...body, model: this.fallbackModel };
        if (params.responseFormat === "json") delete fallbackBody.response_format;
        return await this.callModel(this.fallbackModel, fallbackBody);
      } catch (fallbackErr: any) {
        throw new HttpError(502, "ai_error", fallbackErr?.message || "All models failed");
      }
    }
  }

  private async callModel(model: string, body: Record<string, any>): Promise<LLMCompletionResult> {
    const res = await fetch(this.baseUrl + "/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.apiKey,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://lionsclubofahmedabadhost.com",
        "X-Title": "Lions Club Ahmedabad Meeting Assistant",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error("AI " + model + " failed: " + res.status + " " + errText.slice(0, 300));
    }
    const data = await res.json() as {
      choices?: { message: { content: string } }[];
      usage?: { prompt_tokens: number; completion_tokens: number };
    };
    const content = data.choices?.[0]?.message?.content || "";
    if (!content) throw new Error("AI " + model + " returned empty content");
    return {
      content,
      model,
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens,
    };
  }
}
