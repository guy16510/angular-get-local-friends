import { DynamoDB } from 'aws-sdk';
import type { Schema } from '../../data/resource';
const docClient = new DynamoDB.DocumentClient();

export const handler: Schema["customListConversations"]["functionHandler"] = async (event) => {
  // Expect a userId argument to filter conversations.
  const { userId } = event.arguments;
  
  // Retrieve the Conversation table name from environment variables.
  const conversationTableName = process.env['CONVERSATION_TABLE_NAME'] || '';
  if (!conversationTableName || conversationTableName.length === 0) {
    throw new Error("CONVERSATION_TABLE_NAME environment variable is not set.");
  }
  
  // Query the Conversation table for any conversation where the user is a participant.
  // Since our model does not use a key on userId, we use a Scan with a filter.
  const params = {
    TableName: conversationTableName,
    FilterExpression: "participantA = :uid OR participantB = :uid",
    ExpressionAttributeValues: {
      ":uid": userId,
    },
  };
  
  const result = await docClient.scan(params).promise();
  return JSON.stringify(result.Items);
};