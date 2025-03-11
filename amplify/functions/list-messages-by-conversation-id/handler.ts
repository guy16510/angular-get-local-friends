import { DynamoDB } from 'aws-sdk';
import type { Schema } from '../../data/resource';

const docClient = new DynamoDB.DocumentClient();

export const handler: Schema['customListMessagesByConversationId']['functionHandler'] = async (event) => {
  const { conversationId } = event.arguments;

  const chatTableName = process.env['CHAT_MESSAGE_TABLE_NAME'] || '';
  if (!chatTableName) throw new Error('CHAT_MESSAGE_TABLE_NAME not set');

  const params = {
    TableName: chatTableName,
    KeyConditionExpression: 'conversationId = :cid',
    ExpressionAttributeValues: { ':cid': conversationId },
    ScanIndexForward: true // oldest to newest
  };

  const result = await docClient.query(params).promise();
  return JSON.stringify(result.Items);
};