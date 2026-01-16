import {
  Message,
  userMessage,
  systemMessage,
  Conversation,
  isSystemMessage,
  isUserMessage,
} from "../types/message-v2";
import { StreamChunk, isEndChunk, isTextChunk, isThinkingChunk } from "../types/chunk";
import { textContent, thinkingContent, Content } from "../types/content";
import assert from "assert";
import { LLM } from "./base";
import { Result } from "../result";

export class Chat {
  private ongoingAgentContent: Content[] = [];

  constructor(
    public llm: LLM,
    public conversation: Conversation = [],
    public systemPrompt: string = "",
  ) {
    this.conversation = conversation;
    this.systemPrompt = systemPrompt;

    if (systemPrompt) {
      this.conversation = [systemMessage(systemPrompt), ...conversation];
    }

    assert(
      this.conversation.filter((message) => isSystemMessage(message)).length <=
        1,
      "There can only be at most one system message",
    );
  }

  changeLLM(llm: LLM) {
    this.llm = llm;
  }

  changeSystemPrompt(systemPrompt: string) {
    this.systemPrompt = systemPrompt;
    if (this.conversation[0] && isSystemMessage(this.conversation[0])) {
      this.conversation[0] = systemMessage(systemPrompt);
    } else {
      this.conversation = [systemMessage(systemPrompt), ...this.conversation];
    }
  }

  async message(content: string): Promise<Result<Message>> {
    this.conversation.push(userMessage(content));
    const response = await this.llm.chat(this.conversation);
    if (response.ok) {
      this.conversation.push(response.value.message);
      return { ok: true, value: response.value.message };
    }
    return response;
  }

  async *stream(content: string) {
    this.conversation.push(userMessage(content));
    const response = this.llm.stream(this.conversation);
    for await (const chunk of response) {
      this.addAgentChunk(chunk);
      yield chunk;
    }
  }

  private addAgentChunk(chunk: StreamChunk) {
    if (isEndChunk(chunk)) {
      this.conversation.push({
        role: "agent",
        content: this.ongoingAgentContent,
      });
      this.ongoingAgentContent = [];
      return;
    }

    if (isTextChunk(chunk)) {
      const lastContent =
        this.ongoingAgentContent[this.ongoingAgentContent.length - 1];
      if (lastContent && lastContent.type === "text") {
        lastContent.text += chunk.content;
      } else {
        this.ongoingAgentContent.push(textContent(chunk.content));
      }
    } else if (isThinkingChunk(chunk)) {
      const lastContent =
        this.ongoingAgentContent[this.ongoingAgentContent.length - 1];
      if (lastContent && lastContent.type === "thinking") {
        lastContent.thinking += chunk.content;
      } else {
        this.ongoingAgentContent.push(thinkingContent(chunk.content));
      }
    }
  }
}

export function validateConversationForChat(conversation: Conversation) {
  assert(conversation.length > 0, "Conversation cannot be empty");
  assert(
    isUserMessage(conversation[conversation.length - 1]),
    "Agent message cannot be the first message",
  );
}
