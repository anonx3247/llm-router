import {
  assistantMessage,
  AssistantMessage,
  Chunk,
  Conversation,
  getSystemMessage,
  validateConversation,
} from "./message";
import { Provider } from "./model";
import { validateConversationForChat } from "./chat";
import { GoogleGenAI } from "@google/genai";
import { ok, err, Result } from "./result";

export class GoogleProvider implements Provider {
  private client: GoogleGenAI;
  private modelName = "gemini-2.5-pro";
  constructor(apiKey: string) {
    this.client = new GoogleGenAI({
      apiKey: apiKey,
    });
  }

  displayName(): string {
    return `${this.modelName} [google]`;
  }

  async chat(conversation: Conversation): Promise<Result<AssistantMessage>> {
    validateConversationForChat(conversation);
    const response = await this.client.models.generateContent({
      model: this.modelName,
      contents: toGoogle(conversation),
      config: {
        systemInstruction: getSystemMessage(conversation)?.content,
      },
    });
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return err(new Error("No response from Google"));
    }
    return ok(assistantMessage(text));
  }

  async *stream(conversation: Conversation): AsyncIterable<Chunk> {
    validateConversationForChat(conversation);
    const response = await this.client.models.generateContentStream({
      model: this.modelName,
      contents: toGoogle(conversation),
      config: {
        systemInstruction: getSystemMessage(conversation)?.content,
        thinkingConfig: {
          includeThoughts: true,
          thinkingBudget: -1,
        },
      },
    });
    for await (const textPart of response) {
      const parts = textPart.candidates?.[0]?.content?.parts;
      if (!parts) {
        continue;
      }
      for (const part of parts) {
        if (!part.text) {
          continue;
        } else if (part.thought) {
          yield { type: "thought", content: part.text };
        } else if (part.text.includes("[DONE]")) {
          yield { type: "end", content: "" };
          return;
        } else {
          yield { type: "text", content: part.text };
        }
      }
    }
  }
}

export function toGoogle(conversation: Conversation) {
  validateConversation(conversation);

  return conversation
    .map((message) => ({
      role: message.role === "assistant" ? "model" : message.role, // Google uses 'model' for assistant messages
      parts: [{ text: message.content }],
    }))
    .filter((message) => message.role !== "system"); // Google handles system messages internally
}
