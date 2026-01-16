export interface Tool {
  name: string;
  description?: string;
  inputSchema: any;
}

export type ToolChoice = "auto" | "any" | "none";

export interface TokenUsage {
  total: number;
  input: number;
  output: number;
  cached: number;
  thinking: number;
}

export interface BaseModelConfig {
  apiKey?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  thinking?: "none" | "low" | "medium" | "high";
  tools?: Tool[];
  toolChoice?: ToolChoice;
  extra?: Record<string, any>;
}

export interface OpenAIConfig extends BaseModelConfig {
  model?: string;
  extra?: {
    reasoningEffort?: "low" | "medium" | "high";
    [key: string]: any;
  };
}

export interface GoogleConfig extends BaseModelConfig {
  model?: string;
  extra?: {
    thinkingBudget?: number;
    safetySettings?: any[];
    [key: string]: any;
  };
}

export interface AnthropicConfig extends BaseModelConfig {
  model?: string;
  extra?: {
    thinkingBudget?: number;
    cacheControl?: boolean;
    [key: string]: any;
  };
}

export interface MistralConfig extends BaseModelConfig {
  model?: string;
  extra?: {
    [key: string]: any;
  };
}

export interface DeepseekConfig extends BaseModelConfig {
  model?: string;
  extra?: {
    [key: string]: any;
  };
}

export interface MoonshotAIConfig extends BaseModelConfig {
  model?: string;
  extra?: {
    [key: string]: any;
  };
}

export type ModelConfig =
  | OpenAIConfig
  | GoogleConfig
  | AnthropicConfig
  | MistralConfig
  | DeepseekConfig
  | MoonshotAIConfig;

export function createTokenUsage(
  input: number,
  output: number,
  cached = 0,
  thinking = 0,
): TokenUsage {
  return {
    total: input + output + cached + thinking,
    input,
    output,
    cached,
    thinking,
  };
}
