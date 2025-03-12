export interface Conversation {
  id: string;
  conversationId: string;
  participantA: string;
  participantB: string;
  lastMessage: string;
  lastTimestamp: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  owner?: string;
}

export function toConversation(item: Record<string, any>): Conversation {
  return {
    id: item['id'], // ← REQUIRED NOW
    conversationId: item['conversationId'],
    participantA: item['participantA'],
    participantB: item['participantB'],
    lastMessage: item['lastMessage'],
    lastTimestamp: item['lastTimestamp'],
    createdAt: item['createdAt'] ?? null,
    updatedAt: item['updatedAt'] ?? null,
    owner: item['owner'] ?? undefined
  };
}