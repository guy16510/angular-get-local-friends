export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  timestamp: string;
  text?: string;
  type?: string;
  mediaUrl?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Conversation {
  id: string;
  participantA: string;
  participantB: string;
  lastMessage: string;
  lastTimestamp: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatStateModel {
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  typingStatus: Record<string, string[]>;
  presence: Record<string, 'online' | 'away' | 'offline'>;
  pagination: Record<string, string | null>;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}