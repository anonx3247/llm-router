export type Provider = "openai" | "google" | "anthropic" | "mistral" | "deepseek" | "moonshotai";

export type ProviderData = Partial<Record<Provider, any>>;

export interface TextContent {
  type: "text";
  text: string;
  provider: ProviderData | null;
}

export interface ImageContent {
  type: "image";
  source: {
    type: "url" | "base64";
    url?: string;
    data?: string;
    mediaType?: string;
  };
  provider: ProviderData | null;
}

export interface ThinkingContent {
  type: "thinking";
  thinking: string;
  provider: ProviderData | null;
}

export interface ToolUse {
  type: "tool_use";
  id: string;
  name: string;
  input: any;
  provider: ProviderData | null;
}

export interface ToolResult {
  type: "tool_result";
  toolUseId: string;
  toolUseName: string;
  content: any;
  isError: boolean;
}

export type Content =
  | TextContent
  | ImageContent
  | ThinkingContent
  | ToolUse
  | ToolResult;

export function isTextContent(content: Content): content is TextContent {
  return content.type === "text";
}

export function isImageContent(content: Content): content is ImageContent {
  return content.type === "image";
}

export function isThinkingContent(
  content: Content,
): content is ThinkingContent {
  return content.type === "thinking";
}

export function isToolUse(content: Content): content is ToolUse {
  return content.type === "tool_use";
}

export function isToolResult(content: Content): content is ToolResult {
  return content.type === "tool_result";
}

export function textContent(text: string): TextContent {
  return { type: "text", text, provider: null };
}

export function thinkingContent(thinking: string): ThinkingContent {
  return { type: "thinking", thinking, provider: null };
}

export function imageContent(
  source: ImageContent["source"],
): ImageContent {
  return { type: "image", source, provider: null };
}

export function toolUse(id: string, name: string, input: any): ToolUse {
  return { type: "tool_use", id, name, input, provider: null };
}

export function toolResult(
  toolUseId: string,
  toolUseName: string,
  content: any,
  isError = false,
): ToolResult {
  return { type: "tool_result", toolUseId, toolUseName, content, isError };
}
