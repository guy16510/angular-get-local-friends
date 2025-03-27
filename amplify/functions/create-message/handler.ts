import { DynamoDB } from 'aws-sdk';
import type { Schema } from '../../data/resource';
import { getIdentityId } from '../../shared/utils/identity';
import { toChatMessage } from '../../shared/mappers/chatMessageMapper';

const docClient = new DynamoDB.DocumentClient();

export const handler: Schema['createMessage']['functionHandler'] = async (event) => {
  const { recipientId, text } = event.arguments;

  const senderId = getIdentityId(event.identity);
  if (!senderId) {
    throw new Error("Unauthorized: Missing identity");
  }

  if (!recipientId || !text) {
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
    createdAt: timestamp,
    updatedAt: timestamp
  };

  const chatTableName = process.env['CHAT_MESSAGE_TABLE_NAME'];
  if (!chatTableName) throw new Error("Missing CHAT_MESSAGE_TABLE_NAME");

  await docClient.put({
    TableName: chatTableName,
    Item: chatMessage
  }).promise();

  const conversationTableName = process.env['CONVERSATION_TABLE_NAME'];
  if (!conversationTableName) throw new Error("Missing CONVERSATION_TABLE_NAME");

  console.log('Upserting conversation record with values:', {
    conversationTableName,
    id: conversationId,
    participantA,
    participantB,
    lastMessage: text,
    lastTimestamp: timestamp
  });

  const updateResult = await docClient.update({
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

  console.log('Conversation update result:', updateResult.Attributes);

  return toChatMessage(chatMessage);
};
