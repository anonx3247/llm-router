import { Content, textContent } from "./content";

export interface Message {
  role: "user" | "agent" | "system";
  content: Content[];
}

export type Conversation = Message[];

export function textMessage(
  role: "user" | "agent" | "system",
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

export function agentMessage(text: string): Message {
  return textMessage("agent", text);
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

export function isAgentMessage(message: Message): boolean {
  return message.role === "agent";
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
  if (isAgentMessage(conversation[0])) {
    throw new Error("Agent message cannot be the first message");
  }
}
