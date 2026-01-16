export interface Tool {
  name: string;
  description?: string;
  inputSchema: Record<string, any>;
}

export type ToolChoice = "auto" | "any" | "none";

export interface TokenUsage {
  total: number;
  input: number;
  output: number;
  cached: number;
  thinking: number;
}

export type OpenAIModel = "gpt-4o" | "gpt-4o-mini" | "gpt-5" | "gpt-5-mini" | "gpt-5-nano";
export type GoogleModel = "gemini-2.5-pro" | "gemini-2.5-flash" | "gemini-2.5-flash-lite";
export type AnthropicModel = "claude-opus-4-5" | "claude-sonnet-4-5" | "claude-haiku-4-5";
export type MistralModel = "mistral-large-latest" | "mistral-small-latest" | "codestral-latest";
export type DeepseekModel = "deepseek-chat" | "deepseek-reasoner";
export type MoonshotAIModel = "kimi-k2-thinking";

export type Model =
  | OpenAIModel
  | GoogleModel
  | AnthropicModel
  | MistralModel
  | DeepseekModel
  | MoonshotAIModel;

export interface ModelConfig {
  model: Model;
  apiKey?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  thinking?: "none" | "low" | "medium" | "high";
  tools?: Tool[];
  toolChoice?: ToolChoice;
  extra?: Record<string, any>;
}

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
