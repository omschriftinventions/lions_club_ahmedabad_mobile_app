import { ILLMProvider, LLMCompletionParams, LLMCompletionResult } from "./types";
import { HttpError } from "../../middleware/error";
import { getAIConfig } from "../../services/aiConfig";

/**
 * OpenAI-compatible chat-completions provider (default: OpenRouter).
 * Config is admin-editable at runtime (Admin page → AI Configuration) and
 * resolved per call via getAIConfig(): DB settings > .env > OpenRouter defaults.
 * Automatic fallback to a secondary model on primary failure.
 */
export class OpenRouterProvider implements ILLMProvider {
  readonly name = "OpenRouter";

  async complete(params: LLMCompletionParams): Promise<LLMCompletionResult> {
    const cfg = await getAIConfig();
    if (!cfg.apiKey) throw new HttpError(400, "ai_not_configured", "Set the AI API key from Admin → AI Configuration");

    const body: Record<string, any> = {
      model: cfg.chatModel,
      messages: params.messages,
      max_tokens: params.maxTokens ?? 4000,
      temperature: params.temperature ?? 0.3,
    };
    if (params.responseFormat === "json") {
      body.response_format = { type: "json_object" };
    }

    try {
      return await this.callModel(cfg.baseUrl, cfg.apiKey, cfg.chatModel, body);
    } catch (primaryErr: any) {
      console.warn("[llm] primary model failed, trying fallback:", primaryErr?.message);
      if (!cfg.chatModelFallback || cfg.chatModelFallback === cfg.chatModel) {
        throw new HttpError(502, "ai_error", primaryErr?.message || "AI model failed");
      }
      try {
        const fallbackBody: Record<string, any> = { ...body, model: cfg.chatModelFallback };
        if (params.responseFormat === "json") delete fallbackBody.response_format;
        return await this.callModel(cfg.baseUrl, cfg.apiKey, cfg.chatModelFallback, fallbackBody);
      } catch (fallbackErr: any) {
        throw new HttpError(502, "ai_error", fallbackErr?.message || "All models failed");
      }
    }
  }

  private async callModel(baseUrl: string, apiKey: string, model: string, body: Record<string, any>): Promise<LLMCompletionResult> {
    const res = await fetch(baseUrl + "/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
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
