import { DynamoDB } from 'aws-sdk';
import type { Schema } from '../../data/resource';
const docClient = new DynamoDB.DocumentClient();

export const handler: Schema["customListConversations"]["functionHandler"] = async (event) => {
  const { userId } = event.arguments;

  const conversationTableName = process.env['CONVERSATION_TABLE_NAME'] || '';
  if (!conversationTableName) {
    throw new Error("CONVERSATION_TABLE_NAME environment variable is not set.");
  }

  // Query index on participantA
  const queryAParams = {
    TableName: conversationTableName,
    IndexName: 'conversationsByParticipantAAndLastTimestamp',
    KeyConditionExpression: 'participantA = :uid',
    ExpressionAttributeValues: {
      ':uid': userId,
    },
    ScanIndexForward: false
  };

  const queryBParams = {
    TableName: conversationTableName,
    IndexName: 'conversationsByParticipantBAndLastTimestamp',
    KeyConditionExpression: 'participantB = :uid',
    ExpressionAttributeValues: {
      ':uid': userId,
    },
    ScanIndexForward: false
  };

  const [resultA, resultB] = await Promise.all([
    docClient.query(queryAParams).promise(),
    docClient.query(queryBParams).promise()
  ]);

  // Combine and deduplicate
  const merged = [...(resultA.Items || []), ...(resultB.Items || [])];
  const dedupedMap = new Map();
  merged.forEach(item => {
    dedupedMap.set(item['conversationId'], item);
  });

  const uniqueConversations = Array.from(dedupedMap.values());
  return JSON.stringify(uniqueConversations);
};