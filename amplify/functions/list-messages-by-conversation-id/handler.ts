import { DynamoDB } from 'aws-sdk';
import { getIdentityId } from '../../shared/utils/identity'; // Import the function

const docClient = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env['CHAT_MESSAGE_TABLE_NAME'] || ''; // Ensure this matches actual env var name

export const handler = async (event: any) => {
  const { conversationId, senderId } = event.arguments;

  // Get the identityId from the event context (requester’s identity)
  const requesterId = getIdentityId(event.identity);

  // Normalize the conversationId, including the requesterId as part of it
  const normalizedConversationId = senderId && requesterId
    ? [senderId, requesterId].sort().join('#')
    : conversationId;

  // If the requester is part of the conversation, their identityId should be part of the normalized ID
  if (!normalizedConversationId.includes(requesterId)) {
    throw new Error('Unauthorized: You are not a participant in this conversation');
  }

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