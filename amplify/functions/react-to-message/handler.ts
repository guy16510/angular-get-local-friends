import { DynamoDB } from 'aws-sdk';
import type { Schema } from '../../data/resource';
import { getIdentityId } from '../../shared/utils/identity';

const docClient = new DynamoDB.DocumentClient();

export const handler: Schema['reactToMessage']['functionHandler'] = async (event) => {
  const { messageId, emoji } = event.arguments;
  const userId = getIdentityId(event.identity);
  if (!userId) throw new Error("Unauthorized");

  const tableName = process.env['CHAT_MESSAGE_TABLE_NAME'];
  if (!tableName) throw new Error("Missing CHAT_MESSAGE_TABLE_NAME");

  const timestamp = new Date().toISOString();

  const updateResult = await docClient.update({
    TableName: tableName,
    Key: { id: messageId },
    UpdateExpression: 'SET reactions = if_not_exists(reactions, :emptyMap), reactions.#uid = :emoji, updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#uid': userId,
    },
    ExpressionAttributeValues: {
      ':emoji': emoji,
      ':updatedAt': timestamp,
      ':emptyMap': {},
    },
    ReturnValues: 'ALL_NEW'
  }).promise();
  

  const updatedItem = updateResult.Attributes;

  if (!updatedItem) {
    throw new Error("Message not found or update failed");
  }

  // 🔁 Ensure the object you return matches the GraphQL schema for `ChatMessage`
  return {
    id: updatedItem['id'],
    conversationId: updatedItem['conversationId'],
    senderId: updatedItem['senderId'],
    recipientId: updatedItem['recipientId'],
    text: updatedItem['text'],
    timestamp: updatedItem['timestamp'],
    type: updatedItem['type'],
    mediaUrl: updatedItem['mediaUrl'],
    status: updatedItem['status'],
    createdAt: updatedItem['createdAt'],
    updatedAt: updatedItem['updatedAt'],
    reactions: updatedItem['reactions'] || {},
  };
};
