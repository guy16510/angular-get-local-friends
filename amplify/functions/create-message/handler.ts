import { DynamoDB } from 'aws-sdk';
import type { Schema } from '../../data/resource';
import { getCognitoIdentityId } from '../../shared/utils/identity';

const docClient = new DynamoDB.DocumentClient();

export const handler: Schema["createMessage"]["functionHandler"] = async (event) => {
  const { recipientId, text } = event.arguments;

  // 🔐 Ensure sender is the logged-in user (from Cognito identity)

  const senderId = getCognitoIdentityId(event.identity);

  if (!senderId) {
    throw new Error("Unauthorized: Missing identity");
  }

  // 💬 Compose conversationId
  const conversationId = [senderId, recipientId].sort().join('#');
  const timestamp = new Date().toISOString();
  const messageId = `${conversationId}-${timestamp}`;

  const chatMessage = {
    id: messageId,
    conversationId,
    timestamp,
    senderId,
    recipientId,
    text,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  // ✅ Write message to ChatMessage table
  const chatTableName = process.env['CHAT_MESSAGE_TABLE_NAME'] || '';
  if (!chatTableName) throw new Error("Missing CHAT_MESSAGE_TABLE_NAME");

  await docClient.put({
    TableName: chatTableName,
    Item: chatMessage
  }).promise();

  // ✅ Upsert conversation summary
  const conversationTableName = process.env['CONVERSATION_TABLE_NAME'] || '';
  if (!conversationTableName) throw new Error("Missing CONVERSATION_TABLE_NAME");

  const [participantA, participantB] = [senderId, recipientId].sort();

  await docClient.update({
    TableName: conversationTableName,
    Key: { conversationId },
    UpdateExpression: `
      set participantA = :pa,
          participantB = :pb,
          lastMessage = :lm,
          lastTimestamp = :lt,
          createdAt = if_not_exists(createdAt, :createdAt),
          updatedAt = :updatedAt
    `,
    ExpressionAttributeValues: {
      ":pa": participantA,
      ":pb": participantB,
      ":lm": text,
      ":lt": timestamp,
      ":createdAt": timestamp,
      ":updatedAt": timestamp
    },
    ReturnValues: "ALL_NEW"
  }).promise();

  return JSON.stringify(chatMessage);
};