import { OpenAI } from "openai";
import { LLM, LLMResponse } from "./base";
import { ModelConfig, TokenUsage, OpenAIModel } from "../types/config";
import {
  Message,
  Conversation,
  agentMessage,
  validateConversation,
} from "../types/message-v2";
import { Stream, textChunk, thinkingChunk, endChunk } from "../types/chunk";
import { ok, err, Result } from "../result";
import { isTextContent } from "../types/content";

export class OpenAILLM extends LLM {
  private client: OpenAI;
  private model: OpenAIModel;

  constructor(config: ModelConfig) {
    super(config);
    this.model = config.model as OpenAIModel;
    this.client = new OpenAI({
      apiKey: config.apiKey ?? process.env.OPENAI_API_KEY,
    });
  }

  async chat(conversation: Conversation): Promise<Result<LLMResponse>> {
    try {
      validateConversation(conversation);

      const messages = this.transformMessages(conversation);
      const response = await this.client.responses.create({
        model: this.model,
        input: messages,
        reasoning: { effort: "high" },
        ...this.config.extra,
      });

      if (!response.output_text) {
        return err("No response from OpenAI");
      }

      const message = this.transformResponse(response);
      const tokenUsage = this.extractTokenUsage(response);

      return ok({ message, tokenUsage });
    } catch (error) {
      return err(error);
    }
  }

  async *stream(conversation: Conversation): Stream {
    validateConversation(conversation);

    const messages = this.transformMessages(conversation);
    const response = await this.client.responses.create({
      model: this.model,
      input: messages,
      stream: true,
      ...this.config.extra,
    });

    for await (const chunk of response) {
      if (chunk.type === "response.completed") {
        yield endChunk();
        return;
      } else if (chunk.type === "response.reasoning_text.delta") {
        yield thinkingChunk(chunk.delta);
      } else if (chunk.type === "response.output_text.delta") {
        yield textChunk(chunk.delta);
      }
    }
  }

  displayName(): string {
    return `${this.model} [openai]`;
  }

  maxTokens(): number {
    return 128000;
  }

  async tokens(conversation: Conversation): Promise<Result<number>> {
    try {
      const messages = this.transformMessages(conversation);
      const text = JSON.stringify(messages);
      const estimatedTokens = Math.ceil(text.length / 4);
      return ok(estimatedTokens);
    } catch (error) {
      return err(error);
    }
  }

  costPerTokenUsage(tokenUsage: TokenUsage): number {
    const prices: Record<OpenAIModel, { input: number; output: number }> = {
      "gpt-4o": { input: 2.5 / 1000000, output: 10 / 1000000 },
      "gpt-4o-mini": { input: 0.15 / 1000000, output: 0.6 / 1000000 },
      "gpt-5": { input: 5 / 1000000, output: 15 / 1000000 },
      "gpt-5-mini": { input: 1 / 1000000, output: 4 / 1000000 },
      "gpt-5-nano": { input: 0.5 / 1000000, output: 2 / 1000000 },
    };

    const price = prices[this.model];
    return (
      tokenUsage.input * price.input +
      tokenUsage.output * price.output +
      tokenUsage.thinking * price.output
    );
  }

  protected transformMessages(conversation: Conversation): any[] {
    return conversation.map((message) => ({
      role: message.role === "system" ? "developer" : message.role === "agent" ? "assistant" : message.role,
      content: this.extractTextContent(message),
    }));
  }

  protected transformResponse(response: any): Message {
    return agentMessage(response.output_text || "");
  }

  private extractTextContent(message: Message): string {
    return message.content
      .filter(isTextContent)
      .map((c) => c.text)
      .join("");
  }

  private extractTokenUsage(response: any): TokenUsage | undefined {
    if (!response.usage) return undefined;

    return {
      total: response.usage.total_tokens || 0,
      input: response.usage.input_tokens || 0,
      output: response.usage.output_tokens || 0,
      cached: response.usage.cached_tokens || 0,
      thinking: response.usage.reasoning_tokens || 0,
    };
  }
}
