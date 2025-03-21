import { getIdentityId } from '../../shared/utils/identity';

export const handler = async (event: any, context: any) => {
  const { conversationId, messageId } = event.arguments;
  const userId = getIdentityId(event.identity);

  if (!conversationId || !messageId) throw new Error("Missing parameters");

  const message = await context.db.ChatMessage.get({ id: messageId });
  if (!message) throw new Error("Message not found");

  await context.db.ChatMessage.update({
    id: messageId,
    status: "seen"
  });

  const conversation = await context.db.Conversation.get({ id: conversationId });
  if (!conversation) throw new Error("Conversation not found");

  const updateFields: any = { id: conversationId };
  updateFields[`lastSeenBy_${userId}`] = messageId;

  await context.db.Conversation.update(updateFields);

  return { conversationId, userId, messageId };
};