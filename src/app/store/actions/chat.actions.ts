import {ChatMessage, Conversation} from '../../models/chat';

// chat.actions.ts
export class SetMessagesLoading {
  static readonly type = '[Chat] Set Messages Loading';
  constructor(public payload: boolean) {}
}
export class SetMessagesError {
  static readonly type = '[Chat] Set Messages Error';
  constructor(public payload: string) {}
}
export class SetConversationsLoading {
  static readonly type = '[Chat] Set Conversations Loading';
  constructor(public payload: boolean) {}
}
export class SetConversationsError {
  static readonly type = '[Chat] Set Conversations Error';
  constructor(public payload: string) {}
}
export class AddMessage {
  static readonly type = '[Chat] Add Message';
  constructor(public payload: ChatMessage) {}
}
export class SetConversations {
  static readonly type = '[Chat] Set Conversations';
  constructor(public payload: Conversation[]) {}
}