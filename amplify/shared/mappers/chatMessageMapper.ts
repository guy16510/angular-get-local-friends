export interface ChatMessage {
  id: string;
  conversationId: string;
  timestamp: string;
  senderId: string;
  recipientId: string;
  text: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export function toChatMessage(item: Record<string, any>): ChatMessage {
  return {
    id: item['id'],
    conversationId: item['conversationId'],
    timestamp: item['timestamp'],
    senderId: item['senderId'],
    recipientId: item['recipientId'],
    text: item['text'],
    createdAt: item['createdAt'] ?? null,
    updatedAt: item['updatedAt'] ?? null,
  };
}