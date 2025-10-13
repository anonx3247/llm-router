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
import { OpenAI } from "openai";
import { ok, err, Result } from "./result";

export class OpenAIProvider implements Provider {
  private client: OpenAI;
  private modelName = "gpt-5-mini";
  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey: apiKey,
    });
  }

  displayName(): string {
    return `${this.modelName} [openai]`;
  }

  async chat(conversation: Conversation): Promise<Result<AssistantMessage>> {
    validateConversationForChat(conversation);
    const response = await this.client.responses.create({
      model: this.modelName,
      input: toOpenAI(conversation),
      reasoning: { effort: "high" }, // thinking is only in chat for this model unless I get verified access
    });
    if (!response.output_text) {
      return err(new Error("No response from OpenAI"));
    }
    return ok(assistantMessage(response.output_text));
  }

  async *stream(conversation: Conversation): AsyncIterable<Chunk> {
    validateConversationForChat(conversation);
    const response = await this.client.responses.create({
      model: this.modelName,
      input: toOpenAI(conversation),
      stream: true,
    });
    for await (const chunk of response) {
      if (chunk.type === "response.completed") {
        yield { type: "end", content: "" };
        return;
      } else if (chunk.type === "response.reasoning_text.delta") {
        yield { type: "thought", content: chunk.delta };
      } else if (chunk.type === "response.output_text.delta") {
        yield { type: "text", content: chunk.delta };
      }
    }
  }
}

export function toOpenAI(conversation: Conversation) {
  validateConversation(conversation);

  return conversation.map((message) => ({
    role:
      message.role === "system"
        ? "developer"
        : (message.role as "user" | "assistant" | "developer"),
    content: message.content,
  }));
}
