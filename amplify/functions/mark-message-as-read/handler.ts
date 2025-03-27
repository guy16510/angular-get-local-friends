// // mark-messages-as-read/handler.ts
// import type { Schema } from '../../data/resource';
// import { getIdentityId } from '../../shared/utils/identity';
// import { DynamoDB } from '@aws-sdk/client-dynamodb';
// import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
// import { sanitizeBigInts } from '../../shared/utils/sanitize';

// const CHAT_MESSAGE_TABLE = process.env['AMPLIFY_CHAT_MESSAGE_TABLE_NAME']!;
// if (!CHAT_MESSAGE_TABLE) throw new Error("Missing environment variable: AMPLIFY_CHAT_MESSAGE_TABLE_NAME");

// const CONVERSATION_TABLE = process.env['AMPLIFY_CONVERSATION_TABLE_NAME']!;
// if (!CONVERSATION_TABLE) throw new Error("Missing environment variable: AMPLIFY_CONVERSATION_TABLE_NAME");

// const ddbClient = new DynamoDB({});
// const docClient = DynamoDBDocument.from(ddbClient);

// export const handler = async (event: any) => {
//   const { conversationId, messageId, userId: passedUserId } = event.arguments;
//   // Use the passed userId or fallback to the identity from the event.
//   const userId = passedUserId || getIdentityId(event.identity);
  
//   if (!conversationId || !messageId || !userId) {
//     console.error("Missing parameters", { conversationId, messageId, userId });
//     throw new Error("Missing parameters");
//   }

//   try {
//     // Retrieve the message
//     const messageResult = await docClient.get({
//       TableName: CHAT_MESSAGE_TABLE,
//       Key: { id: messageId }
//     });
//     const message = messageResult.Item;
//     if (!message) {
//       console.error("Message not found", { messageId });
//       throw new Error("Message not found");
//     }

//     // Update the message status to "seen"
//     await docClient.update({
//       TableName: CHAT_MESSAGE_TABLE,
//       Key: { id: messageId },
//       UpdateExpression: "SET #s = :s",
//       ExpressionAttributeNames: { "#s": "status" },
//       ExpressionAttributeValues: { ":s": "seen" },
//       ReturnValues: "ALL_NEW"
//     });

//     // Retrieve the conversation
//     const conversationResult = await docClient.get({
//       TableName: CONVERSATION_TABLE,
//       Key: { id: conversationId }
//     });
//     const conversation = conversationResult.Item;
//     if (!conversation) {
//       console.error("Conversation not found", { conversationId });
//       throw new Error("Conversation not found");
//     }

//     // Update the conversation with the last seen message for the user.
//     // We'll dynamically update the attribute named "lastSeenBy_{userId}"
//     const attributeName = `lastSeenBy_${userId}`;
//     await docClient.update({
//       TableName: CONVERSATION_TABLE,
//       Key: { id: conversationId },
//       UpdateExpression: `SET #attr = :val`,
//       ExpressionAttributeNames: { "#attr": attributeName },
//       ExpressionAttributeValues: { ":val": messageId },
//       ReturnValues: "ALL_NEW"
//     });

//     return { conversationId, userId, messageId };
//   } catch (err) {
//     console.error(`[markMessageAsRead] Error:`, err);
//     throw new Error("Internal server error");
//   }
// };

import { getIdentityId } from '../../shared/utils/identity';

export const handler = async (event: any, context: any) => {
  const { conversationId } = event.arguments;
  const userId = getIdentityId(event.identity);

  if (!conversationId) throw new Error("Missing conversationId");
  if (!userId) throw new Error("Unauthorized");

  // Fetch all messages sent TO this user in this conversation that are delivered (but not read)
  const messages = await context.db.ChatMessage.query({
    conversationId,
    recipientId: userId,
    status: { eq: "delivered" }
  });

  if (!messages?.items?.length) return { updatedCount: 0 };

  // Mark all as read
  const updates = messages.items.map((msg: any) =>
    context.db.ChatMessage.update({
      id: msg.id,
      status: "read"
    })
  );

  await Promise.all(updates);

  return {
    updatedCount: messages.items.length
  };
};
