import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../data/resource";
import { getIdentityId } from "../../shared/utils/identity";

const client = generateClient<Schema>();

export const handler = async (event:any) => {
  const requesterId = getIdentityId(event.identity); // ✅ original defensive coding preserved

  const { conversationId, limit = 50, nextToken } = event.arguments;

  if (!requesterId) {
    throw new Error("Unauthorized: missing requester ID");
  }

  try {
    const { data: messages, errors } = await client.models.ChatMessage.list({
      filter: {
        conversationId: { eq: conversationId },
        or: [
          { senderId: { eq: requesterId } },
          { recipientId: { eq: requesterId } },
        ],
      },
      limit,
      nextToken,
    });

    if (errors) {
      console.error("Errors fetching messages:", errors);
      throw new Error(`Errors fetching messages: ${errors.map(e => e.message).join(", ")}`);
    }

    return messages;
  } catch (error) {
    console.error("Unexpected error fetching messages:", error);
    throw error;
  }
};