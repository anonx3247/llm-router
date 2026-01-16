import { Message, Conversation } from "../types/message-v2";
import { Stream } from "../types/chunk";
import { ModelConfig, TokenUsage } from "../types/config";
import { Result } from "../result";

export interface LLMResponse {
  message: Message;
  tokenUsage?: TokenUsage;
}

export abstract class LLM {
  protected config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;
  }

  abstract chat(conversation: Conversation): Promise<Result<LLMResponse>>;

  abstract stream(conversation: Conversation): Stream;

  abstract displayName(): string;

  abstract maxTokens(): number;

  abstract tokens(conversation: Conversation): Promise<Result<number>>;

  abstract costPerTokenUsage(tokenUsage: TokenUsage): number;

  cost(tokenUsages: TokenUsage[]): number {
    const accumulated: TokenUsage = {
      total: 0,
      input: 0,
      output: 0,
      cached: 0,
      thinking: 0,
    };

    for (const usage of tokenUsages) {
      accumulated.total += usage.total;
      accumulated.input += usage.input;
      accumulated.output += usage.output;
      accumulated.cached += usage.cached;
      accumulated.thinking += usage.thinking;
    }

    return this.costPerTokenUsage(accumulated);
  }

  protected abstract transformMessages(conversation: Conversation): any;

  protected abstract transformResponse(response: any): Message;
}
