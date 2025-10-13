import {
  AssistantMessage,
  assistantMessage,
  Chunk,
  Conversation,
  isEnd,
  isSystemMessage,
  isUserMessage,
  systemMessage,
  userMessage,
} from "./message";
import assert from "assert";
import { Model } from "./model";
import { Result } from "./result";

export class Chat {
  private ongoingAssistantMessageContent: string = "";
  constructor(
    public model: Model,
    public conversation: Conversation = [],
    public systemPrompt: string = "",
  ) {
    this.conversation = conversation;
    this.systemPrompt = systemPrompt;
    this.conversation = [systemMessage(systemPrompt), ...conversation];
    assert(
      this.conversation.filter((message) => isSystemMessage(message)).length <=
        1,
      "There can only be at most one system message",
    );
  }

  changeModel(model: Model) {
    this.model = model;
  }

  changeSystemPrompt(systemPrompt: string) {
    this.systemPrompt = systemPrompt;
    if (this.conversation[0].role === "system") {
      this.conversation[0] = systemMessage(systemPrompt);
    } else {
      this.conversation = [systemMessage(systemPrompt), ...this.conversation];
    }
  }

  /*
   * Sends a message to the model and returns the response.
   */
  async message(content: string): Promise<Result<AssistantMessage>> {
    this.conversation.push(userMessage(content));
    const response = await this.model.chat(this.conversation);
    if (response.ok) {
      this.conversation.push(response.value);
    }
    return response;
  }

  /*
   * Sends a message to the model and returns the response as a stream.
   */
  async *stream(content: string) {
    this.conversation.push(userMessage(content));
    const response = this.model.stream(this.conversation);
    for await (const chunk of response) {
      this.addAssitantChunk(chunk);
      yield chunk;
    }
  }

  private addAssitantChunk(chunk: Chunk) {
    if (isEnd(chunk)) {
      this.conversation.push(
        assistantMessage(this.ongoingAssistantMessageContent),
      );
      this.ongoingAssistantMessageContent = "";
      return;
    } else {
      this.ongoingAssistantMessageContent += chunk.content;
    }
  }
}

export function validateConversationForChat(conversation: Conversation) {
  assert(conversation.length > 0, "Conversation cannot be empty");
  assert(
    isUserMessage(conversation[conversation.length - 1]),
    "Assistant message cannot be the first message",
  );
}
