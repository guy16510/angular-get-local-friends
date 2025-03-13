import { DynamoDB } from 'aws-sdk';
import type { Schema } from '../../data/resource'
import { getCognitoIdentityId } from '../../shared/utils/identity';
import { toChatMessage, ChatMessage } from '../../shared/mappers/chatMessageMapper';

const docClient = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env['CHAT_MESSAGE_TABLE_NAME'] || '';

export const handler: Schema["customListMessagesByConversationId"]["functionHandler"] = async (event): Promise<ChatMessage[]> => {
  const { conversationId } = event.arguments;

  console.log("Received conversationId:", conversationId);
  console.log("Incoming identity:", JSON.stringify(event.identity));

  const identityId = getCognitoIdentityId(event.identity);
  if (!identityId) throw new Error("Unauthorized");

  if (!conversationId) throw new Error("Missing conversationId");

  if (!/^[\w\-#:]+$/.test(conversationId)) {
    throw new Error("Invalid conversationId format.");
  }

  const sampleMsg = await docClient.query({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'id = :id AND conversationId = :cid',
    ExpressionAttributeValues: { ':cid': conversationId },
    Limit: 1
  }).promise();

  const oneMessage = sampleMsg.Items?.[0];
  if (oneMessage) {
    const isParticipant = [oneMessage['senderId'], oneMessage['recipientId']].includes(identityId);
    if (!isParticipant) {
      throw new Error("Unauthorized: You are not part of this conversation.");
    }
  }

  const result = await docClient.query({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'id = :id AND conversationId = :cid',
    ExpressionAttributeValues: { ':cid': conversationId },
    ScanIndexForward: true
  }).promise();

  return (result.Items || []).map(toChatMessage);
};