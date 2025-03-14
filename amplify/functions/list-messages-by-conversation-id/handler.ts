import { DynamoDB } from 'aws-sdk';
import type { Schema } from '../../data/resource';
import { getCognitoIdentityId } from '../../shared/utils/identity';
import { toChatMessage } from '../../shared/mappers/chatMessageMapper';

const docClient = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env['CHAT_MESSAGE_TABLE_NAME'] || '';

export const handler: Schema["customListMessagesByConversationId"]["functionHandler"] = async (event) => {
  const { conversationId } = event.arguments;

  if (!conversationId) throw new Error("Missing conversationId");

  const identityId = getCognitoIdentityId(event.identity);
  if (!identityId) throw new Error("Unauthorized");

  const result = await docClient.query({
    TableName: TABLE_NAME,
    IndexName: 'conversationId', // Explicitly query secondary index
    KeyConditionExpression: 'conversationId = :cid',
    ExpressionAttributeValues: { ':cid': conversationId },
    ScanIndexForward: true
  }).promise();

  const items = result.Items || [];

  if (items.length > 0) {
    const authorized = items.some(msg => [msg['senderId'], msg['recipientId']].includes(identityId));
    if (!authorized) throw new Error("Unauthorized: You're not a participant in this conversation.");
  }

  return items.map(toChatMessage);
};