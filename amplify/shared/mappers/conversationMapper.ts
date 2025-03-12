export interface Conversation {
    conversationId: string;
    participantA: string;
    participantB: string;
    lastMessage: string;
    lastTimestamp: string;
    createdAt?: string | null;
    updatedAt?: string | null;
  }
  
  export function toConversation(item: Record<string, any>): Conversation {
    return {
      conversationId: item['conversationId'],
      participantA: item['participantA'],
      participantB: item['participantB'],
      lastMessage: item['lastMessage'],
      lastTimestamp: item['lastTimestamp'],
      createdAt: item['createdAt'] ?? null,
      updatedAt: item['updatedAt'] ?? null,
    };
  }