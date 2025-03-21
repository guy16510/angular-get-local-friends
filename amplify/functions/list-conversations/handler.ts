// ===== amplify/functions/list-conversations/handler.ts =====
import type { Schema } from '../../data/resource';
import { getIdentityId } from '../../shared/utils/identity';
import { randomUUID } from 'crypto';

// Define strict return shape based on actual DB result structure
type ConversationItem = {
  id: string;
  participantA: string;
  participantB: string;
  lastMessage: string;
  lastTimestamp: string;
  createdAt?: string;
  updatedAt?: string;
};

export const handler = async (event:any, context:any) => {
  const identityId = getIdentityId(event.identity);
  if (!identityId) throw new Error('Unauthorized: No identity provided.');

  const limit = event.arguments?.limit ?? 50;
  const nextTokenA = event.arguments?.nextTokenA || undefined;
  const nextTokenB = event.arguments?.nextTokenB || undefined;

  console.log('[listConversations] identityId:', identityId);
  console.log('[listConversations] limit:', limit);
  console.log('[listConversations] nextTokenA:', nextTokenA);
  console.log('[listConversations] nextTokenB:', nextTokenB);

  const [resultA, resultB] = await Promise.all([
    context.db.Conversation.query.participantA({
      participantA: identityId,
      sortDirection: 'DESC',
      limit,
      nextToken: nextTokenA
    }),
    context.db.Conversation.query.participantB({
      participantB: identityId,
      sortDirection: 'DESC',
      limit,
      nextToken: nextTokenB
    })
  ]);

  console.log('[listConversations] resultA items:', resultA?.items?.length ?? 0);
  console.log('[listConversations] resultB items:', resultB?.items?.length ?? 0);

  const all: ConversationItem[] = [
    ...(resultA?.items || []),
    ...(resultB?.items || [])
  ];

  const unique = new Map<string, ConversationItem>();
  for (const conv of all) {
    unique.set(conv.id, conv);
  }

  const conversations: (ConversationItem | null | undefined)[] = Array.from(unique.values())
    .sort((a, b) =>
      (b?.lastTimestamp ?? '').localeCompare(a?.lastTimestamp ?? '')
    );

  console.log('[listConversations] unique sorted conversations:', conversations.length);

  return {
    id: `paginated-conv-${randomUUID()}`,
    items: conversations,
    nextTokenA: resultA?.nextToken ?? null,
    nextTokenB: resultB?.nextToken ?? null
  };
};