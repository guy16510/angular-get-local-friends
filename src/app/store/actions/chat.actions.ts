// import { ChatMessage, Conversation } from "../../models/chat";

// export class LoadConversations {
//   static readonly type = '[Chat] Load Conversations';
// }

// export class LoadMessages {
//   static readonly type = '[Chat] Load Messages';
//   constructor(public conversationId: string, public limit?: number, public nextToken?: string) {}
// }

// export class SendMessage {
//   static readonly type = '[Chat] Send Message';
//   constructor(public recipientId: string, public text: string) {}
// }

// export class AppendMessage {
//   static readonly type = '[Chat] Append Message';
//   constructor(public message: ChatMessage) {}
// }

// export class UpdateTypingStatus {
//   static readonly type = '[Chat] Update Typing Status';
//   constructor(public conversationId: string, public userId: string, public isTyping: boolean) {}
// }

// export class UpdatePresenceStatus {
//   static readonly type = '[Chat] Update Presence Status';
//   constructor(public userId: string, public status: 'online' | 'away' | 'offline') {}
// }

import { ChatMessage, Conversation } from '../../models/chat';

export class SendMessage {
  static readonly type = '[Chat] Send Message';
  constructor(public conversationId: string, public content: string) {}
}

export class AppendMessage {
  static readonly type = '[Chat] Append Message';
  constructor(public conversationId: string, public message: ChatMessage) {}
}

export class LoadConversations {
  static readonly type = '[Chat] Load Conversations';
  constructor(public page: number = 1, public limit: number = 20) {}
}

export class LoadMessages {
  static readonly type = '[Chat] Load Messages';
  constructor(public conversationId: string, public page: number = 1, public limit: number = 50) {}
}

export class AddMessage {
  static readonly type = '[Chat] Add Message';
  constructor(public conversationId: string, public message: ChatMessage) {}
}

export class AcknowledgeMessage {
  static readonly type = '[Chat] Acknowledge Message';
  constructor(public messageId: string) {}
}

export class MarkMessageAsRead {
  static readonly type = '[Chat] Mark Message As Read';
  constructor(public messageId: string, public conversationId: string, public userId: string) {}
}

export class SetTypingStatus {
  static readonly type = '[Chat] Set Typing Status';
  constructor(public conversationId: string, public isTyping: boolean) {}
}