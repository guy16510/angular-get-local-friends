// ===== amplify/functions/list-messages-by-conversation-id/handler.ts =====
import type { Schema } from '../../data/resource';
import { getIdentityId } from '../../shared/utils/identity';

export const handler: Schema['customListMessagesByConversationId']['functionHandler'] = async (event:any, context:any) => {
  const { conversationId, limit = 50, nextToken } = event.arguments;
  const requesterId = getIdentityId(event.identity);

  if (!conversationId) throw new Error('Missing conversationId');

  const participants = conversationId.split('#');
  if (!participants.includes(requesterId)) {
    throw new Error('Unauthorized: You are not a participant in this conversation');
  }

  const result = await context.db.ChatMessage.query.conversationId({
    conversationId,
    limit,
    nextToken,
    sortDirection: 'ASC'
  });

  console.log(`[listMessagesByConversationId] conversationId=${conversationId}, requesterId=${requesterId}, messages=${result.items.length}, nextToken=${result.nextToken}`);

  // Returning just the array of ChatMessage
  return result.items || [];
};