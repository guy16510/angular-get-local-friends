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
  constructor(public senderId: string, public recipientId: string, public text: string) {}
}