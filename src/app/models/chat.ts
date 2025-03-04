export interface ChatMessage {
  conversationId: string;
  timestamp: string;
  senderId: string;
  recipientId: string;
  text: string;
}

export interface Conversation {
  conversationId: string;
  participantA: string;
  participantB: string;
  lastMessage: string;
  lastTimestamp: string;
}
