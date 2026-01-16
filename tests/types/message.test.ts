import { describe, it, expect } from "vitest";
import {
  userMessage,
  agentMessage,
  systemMessage,
  textMessage,
  getMessageText,
  addContent,
  isUserMessage,
  isAgentMessage,
  isSystemMessage,
  getSystemMessage,
  validateConversation,
  type Message,
} from "../../src/types/message-v2";
import { thinkingContent, toolUse } from "../../src/types/content";

describe("Message helpers", () => {
  describe("Message creation", () => {
    it("should create a user message with text content", () => {
      const msg = userMessage("Hello");
      expect(msg.role).toBe("user");
      expect(msg.content).toHaveLength(1);
      expect(msg.content[0].type).toBe("text");
      expect((msg.content[0] as any).text).toBe("Hello");
    });

    it("should create an agent message with text content", () => {
      const msg = agentMessage("Hi there");
      expect(msg.role).toBe("agent");
      expect(msg.content).toHaveLength(1);
      expect(msg.content[0].type).toBe("text");
      expect((msg.content[0] as any).text).toBe("Hi there");
    });

    it("should create a system message with text content", () => {
      const msg = systemMessage("You are helpful");
      expect(msg.role).toBe("system");
      expect(msg.content).toHaveLength(1);
      expect(msg.content[0].type).toBe("text");
      expect((msg.content[0] as any).text).toBe("You are helpful");
    });

    it("should create a generic text message", () => {
      const msg = textMessage("user", "Hello");
      expect(msg.role).toBe("user");
      expect(msg.content).toHaveLength(1);
      expect(msg.content[0].type).toBe("text");
      expect((msg.content[0] as any).text).toBe("Hello");
    });
  });

  describe("getMessageText", () => {
    it("should extract text from a message with only text content", () => {
      const msg = userMessage("Hello world");
      expect(getMessageText(msg)).toBe("Hello world");
    });

    it("should concatenate multiple text contents", () => {
      const msg = userMessage("Hello");
      msg.content.push({ type: "text", text: " world", provider: null });
      expect(getMessageText(msg)).toBe("Hello world");
    });

    it("should ignore non-text content", () => {
      const msg = userMessage("Hello");
      msg.content.push(thinkingContent("thinking..."));
      msg.content.push({ type: "text", text: " world", provider: null });
      expect(getMessageText(msg)).toBe("Hello world");
    });

    it("should return empty string for message with no text content", () => {
      const msg: Message = {
        role: "assistant",
        content: [thinkingContent("thinking...")],
      };
      expect(getMessageText(msg)).toBe("");
    });
  });

  describe("addContent", () => {
    it("should add content to a message", () => {
      const msg = userMessage("Hello");
      const thinking = thinkingContent("Let me think...");
      const withThinking = addContent(msg, thinking);

      expect(withThinking.content).toHaveLength(2);
      expect(withThinking.content[0].type).toBe("text");
      expect(withThinking.content[1].type).toBe("thinking");
    });

    it("should not mutate the original message", () => {
      const msg = userMessage("Hello");
      const originalLength = msg.content.length;
      addContent(msg, thinkingContent("thinking"));

      expect(msg.content).toHaveLength(originalLength);
    });

    it("should preserve message role", () => {
      const msg = agentMessage("Hello");
      const withTool = addContent(msg, toolUse("1", "search", {}));

      expect(withTool.role).toBe("agent");
    });
  });

  describe("Message type guards", () => {
    const user = userMessage("user msg");
    const agent = agentMessage("agent msg");
    const system = systemMessage("system msg");

    it("isUserMessage should correctly identify user messages", () => {
      expect(isUserMessage(user)).toBe(true);
      expect(isUserMessage(agent)).toBe(false);
      expect(isUserMessage(system)).toBe(false);
    });

    it("isAgentMessage should correctly identify agent messages", () => {
      expect(isAgentMessage(agent)).toBe(true);
      expect(isAgentMessage(user)).toBe(false);
      expect(isAgentMessage(system)).toBe(false);
    });

    it("isSystemMessage should correctly identify system messages", () => {
      expect(isSystemMessage(system)).toBe(true);
      expect(isSystemMessage(user)).toBe(false);
      expect(isSystemMessage(agent)).toBe(false);
    });
  });

  describe("getSystemMessage", () => {
    it("should find system message in conversation", () => {
      const conversation = [
        systemMessage("You are helpful"),
        userMessage("Hello"),
        agentMessage("Hi"),
      ];

      const system = getSystemMessage(conversation);
      expect(system).toBeDefined();
      expect(system?.role).toBe("system");
      expect(getMessageText(system!)).toBe("You are helpful");
    });

    it("should return undefined if no system message exists", () => {
      const conversation = [userMessage("Hello"), agentMessage("Hi")];

      const system = getSystemMessage(conversation);
      expect(system).toBeUndefined();
    });

    it("should return first system message if multiple exist", () => {
      const conversation = [
        systemMessage("First"),
        userMessage("Hello"),
        systemMessage("Second"),
      ];

      const system = getSystemMessage(conversation);
      expect(system).toBeDefined();
      expect(getMessageText(system!)).toBe("First");
    });
  });

  describe("validateConversation", () => {
    it("should not throw for valid conversation", () => {
      const conversation = [userMessage("Hello"), agentMessage("Hi")];

      expect(() => validateConversation(conversation)).not.toThrow();
    });

    it("should throw for empty conversation", () => {
      const conversation: Message[] = [];

      expect(() => validateConversation(conversation)).toThrow(
        "Conversation cannot be empty",
      );
    });

    it("should throw if agent message is first", () => {
      const conversation = [
        agentMessage("Hi"),
        userMessage("Hello"),
      ];

      expect(() => validateConversation(conversation)).toThrow(
        "Agent message cannot be the first message",
      );
    });

    it("should allow system message first", () => {
      const conversation = [
        systemMessage("You are helpful"),
        userMessage("Hello"),
      ];

      expect(() => validateConversation(conversation)).not.toThrow();
    });
  });
});
