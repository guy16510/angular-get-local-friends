import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { getIdentityId } from '../../shared/utils/identity';
import { toChatMessage } from '../../shared/mappers/chatMessageMapper';

const CHAT_MESSAGE_TABLE_NAME = process.env['CHAT_MESSAGE_TABLE_NAME'];
const CONVERSATION_TABLE_NAME = process.env['CONVERSATION_TABLE_NAME'];

if (!CHAT_MESSAGE_TABLE_NAME) throw new Error("Missing environment variable: CHAT_MESSAGE_TABLE_NAME");
if (!CONVERSATION_TABLE_NAME) throw new Error("Missing environment variable: CONVERSATION_TABLE_NAME");

const ddbClient = new DynamoDB({});
const docClient = DynamoDBDocument.from(ddbClient);

export const handler = async (event: any) => {
  const { recipientId, text } = event.arguments;
  const senderId = getIdentityId(event.identity);
  if (!senderId) throw new Error("Unauthorized: Missing identity");
  if (!recipientId || !text) throw new Error("Missing recipientId or text");

  // Sort sender and recipient lexicographically to build a consistent conversationId.
  const [participantA, participantB] = [senderId, recipientId].sort();
  const conversationId = `${participantA}#${participantB}`;
  const timestamp = new Date().toISOString();
  const messageId = `${conversationId}-${timestamp}`;

  const chatMessage = {
    id: messageId,
    conversationId,
    senderId,
    recipientId,
    text,
    timestamp,
    type: 'text',
    status: 'sent',
    createdAt: timestamp,
    updatedAt: timestamp
  };

  try {
    // Insert the new chat message.
    await docClient.put({
      TableName: CHAT_MESSAGE_TABLE_NAME,
      Item: chatMessage
    });

    // Check for an existing conversation.
    const convResult = await docClient.get({
      TableName: CONVERSATION_TABLE_NAME,
      Key: { id: conversationId }
    });
    const existing = convResult.Item;

    const conversationItem = {
      id: conversationId,
      participantA,
      participantB,
      lastMessage: text,
      lastTimestamp: timestamp,
      createdAt: existing ? existing['createdAt'] : timestamp,
      updatedAt: timestamp
    };

    // Upsert the conversation summary.
    await docClient.put({
      TableName: CONVERSATION_TABLE_NAME,
      Item: conversationItem
    });

    return toChatMessage(chatMessage);
  } catch (err) {
    console.error('[createMessage] Error:', err);
    throw new Error("Internal server error");
  }
};