import { describe, it, expect, vi } from "vitest";
import { Chat } from "../../src/llm/chat";
import { LLM } from "../../src/llm/base";
import { userMessage, agentMessage } from "../../src/types/message-v2";
import { textChunk, endChunk } from "../../src/types/chunk";
import { ok } from "../../src/result";

class MockLLM extends LLM {
  async chat(conversation: any) {
    return ok({
      message: agentMessage("Mock response"),
      tokenUsage: {
        total: 20,
        input: 10,
        output: 10,
        cached: 0,
        thinking: 0,
      },
    });
  }

  async *stream(conversation: any) {
    yield textChunk("Mock");
    yield textChunk(" response");
    yield endChunk();
  }

  displayName() {
    return "mock [test]";
  }

  maxTokens() {
    return 100000;
  }

  async tokens(conversation: any) {
    return ok(100);
  }

  costPerTokenUsage(tokenUsage: any) {
    return 0.001;
  }

  protected transformMessages(conversation: any) {
    return conversation;
  }

  protected transformResponse(response: any) {
    return agentMessage("Mock response");
  }
}

describe("Chat", () => {
  describe("message", () => {
    it("should send a message and get a response", async () => {
      const llm = new MockLLM({
        model: "gpt-4o-mini",
        apiKey: "test",
      });
      const chat = new Chat(llm);

      const result = await chat.message("Hello");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.role).toBe("agent");
        expect(result.value.content).toHaveLength(1);
        expect(result.value.content[0].type).toBe("text");
      }

      expect(chat.conversation).toHaveLength(2);
      expect(chat.conversation[0].role).toBe("user");
      expect(chat.conversation[1].role).toBe("agent");
    });

    it("should handle system prompt", async () => {
      const llm = new MockLLM({
        model: "gpt-4o-mini",
        apiKey: "test",
      });
      const chat = new Chat(llm, [], "You are helpful");

      await chat.message("Hello");

      expect(chat.conversation).toHaveLength(3);
      expect(chat.conversation[0].role).toBe("system");
      expect(chat.conversation[1].role).toBe("user");
      expect(chat.conversation[2].role).toBe("agent");
    });
  });

  describe("stream", () => {
    it("should stream chunks and accumulate content", async () => {
      const llm = new MockLLM({
        model: "gpt-4o-mini",
        apiKey: "test",
      });
      const chat = new Chat(llm);

      const chunks = [];
      for await (const chunk of chat.stream("Hello")) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(3);
      expect(chunks[0].type).toBe("text");
      expect(chunks[1].type).toBe("text");
      expect(chunks[2].type).toBe("end");

      expect(chat.conversation).toHaveLength(2);
      expect(chat.conversation[0].role).toBe("user");
      expect(chat.conversation[1].role).toBe("agent");
      expect(chat.conversation[1].content).toHaveLength(1);
      expect(chat.conversation[1].content[0].type).toBe("text");
      expect((chat.conversation[1].content[0] as any).text).toBe("Mock response");
    });
  });

  describe("changeLLM", () => {
    it("should change the LLM", () => {
      const llm1 = new MockLLM({ model: "gpt-4o-mini", apiKey: "test" });
      const llm2 = new MockLLM({ model: "gpt-4o", apiKey: "test" });
      const chat = new Chat(llm1);

      chat.changeLLM(llm2);

      expect(chat.llm).toBe(llm2);
    });
  });

  describe("changeSystemPrompt", () => {
    it("should update system prompt", () => {
      const llm = new MockLLM({ model: "gpt-4o-mini", apiKey: "test" });
      const chat = new Chat(llm, [], "Original prompt");

      chat.changeSystemPrompt("New prompt");

      expect(chat.systemPrompt).toBe("New prompt");
      expect(chat.conversation[0].role).toBe("system");
      expect((chat.conversation[0].content[0] as any).text).toBe("New prompt");
    });

    it("should add system message if none exists", () => {
      const llm = new MockLLM({ model: "gpt-4o-mini", apiKey: "test" });
      const chat = new Chat(llm);

      chat.changeSystemPrompt("New prompt");

      expect(chat.conversation).toHaveLength(1);
      expect(chat.conversation[0].role).toBe("system");
    });
  });
});
