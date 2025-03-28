// Models

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface ReactionMap {
  [userId: string]: string; // userId -> emoji (e.g., 👍, ❤️, 😂)
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  text?: string;
  timestamp: string;
  status: MessageStatus;
  type?: string;
  mediaUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  reactions?: ReactionMap;
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
  messages: Record<string, ChatMessage[]>; // Keyed by conversationId
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  activeConversationId: string | null;
}
