import { describe, it, expect } from "vitest";
import {
  textContent,
  thinkingContent,
  imageContent,
  toolUse,
  toolResult,
  isTextContent,
  isImageContent,
  isThinkingContent,
  isToolUse,
  isToolResult,
  type Content,
} from "../../src/types/content";

describe("Content types", () => {
  describe("textContent", () => {
    it("should create a text content object", () => {
      const content = textContent("Hello world");
      expect(content.type).toBe("text");
      expect(content.text).toBe("Hello world");
      expect(content.provider).toBeUndefined();
    });
  });

  describe("thinkingContent", () => {
    it("should create a thinking content object", () => {
      const content = thinkingContent("Let me think...");
      expect(content.type).toBe("thinking");
      expect(content.thinking).toBe("Let me think...");
      expect(content.provider).toBeUndefined();
    });
  });

  describe("imageContent", () => {
    it("should create an image content object with URL", () => {
      const content = imageContent({
        type: "url",
        url: "https://example.com/image.png",
      });
      expect(content.type).toBe("image");
      expect(content.source.type).toBe("url");
      expect(content.source.url).toBe("https://example.com/image.png");
      expect(content.provider).toBeUndefined();
    });

    it("should create an image content object with base64", () => {
      const content = imageContent({
        type: "base64",
        data: "base64data",
        mediaType: "image/png",
      });
      expect(content.type).toBe("image");
      expect(content.source.type).toBe("base64");
      expect(content.source.data).toBe("base64data");
      expect(content.source.mediaType).toBe("image/png");
      expect(content.provider).toBeUndefined();
    });
  });

  describe("toolUse", () => {
    it("should create a tool use content object", () => {
      const content = toolUse("tool-1", "search", { query: "test" });
      expect(content.type).toBe("tool_use");
      expect(content.id).toBe("tool-1");
      expect(content.name).toBe("search");
      expect(content.input).toEqual({ query: "test" });
      expect(content.provider).toBeUndefined();
    });
  });

  describe("toolResult", () => {
    it("should create a tool result content object", () => {
      const content = toolResult("tool-1", "search", { results: [] }, false);
      expect(content.type).toBe("tool_result");
      expect(content.toolUseId).toBe("tool-1");
      expect(content.toolUseName).toBe("search");
      expect(content.content).toEqual({ results: [] });
      expect(content.isError).toBe(false);
    });

    it("should default isError to false", () => {
      const content = toolResult("tool-1", "search", { results: [] });
      expect(content.isError).toBe(false);
    });
  });

  describe("Type guards", () => {
    const textContentObj = textContent("test");
    const thinkingContentObj = thinkingContent("thinking");
    const imageContentObj = imageContent({ type: "url", url: "test" });
    const toolUseObj = toolUse("1", "tool", {});
    const toolResultObj = toolResult("1", "tool", {});

    it("isTextContent should correctly identify text content", () => {
      expect(isTextContent(textContentObj)).toBe(true);
      expect(isTextContent(thinkingContentObj)).toBe(false);
      expect(isTextContent(imageContentObj)).toBe(false);
      expect(isTextContent(toolUseObj)).toBe(false);
      expect(isTextContent(toolResultObj)).toBe(false);
    });

    it("isThinkingContent should correctly identify thinking content", () => {
      expect(isThinkingContent(thinkingContentObj)).toBe(true);
      expect(isThinkingContent(textContentObj)).toBe(false);
      expect(isThinkingContent(imageContentObj)).toBe(false);
      expect(isThinkingContent(toolUseObj)).toBe(false);
      expect(isThinkingContent(toolResultObj)).toBe(false);
    });

    it("isImageContent should correctly identify image content", () => {
      expect(isImageContent(imageContentObj)).toBe(true);
      expect(isImageContent(textContentObj)).toBe(false);
      expect(isImageContent(thinkingContentObj)).toBe(false);
      expect(isImageContent(toolUseObj)).toBe(false);
      expect(isImageContent(toolResultObj)).toBe(false);
    });

    it("isToolUse should correctly identify tool use content", () => {
      expect(isToolUse(toolUseObj)).toBe(true);
      expect(isToolUse(textContentObj)).toBe(false);
      expect(isToolUse(thinkingContentObj)).toBe(false);
      expect(isToolUse(imageContentObj)).toBe(false);
      expect(isToolUse(toolResultObj)).toBe(false);
    });

    it("isToolResult should correctly identify tool result content", () => {
      expect(isToolResult(toolResultObj)).toBe(true);
      expect(isToolResult(textContentObj)).toBe(false);
      expect(isToolResult(thinkingContentObj)).toBe(false);
      expect(isToolResult(imageContentObj)).toBe(false);
      expect(isToolResult(toolUseObj)).toBe(false);
    });
  });

  describe("Content type union", () => {
    it("should accept all content types", () => {
      const contents: Content[] = [
        textContent("text"),
        thinkingContent("thinking"),
        imageContent({ type: "url", url: "test" }),
        toolUse("1", "tool", {}),
        toolResult("1", "tool", {}),
      ];

      expect(contents).toHaveLength(5);
      expect(contents[0].type).toBe("text");
      expect(contents[1].type).toBe("thinking");
      expect(contents[2].type).toBe("image");
      expect(contents[3].type).toBe("tool_use");
      expect(contents[4].type).toBe("tool_result");
    });
  });
});
