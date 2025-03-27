import { ChatMessage } from "../../models/chat";

export class LoadConversations {
  static readonly type = '[Chat] Load Conversations';
  constructor(public userId: string) {}
}

export class LoadMessages {
  static readonly type = '[Chat] Load Messages';
  constructor(public conversationId: string) {}
}

export class SendMessage {
  static readonly type = '[Chat] Send Message';
  constructor(public recipientId: string, public text: string) {}
}

export class AppendMessage {
  static readonly type = '[Chat] Append Message';
  constructor(public message: ChatMessage) {}
}

export class SetTypingStatus {
  static readonly type = '[Chat] Set Typing Status';
  constructor(public conversationId: string, public isTyping: boolean) {}
}

export class MarkMessagesAsRead {
  static readonly type = '[Chat] Mark Messages As Read';
  constructor(public conversationId: string) {}
}