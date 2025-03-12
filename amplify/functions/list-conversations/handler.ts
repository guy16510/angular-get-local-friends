import { DynamoDB } from 'aws-sdk';
import type { Schema } from '../../data/resource';
import { getCognitoIdentityId } from '../../shared/utils/identity';

const docClient = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env['CONVERSATION_TABLE_NAME'] || '';

export const handler: Schema["customListConversations"]["functionHandler"] = async (event) => {
  const identityId = getCognitoIdentityId(event.identity);
  if (!identityId) throw new Error("Unauthorized: Missing identity");

  const queryAParams = {
    TableName: TABLE_NAME,
    IndexName: 'conversationsByParticipantAAndLastTimestamp',
    KeyConditionExpression: 'participantA = :uid',
    ExpressionAttributeValues: { ':uid': identityId },
    ScanIndexForward: false
  };

  const queryBParams = {
    TableName: TABLE_NAME,
    IndexName: 'conversationsByParticipantBAndLastTimestamp',
    KeyConditionExpression: 'participantB = :uid',
    ExpressionAttributeValues: { ':uid': identityId },
    ScanIndexForward: false
  };

  const [resultA, resultB] = await Promise.all([
    docClient.query(queryAParams).promise(),
    docClient.query(queryBParams).promise()
  ]);

  const merged = [...(resultA.Items || []), ...(resultB.Items || [])];
  const dedupedMap = new Map();
  merged.forEach(item => {
    dedupedMap.set(item['conversationId'], item); // ✅ bracket notation here
  });

  const uniqueConversations = Array.from(dedupedMap.values());
  return JSON.stringify(uniqueConversations);
};