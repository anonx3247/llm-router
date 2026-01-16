import { describe, it, expect, vi, beforeEach } from "vitest";
import { OpenAILLM } from "../../src/llm/openai";
import { userMessage, systemMessage } from "../../src/types/message-v2";
import { ModelConfig } from "../../src/types/config";

vi.mock("openai", () => {
  return {
    OpenAI: vi.fn(() => ({
      responses: {
        create: vi.fn(),
      },
    })),
  };
});

describe("OpenAILLM", () => {
  let llm: OpenAILLM;
  let mockCreate: any;

  beforeEach(() => {
    const { OpenAI } = require("openai");
    const config: ModelConfig = {
      model: "gpt-4o-mini",
      apiKey: "test-key",
    };
    llm = new OpenAILLM(config);
    mockCreate = llm["client"].responses.create;
    vi.clearAllMocks();
  });

  describe("chat", () => {
    it("should handle simple text conversation", async () => {
      const mockResponse = {
        output_text: "Hello! How can I help you today?",
        usage: {
          total_tokens: 25,
          input_tokens: 10,
          output_tokens: 15,
          cached_tokens: 0,
          reasoning_tokens: 0,
        },
      };

      mockCreate.mockResolvedValue(mockResponse);

      const conversation = [
        userMessage("Hello"),
      ];

      const result = await llm.chat(conversation);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.message.role).toBe("agent");
        expect(result.value.message.content).toHaveLength(1);
        expect(result.value.message.content[0].type).toBe("text");
        expect((result.value.message.content[0] as any).text).toBe(
          "Hello! How can I help you today?",
        );
        expect(result.value.tokenUsage).toBeDefined();
        expect(result.value.tokenUsage?.total).toBe(25);
        expect(result.value.tokenUsage?.input).toBe(10);
        expect(result.value.tokenUsage?.output).toBe(15);
      }
    });

    it("should handle system messages correctly", async () => {
      const mockResponse = {
        output_text: "I am a helpful assistant.",
        usage: {
          total_tokens: 20,
          input_tokens: 8,
          output_tokens: 12,
          cached_tokens: 0,
          reasoning_tokens: 0,
        },
      };

      mockCreate.mockResolvedValue(mockResponse);

      const conversation = [
        systemMessage("You are a helpful assistant"),
        userMessage("Hello"),
      ];

      const result = await llm.chat(conversation);

      expect(result.ok).toBe(true);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "gpt-4o-mini",
          input: [
            { role: "developer", content: "You are a helpful assistant" },
            { role: "user", content: "Hello" },
          ],
        }),
      );
    });

    it("should handle errors gracefully", async () => {
      mockCreate.mockRejectedValue(new Error("API Error"));

      const conversation = [userMessage("Hello")];

      const result = await llm.chat(conversation);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe("API Error");
      }
    });

    it("should handle empty response", async () => {
      const mockResponse = {
        output_text: "",
        usage: {
          total_tokens: 10,
          input_tokens: 10,
          output_tokens: 0,
          cached_tokens: 0,
          reasoning_tokens: 0,
        },
      };

      mockCreate.mockResolvedValue(mockResponse);

      const conversation = [userMessage("Hello")];

      const result = await llm.chat(conversation);

      expect(result.ok).toBe(false);
    });
  });

  describe("displayName", () => {
    it("should return model name with provider", () => {
      expect(llm.displayName()).toBe("gpt-4o-mini [openai]");
    });
  });

  describe("maxTokens", () => {
    it("should return maximum context window size", () => {
      expect(llm.maxTokens()).toBe(128000);
    });
  });

  describe("tokens", () => {
    it("should estimate token count", async () => {
      const conversation = [userMessage("Hello world")];

      const result = await llm.tokens(conversation);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeGreaterThan(0);
      }
    });
  });

  describe("costPerTokenUsage", () => {
    it("should calculate cost correctly", () => {
      const tokenUsage = {
        total: 100,
        input: 50,
        output: 50,
        cached: 0,
        thinking: 0,
      };

      const cost = llm.costPerTokenUsage(tokenUsage);

      expect(cost).toBeGreaterThan(0);
      expect(typeof cost).toBe("number");
    });
  });

  describe("stream", () => {
    it("should stream text chunks", async () => {
      async function* mockStream() {
        yield { type: "response.output_text.delta", delta: "Hello" };
        yield { type: "response.output_text.delta", delta: " world" };
        yield { type: "response.completed" };
      }

      mockCreate.mockResolvedValue(mockStream());

      const conversation = [userMessage("Hello")];
      const chunks = [];

      for await (const chunk of llm.stream(conversation)) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(3);
      expect(chunks[0]).toEqual({ type: "text", content: "Hello" });
      expect(chunks[1]).toEqual({ type: "text", content: " world" });
      expect(chunks[2]).toEqual({ type: "end", content: "" });
    });

    it("should stream thinking and text chunks", async () => {
      async function* mockStream() {
        yield { type: "response.reasoning_text.delta", delta: "Let me think..." };
        yield { type: "response.output_text.delta", delta: "The answer is 42" };
        yield { type: "response.completed" };
      }

      mockCreate.mockResolvedValue(mockStream());

      const conversation = [userMessage("What is the answer?")];
      const chunks = [];

      for await (const chunk of llm.stream(conversation)) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(3);
      expect(chunks[0]).toEqual({ type: "thinking", content: "Let me think..." });
      expect(chunks[1]).toEqual({ type: "text", content: "The answer is 42" });
      expect(chunks[2]).toEqual({ type: "end", content: "" });
    });

    it("should handle empty stream", async () => {
      async function* mockStream() {
        yield { type: "response.completed" };
      }

      mockCreate.mockResolvedValue(mockStream());

      const conversation = [userMessage("Hello")];
      const chunks = [];

      for await (const chunk of llm.stream(conversation)) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toEqual({ type: "end", content: "" });
    });
  });
});
