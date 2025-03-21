import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { sanitizeBigInts } from '../../shared/utils/sanitize';
import { getIdentityId } from '../../shared/utils/identity';

const TABLE_NAME = process.env['CHAT_MESSAGE_TABLE_NAME']!;
if (!TABLE_NAME) throw new Error("Missing environment variable: CHAT_MESSAGE_TABLE_NAME");

const ddbClient = new DynamoDB({});
const docClient = DynamoDBDocument.from(ddbClient);

export const handler = async (event: any) => {
  const requesterId = getIdentityId(event.identity);
  if (!requesterId) throw new Error("Unauthorized: missing requester ID");

  const { conversationId, limit = 50, nextToken } = event.arguments;

  try {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'chatMessagesByConversationIdAndTimestamp', // This should match the secondary index name in your schema
      KeyConditionExpression: 'conversationId = :conversationId',
      FilterExpression: 'senderId = :requester OR recipientId = :requester',
      ExpressionAttributeValues: {
        ':conversationId': conversationId,
        ':requester': requesterId,
      },
      Limit: limit,
      ExclusiveStartKey: nextToken ? JSON.parse(nextToken) : undefined,
    };

    const result = await docClient.query(params);
    const items = result.Items || [];

    // Since the index sorts by timestamp in ascending order by default, re-sort descending (newest first)
    items.sort(
      (a, b) => new Date(b['timestamp']).getTime() - new Date(a['timestamp']).getTime()
    );

    const sanitized = items.map(item => sanitizeBigInts(item));

    return {
      messages: sanitized,
      nextToken: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null,
    };
  } catch (err) {
    console.error('[listMessagesByConversationId] Error:', err);
    throw new Error("Internal server error");
  }
};