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
  id: string;
  conversationId?: string; // Some APIs return id, some return conversationId
  participantA: string;
  participantB: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount?: number; // Add this field to track unread messages per conversation
}

export interface ChatStateModel {
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>; // Keyed by conversationId
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  activeConversationId: string | null;
  unreadCount: number;
  unreadMessages: ChatMessage[];
}
