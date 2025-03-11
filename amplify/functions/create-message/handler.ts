import { DynamoDB } from 'aws-sdk';
import type { Schema } from '../../data/resource';
const docClient = new DynamoDB.DocumentClient();

export const handler: Schema["createMessage"]["functionHandler"] = async (event) => {
  // Extract senderId, recipientId, and text from the GraphQL mutation arguments.
  const { senderId, recipientId, text } = event.arguments;

  // Compute the composite conversationId so that both participants share the same id.
  const conversationId = [senderId, recipientId].sort().join('#');
  
  // Capture the current timestamp.
  const timestamp = new Date().toISOString();
  
  // Build the chat message object.
  const chatMessage = {
    conversationId,   // Composite key for the conversation.
    timestamp,        // Message timestamp.
    senderId,
    recipientId,
    text,
  };

  // Get the ChatMessage table name from environment variables.
  const chatTableName = process.env['CHAT_MESSAGE_TABLE_NAME'] || '';
  
  if (!chatTableName || chatTableName.length === 0) {
    console.error("ERROR: CHAT_MESSAGE_TABLE_NAME is not set!");
    throw new Error("Missing environment variable: CHAT_MESSAGE_TABLE_NAME");
  }

  // Write the chat message into DynamoDB.
  await docClient.put({
    TableName: chatTableName,
    Item: chatMessage,
  }).promise();

  // -- Upsert the conversation summary --
  // Get the Conversation table name.
  const conversationTableName = process.env['CONVERSATION_TABLE_NAME'] || '';
  if (!conversationTableName || conversationTableName.length === 0) {
    throw new Error("CONVERSATION_TABLE_NAME environment variable is not set.");
  }

  // Derive participantA and participantB as the lexicographically sorted sender and recipient.
  const [participantA, participantB] = [senderId, recipientId].sort();

  // Use an update (upsert) operation to update the conversation summary.
  await docClient.update({
    TableName: conversationTableName,
    Key: { conversationId },
    UpdateExpression: "set participantA = :pa, participantB = :pb, lastMessage = :lm, lastTimestamp = :lt",
    ExpressionAttributeValues: {
      ":pa": participantA,
      ":pb": participantB,
      ":lm": text,
      ":lt": timestamp
    },
    ReturnValues: "ALL_NEW",
  }).promise();

  // Return the created chat message.
  return JSON.stringify(chatMessage);
};