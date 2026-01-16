export type StreamChunk = TextChunk | ThinkingChunk | ToolUseChunk | EndChunk;

export interface TextChunk {
  type: "text";
  content: string;
}

export interface ThinkingChunk {
  type: "thinking";
  content: string;
}

export interface ToolUseChunk {
  type: "tool_use";
  id: string;
  name: string;
  input: any;
}

export interface EndChunk {
  type: "end";
  content: "";
}

export type Stream = AsyncIterable<StreamChunk>;

export function isTextChunk(chunk: StreamChunk): chunk is TextChunk {
  return chunk.type === "text";
}

export function isThinkingChunk(chunk: StreamChunk): chunk is ThinkingChunk {
  return chunk.type === "thinking";
}

export function isToolUseChunk(chunk: StreamChunk): chunk is ToolUseChunk {
  return chunk.type === "tool_use";
}

export function isEndChunk(chunk: StreamChunk): chunk is EndChunk {
  return chunk.type === "end";
}

export function textChunk(content: string): TextChunk {
  return { type: "text", content };
}

export function thinkingChunk(content: string): ThinkingChunk {
  return { type: "thinking", content };
}

export function toolUseChunk(id: string, name: string, input: any): ToolUseChunk {
  return { type: "tool_use", id, name, input };
}

export function endChunk(): EndChunk {
  return { type: "end", content: "" };
}
