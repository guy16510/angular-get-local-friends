import { DynamoDB } from 'aws-sdk';
import type { Schema } from '../../data/resource';
import { getIdentityId } from '../../shared/utils/identity';
import { toChatMessage } from '../../shared/mappers/chatMessageMapper';

const docClient = new DynamoDB.DocumentClient();

export const handler: Schema['createMessage']['functionHandler'] = async (event) => {
  const { recipientId, text } = event.arguments;
  const senderId = getIdentityId(event.identity);

  if (!senderId) {
    console.error("Missing identity: event.identity", event.identity);
    throw new Error("Unauthorized: Missing identity");
  }

  if (!recipientId || !text) {
    console.warn("Missing input params", { recipientId, text });
    throw new Error("Missing recipientId or text");
  }

  const [participantA, participantB] = [senderId, recipientId].sort();
  const conversationId = `${participantA}#${participantB}`;
  const timestamp = new Date().toISOString();
  const messageId = `${conversationId}-${timestamp}`;

  const chatMessage = {
    id: messageId,
    conversationId,
    timestamp,
    senderId,
    recipientId,
    text,
    type: 'text',
    status: 'sent',
    createdAt: timestamp,
    updatedAt: timestamp
  };

  const chatTableName = process.env['CHAT_MESSAGE_TABLE_NAME'];
  const conversationTableName = process.env['CONVERSATION_TABLE_NAME'];

  if (!chatTableName || !conversationTableName) {
    console.error("Missing env vars", { chatTableName, conversationTableName });
    throw new Error("Missing table environment variables");
  }

  // Write to ChatMessage table
  try {
    await docClient.put({
      TableName: chatTableName,
      Item: chatMessage
    }).promise();
    console.log(`📩 Message written to ${chatTableName}`, { messageId });
  } catch (err) {
    console.error("Failed to write ChatMessage", err);
    throw err;
  }

  // Upsert Conversation table
  try {
    console.log('Starting conversation update with details:', {
      conversationTableName,
      conversationId,
      participantA,
      participantB,
      text,
      timestamp,
      updateExpression: `
        set participantA = :pa,
            participantB = :pb,
            lastMessage = :lm,
            lastTimestamp = :lt,
            createdAt = if_not_exists(createdAt, :createdAt),
            updatedAt = :updatedAt
      `
    });
    const result = await docClient.update({
      TableName: conversationTableName,
      Key: { id: conversationId },
      UpdateExpression: `
        set participantA = :pa,
            participantB = :pb,
            lastMessage = :lm,
            lastTimestamp = :lt,
            createdAt = if_not_exists(createdAt, :createdAt),
            updatedAt = :updatedAt
      `,
      ExpressionAttributeValues: {
        ':pa': participantA,
        ':pb': participantB,
        ':lm': text,
        ':lt': timestamp,
        ':createdAt': timestamp,
        ':updatedAt': timestamp
      },
      ReturnValues: 'ALL_NEW'
    }).promise();
    console.log('Conversation update response:', result);

    console.log(`💬 Conversation upserted in ${conversationTableName}`, {
      conversationId,
      updated: result.Attributes
    });
  } catch (err) {
    console.error("Failed to upsert Conversation", err);
    throw err;
  }

  console.log('Returning chat message:', chatMessage);
  return toChatMessage(chatMessage);
};
