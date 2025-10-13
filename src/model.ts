import { AssistantMessage, Conversation, Stream } from "./message";
import { Result } from "./result";

export interface Model {
  chat(conversation: Conversation): Promise<Result<AssistantMessage>>;
  stream(conversation: Conversation): Stream;
  displayName(): string;
}
