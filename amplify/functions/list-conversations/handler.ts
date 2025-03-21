import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { getIdentityId } from '../../shared/utils/identity';
import { sanitizeBigInts } from '../../shared/utils/sanitize';

const TABLE_NAME = process.env['CONVERSATION_TABLE_NAME']!;
if (!TABLE_NAME) throw new Error("Missing environment variable: CONVERSATION_TABLE_NAME");

const ddbClient = new DynamoDB({});
const docClient = DynamoDBDocument.from(ddbClient);

export const handler = async (event: any) => {
  const requesterId = getIdentityId(event.identity);
  if (!requesterId) throw new Error("Unauthorized: missing requester ID");

  const { limit = 20, nextTokenA, nextTokenB } = event.arguments;

  try {
    // Query the Conversation table using the secondary indexes for participantA and participantB
    const [resultA, resultB] = await Promise.all([
      docClient.query({
        TableName: TABLE_NAME,
        IndexName: 'conversationsByParticipantAAndLastTimestamp',  // Ensure this matches the index name in your DynamoDB (from your schema)
        KeyConditionExpression: 'participantA = :participant',
        ExpressionAttributeValues: {
          ':participant': requesterId,
        },
        ExclusiveStartKey: nextTokenA ? JSON.parse(nextTokenA) : undefined,
        Limit: limit,
      }),
      docClient.query({
        TableName: TABLE_NAME,
        IndexName: 'conversationsByParticipantBAndLastTimestamp',  // Ensure this matches the index name in your DynamoDB (from your schema)
        KeyConditionExpression: 'participantB = :participant',
        ExpressionAttributeValues: {
          ':participant': requesterId,
        },
        ExclusiveStartKey: nextTokenB ? JSON.parse(nextTokenB) : undefined,
        Limit: limit,
      }),
    ]);

    const conversationsA = resultA.Items || [];
    const conversationsB = resultB.Items || [];
    const combinedConversations = [...conversationsA, ...conversationsB];

    // Since each query returns items sorted by lastTimestamp in ascending order (per your index),
    // we manually sort the merged list descending (newest first).
    combinedConversations.sort((a, b) =>
      new Date(b['lastTimestamp']).getTime() - new Date(a['lastTimestamp']).getTime()
    );

    // Sanitize items (if needed) to handle BigInts
    const sanitized = combinedConversations.map(item => sanitizeBigInts(item));

    return {
      conversations: sanitized.slice(0, limit),
      nextTokenA: resultA.LastEvaluatedKey ? JSON.stringify(resultA.LastEvaluatedKey) : null,
      nextTokenB: resultB.LastEvaluatedKey ? JSON.stringify(resultB.LastEvaluatedKey) : null,
    };
  } catch (err) {
    console.error("[listConversations] Error:", err);
    throw new Error("Internal server error");
  }
};