import { DynamoDB } from 'aws-sdk';
import type { Schema } from '../../data/resource';
import { getIdentityId } from '../../shared/utils/identity';
import { toChatMessage } from '../../shared/mappers/chatMessageMapper';

const docClient = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env['CHAT_MESSAGE_TABLE_NAME'] || '';

export const handler: Schema["listUnreadMessages"]["functionHandler"] = async (event) => {
  const identityId = getIdentityId(event.identity);
  if (!identityId) {
    throw new Error("Unauthorized: No identity provided.");
  }
  
  // Ensure the caller's argument matches their authenticated identity.
  if (event.arguments.recipientId !== identityId) {
    throw new Error("Unauthorized: recipientId mismatch.");
  }
  
  const params = {
    TableName: TABLE_NAME,
    IndexName: 'chatMessagesByRecipientIdAndStatus',
    KeyConditionExpression: 'recipientId = :uid and #status = :sent',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':uid': identityId,
      ':sent': 'sent'
    }
  };

  try {
    const result = await docClient.query(params).promise();
    const items = result.Items || [];
    return items.map(item => toChatMessage(item));
  } catch (error) {
    console.error('Error fetching unread messages:', error);
    throw error;
  }
};