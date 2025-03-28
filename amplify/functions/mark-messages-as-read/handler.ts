import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import type { Schema } from '../../data/resource';
import { getIdentityId } from '../../shared/utils/identity';
import { sanitizeBigInts } from '../../shared/utils/sanitize';

const TABLE_NAME = process.env['CHAT_MESSAGE_TABLE_NAME'];
if (!TABLE_NAME) throw new Error('Missing CHAT_MESSAGE_TABLE_NAME');

const ddb = new DynamoDB({});
const docClient = DynamoDBDocument.from(ddb);

export const handler: Schema['markMessagesAsRead']['functionHandler'] = async (event) => {
  const { conversationId } = event.arguments;
  const identityId = getIdentityId(event.identity);

  if (!conversationId) throw new Error('Missing conversationId');
  if (!identityId) throw new Error('Unauthorized: No identity');

  try {
    const result = await docClient.query({
      TableName: TABLE_NAME,
      IndexName: 'chatMessagesByConversationIdAndTimestamp',
      KeyConditionExpression: 'conversationId = :convId',
      FilterExpression: 'recipientId = :userId AND #status = :sent',
      ExpressionAttributeValues: {
        ':convId': conversationId,
        ':userId': identityId,
        ':sent': 'sent',
      },
      ExpressionAttributeNames: {
        '#status': 'status',
      },
    });

    const messages = result.Items || [];

    if (messages.length === 0) return [];

    const now = new Date().toISOString();

    const updatedMessages = await Promise.all(
      messages.map(async (msg) => {
        const updated = await docClient.update({
          TableName: TABLE_NAME,
          Key: { id: msg['id'] },
          UpdateExpression: 'SET #status = :read, updatedAt = :now',
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: {
            ':read': 'read',
            ':now': now,
          },
          ReturnValues: 'ALL_NEW',
        });

        return sanitizeBigInts(updated.Attributes);
      })
    );

    return updatedMessages;
  } catch (err) {
    console.error('[markMessagesAsRead] Failed:', err);
    throw new Error('Internal server error');
  }
};
