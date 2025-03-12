import { DynamoDB } from 'aws-sdk';
import type { Schema } from '../../data/resource';
import { getCognitoIdentityId } from '../../shared/utils/identity';

const docClient = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env['CHAT_MESSAGE_TABLE_NAME'] || '';

export const handler: Schema["customListMessagesByConversationId"]["functionHandler"] = async (event) => {
  const { conversationId } = event.arguments;
  const identityId = getCognitoIdentityId(event.identity);
  if (!identityId) throw new Error("Unauthorized: Missing identity");

  if (!conversationId) throw new Error("Missing conversationId");

  const sampleMsg = await docClient.query({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'conversationId = :cid',
    ExpressionAttributeValues: { ':cid': conversationId },
    Limit: 1
  }).promise();

  const oneMessage = sampleMsg.Items?.[0];
  if (oneMessage) {
    const isParticipant = [oneMessage['senderId'], oneMessage['recipientId']].includes(identityId); // ✅ bracket notation
    if (!isParticipant) {
      throw new Error("Unauthorized: You are not part of this conversation.");
    }
  }

  const result = await docClient.query({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'conversationId = :cid',
    ExpressionAttributeValues: { ':cid': conversationId },
    ScanIndexForward: true
  }).promise();

  return JSON.stringify(result.Items || []);
};