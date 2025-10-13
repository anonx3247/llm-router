export type Conversation = Message[];

export function getSystemMessage(
  conversation: Conversation,
): SystemMessage | undefined {
  return conversation.find((message) => isSystemMessage(message)) as
    | SystemMessage
    | undefined;
}

export type Chunk =
  | {
      type: "text";
      content: string;
    }
  | End
  | Thought;

export type End = {
  type: "end";
  content: "";
};

export type Thought = {
  type: "thought";
  content: string;
};

export function isThought(chunk: Chunk): chunk is Thought {
  return chunk.type === "thought";
}

export function isEnd(chunk: Chunk): chunk is End {
  return chunk.type === "end";
}

export function isText(chunk: Chunk): boolean {
  return chunk.type === "text";
}

export type Stream = AsyncIterable<Chunk>;

export type Message = UserMessage | AssistantMessage | SystemMessage;

export function isAssistantMessage(
  message: Message,
): message is AssistantMessage {
  return message.role === "assistant";
}

export function isUserMessage(message: Message): message is UserMessage {
  return message.role === "user";
}

export function isSystemMessage(message: Message): message is SystemMessage {
  return message.role === "system";
}

export type UserMessage = {
  role: "user";
  content: string;
};

export function userMessage(content: string): UserMessage {
  return { role: "user", content };
}

export type AssistantMessage = {
  role: "assistant";
  content: string;
};

export function assistantMessage(content: string): AssistantMessage {
  return { role: "assistant", content };
}

export type SystemMessage = {
  role: "system";
  content: string;
};

export function systemMessage(content: string): SystemMessage {
  return { role: "system", content };
}

export function validateConversation(conversation: Conversation) {
  if (conversation.length === 0) {
    throw new Error("Conversation cannot be empty");
  }
  if (isAssistantMessage(conversation[0])) {
    throw new Error("Assistant message cannot be the first message");
  }
}
