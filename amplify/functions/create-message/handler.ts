// ===== amplify/functions/create-message/handler.ts =====
import type { Schema } from '../../data/resource';
import { getIdentityId } from '../../shared/utils/identity';
import { toChatMessage } from '../../shared/mappers/chatMessageMapper';

export const handler: Schema['createMessage']['functionHandler'] = async (event, context: any) => {
  const { recipientId, text } = event.arguments;

  const senderId = getIdentityId(event.identity);
  if (!senderId) throw new Error("Unauthorized: Missing identity");

  if (!recipientId || !text) throw new Error("Missing recipientId or text");

  const [participantA, participantB] = [senderId, recipientId].sort();
  const conversationId = `${participantA}#${participantB}`;
  const timestamp = new Date().toISOString();
  const messageId = `${conversationId}-${timestamp}`;

  const chatMessage = {
    id: messageId,
    conversationId,
    senderId,
    recipientId,
    text,
    timestamp,
    type: 'text',
    status: 'sent',
    createdAt: timestamp,
    updatedAt: timestamp
  };

  // Create message
  await context.db.ChatMessage.create(chatMessage);

  // Update conversation summary (upsert)
  const existing = await context.db.Conversation.get({ id: conversationId });

  await context.db.Conversation.update({
    id: conversationId,
    participantA,
    participantB,
    lastMessage: text,
    lastTimestamp: timestamp,
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp
  });

  return toChatMessage(chatMessage);
}; 