import { DynamoDB } from 'aws-sdk';
import type { Schema } from '../../data/resource';
import { getIdentityId } from '../../shared/utils/identity';
import { toConversation } from '../../shared/mappers/conversationMapper';

const docClient = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env['CONVERSATION_TABLE_NAME'] || '';

export const handler: Schema["customListConversations"]["functionHandler"] = async (event) => {
  const identityId = getIdentityId(event.identity);
  if (!identityId) throw new Error("Unauthorized: No identity provided.");

  const [participantAResult, participantBResult] = await Promise.all([
    docClient.query({
      TableName: TABLE_NAME,
      IndexName: 'conversationsByParticipantAAndLastTimestamp',
      KeyConditionExpression: 'participantA = :uid',
      ExpressionAttributeValues: { ':uid': identityId },
      ScanIndexForward: false,
    }).promise(),

    docClient.query({
      TableName: TABLE_NAME,
      IndexName: 'conversationsByParticipantBAndLastTimestamp',
      KeyConditionExpression: 'participantB = :uid',
      ExpressionAttributeValues: { ':uid': identityId },
      ScanIndexForward: false,
    }).promise()
  ]);

  const conversations = [...(participantAResult.Items || []), ...(participantBResult.Items || [])];

  const uniqueConversations = new Map(conversations.map(c => [c['id'], c]));
  
  return Array.from(uniqueConversations.values()).map(toConversation);
};