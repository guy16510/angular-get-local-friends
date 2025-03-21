import { getIdentityId } from '../../shared/utils/identity';

export const handler = async (event: any, context: any) => {
  const { conversationId, isTyping } = event.arguments;
  const userId = getIdentityId(event.identity);

  if (!conversationId) throw new Error("Missing conversationId");

  const now = new Date().toISOString();

  await context.db.TypingStatus.create({
    conversationId,
    userId,
    isTyping,
    updatedAt: now
  });

  return { conversationId, userId, isTyping };
};