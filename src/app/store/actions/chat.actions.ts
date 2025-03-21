import { ChatMessage, Conversation } from "../../models/chat";

export class LoadConversations {
  static readonly type = '[Chat] Load Conversations';
}

export class LoadMessages {
  static readonly type = '[Chat] Load Messages';
  constructor(public conversationId: string, public limit?: number, public nextToken?: string) {}
}

export class SendMessage {
  static readonly type = '[Chat] Send Message';
  constructor(public recipientId: string, public text: string) {}
}

export class AppendMessage {
  static readonly type = '[Chat] Append Message';
  constructor(public message: ChatMessage) {}
}

export class UpdateTypingStatus {
  static readonly type = '[Chat] Update Typing Status';
  constructor(public conversationId: string, public userId: string, public isTyping: boolean) {}
}

export class UpdatePresenceStatus {
  static readonly type = '[Chat] Update Presence Status';
  constructor(public userId: string, public status: 'online' | 'away' | 'offline') {}
}