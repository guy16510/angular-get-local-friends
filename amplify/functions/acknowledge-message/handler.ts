import { getIdentityId } from '../../shared/utils/identity';

export const handler = async (event: any, context: any) => {
  const { messageId } = event.arguments;
  const userId = getIdentityId(event.identity);

  if (!messageId) throw new Error("Missing messageId");

  const message = await context.db.ChatMessage.get({ id: messageId });
  if (!message) throw new Error("Message not found");

  if (message.recipientId !== userId) {
    throw new Error("Unauthorized: You are not the recipient of this message");
  }

  await context.db.ChatMessage.update({
    id: messageId,
    status: "delivered"
  });

  return { id: messageId, status: "delivered" };
};