import { describe, it, expect } from "vitest";
import {
  textChunk,
  thinkingChunk,
  toolUseChunk,
  endChunk,
  isTextChunk,
  isThinkingChunk,
  isToolUseChunk,
  isEndChunk,
  type StreamChunk,
} from "../../src/types/chunk";

describe("StreamChunk types", () => {
  describe("Chunk creation", () => {
    it("should create a text chunk", () => {
      const chunk = textChunk("Hello");
      expect(chunk.type).toBe("text");
      expect(chunk.content).toBe("Hello");
    });

    it("should create a thinking chunk", () => {
      const chunk = thinkingChunk("Let me think...");
      expect(chunk.type).toBe("thinking");
      expect(chunk.content).toBe("Let me think...");
    });

    it("should create a tool use chunk", () => {
      const chunk = toolUseChunk("tool-1", "search", { query: "test" });
      expect(chunk.type).toBe("tool_use");
      expect(chunk.id).toBe("tool-1");
      expect(chunk.name).toBe("search");
      expect(chunk.input).toEqual({ query: "test" });
    });

    it("should create an end chunk", () => {
      const chunk = endChunk();
      expect(chunk.type).toBe("end");
      expect(chunk.content).toBe("");
    });
  });

  describe("Type guards", () => {
    const text = textChunk("text");
    const thinking = thinkingChunk("thinking");
    const toolUse = toolUseChunk("1", "tool", {});
    const end = endChunk();

    it("isTextChunk should correctly identify text chunks", () => {
      expect(isTextChunk(text)).toBe(true);
      expect(isTextChunk(thinking)).toBe(false);
      expect(isTextChunk(toolUse)).toBe(false);
      expect(isTextChunk(end)).toBe(false);
    });

    it("isThinkingChunk should correctly identify thinking chunks", () => {
      expect(isThinkingChunk(thinking)).toBe(true);
      expect(isThinkingChunk(text)).toBe(false);
      expect(isThinkingChunk(toolUse)).toBe(false);
      expect(isThinkingChunk(end)).toBe(false);
    });

    it("isToolUseChunk should correctly identify tool use chunks", () => {
      expect(isToolUseChunk(toolUse)).toBe(true);
      expect(isToolUseChunk(text)).toBe(false);
      expect(isToolUseChunk(thinking)).toBe(false);
      expect(isToolUseChunk(end)).toBe(false);
    });

    it("isEndChunk should correctly identify end chunks", () => {
      expect(isEndChunk(end)).toBe(true);
      expect(isEndChunk(text)).toBe(false);
      expect(isEndChunk(thinking)).toBe(false);
      expect(isEndChunk(toolUse)).toBe(false);
    });
  });

  describe("StreamChunk union", () => {
    it("should accept all chunk types", () => {
      const chunks: StreamChunk[] = [
        textChunk("text"),
        thinkingChunk("thinking"),
        toolUseChunk("1", "tool", {}),
        endChunk(),
      ];

      expect(chunks).toHaveLength(4);
      expect(chunks[0].type).toBe("text");
      expect(chunks[1].type).toBe("thinking");
      expect(chunks[2].type).toBe("tool_use");
      expect(chunks[3].type).toBe("end");
    });
  });
});
