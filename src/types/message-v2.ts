import { Content, textContent } from "./content";

export interface Message {
  role: "user" | "assistant" | "system";
  content: Content[];
}

export type Conversation = Message[];

export function textMessage(
  role: "user" | "assistant" | "system",
  text: string,
): Message {
  return {
    role,
    content: [textContent(text)],
  };
}

export function userMessage(text: string): Message {
  return textMessage("user", text);
}

export function assistantMessage(text: string): Message {
  return textMessage("assistant", text);
}

export function systemMessage(text: string): Message {
  return textMessage("system", text);
}

export function getMessageText(message: Message): string {
  return message.content
    .filter((c) => c.type === "text")
    .map((c: any) => c.text)
    .join("");
}

export function addContent(message: Message, content: Content): Message {
  return {
    ...message,
    content: [...message.content, content],
  };
}

export function isUserMessage(message: Message): boolean {
  return message.role === "user";
}

export function isAssistantMessage(message: Message): boolean {
  return message.role === "assistant";
}

export function isSystemMessage(message: Message): boolean {
  return message.role === "system";
}

export function getSystemMessage(
  conversation: Conversation,
): Message | undefined {
  return conversation.find((message) => isSystemMessage(message));
}

export function validateConversation(conversation: Conversation): void {
  if (conversation.length === 0) {
    throw new Error("Conversation cannot be empty");
  }
  if (isAssistantMessage(conversation[0])) {
    throw new Error("Assistant message cannot be the first message");
  }
}
