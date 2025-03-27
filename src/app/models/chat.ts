// Models
export interface ChatMessage {
  conversationId: string;
  senderId: string;
  recipientId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read'; // new
}

export interface Conversation {
  conversationId: string;
  id: string;
  participantA: string;
  participantB: string;
  lastMessage: string;
  lastTimestamp: string;
}

export interface ChatStateModel {
  conversations: Conversation[];
  messages: ChatMessage[];
}