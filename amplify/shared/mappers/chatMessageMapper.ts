export interface ChatMessage {
    conversationId: string;
    timestamp: string;
    senderId: string;
    recipientId: string;
    text: string;
    id?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
  }
  
  export function toChatMessage(item: Record<string, any>): ChatMessage {
    return {
      conversationId: item['conversationId'],
      timestamp: item['timestamp'],
      senderId: item['senderId'],
      recipientId: item['recipientId'],
      text: item['text'],
      id: item['id'] ?? null,
      createdAt: item['createdAt'] ?? null,
      updatedAt: item['updatedAt'] ?? null,
    };
  }