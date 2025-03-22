// set-typing-status/handler.ts
import type { Schema } from '../../data/resource';
import { getIdentityId } from '../../shared/utils/identity';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const TYPING_STATUS_TABLE = process.env['CHAT_MESSAGE_TABLE_NAME']!;
if (!TYPING_STATUS_TABLE) throw new Error("Missing environment variable: AMPLIFY_TYPING_STATUS_TABLE_NAME");

const ddbClient = new DynamoDB({});
const docClient = DynamoDBDocument.from(ddbClient);

export const handler = async (event: any) => {
  const { conversationId, isTyping } = event.arguments;
  const userId = getIdentityId(event.identity);

  if (!conversationId) {
    console.error("Missing conversationId");
    throw new Error("Missing conversationId");
  }

  const now = new Date().toISOString();
  // Set TTL for 5 minutes from now (adjust the minutes as needed)
  const ttl = Math.floor(Date.now() / 1000) + (5 * 60);

  try {
    // Put will create or replace the existing record
    await docClient.put({
      TableName: TYPING_STATUS_TABLE,
      Item: {
        conversationId,
        userId,
        isTyping,
        updatedAt: now,
        ttl,
      },
    });

    return { conversationId, userId, isTyping };
  } catch (err) {
    console.error(`[setTypingStatus] Error:`, err);
    throw new Error("Internal server error");
  }
};