// ===== amplify/functions/list-conversations/handler.ts =====
import type { Schema } from '../../data/resource';
import { getIdentityId } from '../../shared/utils/identity';
import { toConversation } from '../../shared/mappers/conversationMapper';

export const handler: Schema['customListConversations']['functionHandler'] = async (event:any, context:any) => {
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

  const all = [
    ...(resultA?.items || []),
    ...(resultB?.items || [])
  ];
  
  // THEN this works fine:
  const uniqueMap = new Map<string, typeof all[number]>();
  for (const conv of all) uniqueMap.set(conv.id, conv);
  
  const conversations = Array.from(uniqueMap.values()).sort((a, b) =>
    (b.lastTimestamp ?? '').localeCompare(a.lastTimestamp ?? '')
  );

  console.log(`[listConversations] total unique: ${conversations.length}`);
  return conversations.map(toConversation);
};