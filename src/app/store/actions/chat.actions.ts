import { ChatMessage } from '../../models/chat';

export class SendMessage {
    static readonly type = '[Chat] Send Message';
    constructor(public payload: { userId: string; text: string }) {}
  }
  
  export class ReceiveMessage {
    static readonly type = '[Chat] Receive Message';
    constructor(public payload: { message: ChatMessage }) {}
  }
