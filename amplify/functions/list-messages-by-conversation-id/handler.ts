import { DynamoDB } from 'aws-sdk';
const docClient = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env['CHAT_MESSAGE_TABLE_NAME'] || ''; // make sure this matches actual env var name

export const handler = async (event: any) => {
  const { conversationId } = event.arguments;

  if (!conversationId) {
    throw new Error('Missing conversationId');
  }

  const result = await docClient.query({
    TableName: TABLE_NAME,
    IndexName: 'chatMessagesByConversationIdAndTimestamp',
    KeyConditionExpression: 'conversationId = :cid',
    ExpressionAttributeValues: {
      ':cid': conversationId,
    },
    ScanIndexForward: true // or false if you want latest first
  }).promise();

  return result.Items || [];
};