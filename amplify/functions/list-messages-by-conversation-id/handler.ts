import { DynamoDB } from 'aws-sdk';
const docClient = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env['CHAT_MESSAGE_TABLE_NAME'] || ''; // make sure this matches actual env var name

export const handler = async (event: any) => {
  const { conversationId, senderId, recipientId } = event.arguments;

  const normalizedConversationId = senderId && recipientId
    ? [senderId, recipientId].sort().join('#')
    : conversationId;

  const result = await docClient.query({
    TableName: TABLE_NAME,
    IndexName: 'chatMessagesByConversationIdAndTimestamp',
    KeyConditionExpression: 'conversationId = :cid',
    ExpressionAttributeValues: {
      ':cid': normalizedConversationId,
    },
    ScanIndexForward: true
  }).promise();

  return result.Items || [];
};