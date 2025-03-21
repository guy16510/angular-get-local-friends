// ===== amplify/functions/list-conversations/handler.ts =====
import type { Schema } from '../../data/resource';
import { getIdentityId } from '../../shared/utils/identity';
import { toConversation } from '../../shared/mappers/conversationMapper';

export const handler: Schema["customListConversations"]["functionHandler"] = async (event:any, context:any) => {
  const identityId = getIdentityId(event.identity);
  if (!identityId) throw new Error("Unauthorized: No identity provided.");

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

  console.log('[listConversations] fetched A:', resultA?.items?.length || 0);
  console.log('[listConversations] fetched B:', resultB?.items?.length || 0);

  const all = [
    ...(resultA?.items || []),
    ...(resultB?.items || [])
  ];

  const unique = new Map<string, any>();
  for (const conv of all) {
    unique.set(conv.id, conv); // dedupe by conversationId
  }

  const conversations = Array.from(unique.values()).sort((a, b) =>
    (b.lastTimestamp || '').localeCompare(a.lastTimestamp || '')
  );

  console.log('[listConversations] total unique conversations:', conversations.length);

  return {
    items: conversations.map(toConversation),
    nextTokenA: resultA?.nextToken || null,
    nextTokenB: resultB?.nextToken || null
  };
};