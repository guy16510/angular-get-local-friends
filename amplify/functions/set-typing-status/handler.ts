// set-typing-status/handler.ts
import type { Schema } from '../../data/resource';
import { getIdentityId } from '../../shared/utils/identity';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const TYPING_STATUS_TABLE = process.env['CHAT_MESSAGE_TABLE_NAME']!;
if (!TYPING_STATUS_TABLE) throw new Error("Missing environment variable: AMPLIFY_TYPING_STATUS_TABLE_NAME");

const ddbClient = new DynamoDB({});
const docClient = DynamoDBDocument.from(ddbClient);

export const handler: Schema["setTypingStatus"]["functionHandler"] = async (event: any) => {
  const { conversationId, isTyping } = event.arguments;
  const userId = getIdentityId(event.identity);

  if (!conversationId) {
    console.error("Missing conversationId");
    throw new Error("Missing conversationId");
  }

  const now = new Date().toISOString();
  // TTL: set for 5 minutes (300 seconds) from now.
  const ttl = Math.floor(Date.now() / 1000) + (5 * 60);
  // Create a composite id from conversationId and userId
  const id = `${conversationId}#${userId}`;

  try {
    // Put the item including the generated "id" and createdAt timestamp.
    await docClient.put({
      TableName: TYPING_STATUS_TABLE,
      Item: {
        id,
        conversationId,
        userId,
        isTyping,
        updatedAt: now,
        createdAt: now,
        ttl,
      },
    });

    return { id, conversationId, userId, isTyping, updatedAt: now, createdAt: now };
  } catch (err) {
    console.error(`[setTypingStatus] Error:`, err);
    throw new Error("Internal server error");
  }
};