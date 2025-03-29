import type { Schema } from '../../data/resource';
import { getIdentityId } from '../../shared/utils/identity';

export const handler = async (event: any) => {
  console.info("Identity lambda invoked with event:", JSON.stringify(event, null, 2));
  
  let payload = event;
  
  try {
    // If the event is a JSON string, parse it.
    if (typeof payload === "string") {
      payload = JSON.parse(payload);
    }
    
    // Optionally extract and log the identity.
    if (payload.identity && typeof payload.identity === "object") {
      try {
        const identityId = getIdentityId(payload.identity);
        console.info("Extracted identity ID:", identityId);
      } catch (idError) {
        console.warn("Failed to extract identity ID:", idError);
      }
    } else {
      console.warn("No identity provided in payload or identity is not an object.");
    }
    
    // Unwrap the message payload if it exists.
    let message: any;
    if (payload.data && payload.data.onCreateMessage) {
      message = payload.data.onCreateMessage;
      console.info("Using payload.data.onCreateMessage as message:", JSON.stringify(message));
    } else if (payload.prev && payload.prev.result && payload.prev.result.id) {
      message = payload.prev.result;
      console.info("Using payload.prev.result as message:", JSON.stringify(message));
    } else {
      // If no valid message found, return a dummy ChatMessage to satisfy non-nullable fields.
      console.warn("No valid message found in payload. Returning dummy message.");
      message = {
        id: "init",
        conversationId: "init",
        senderId: "init",
        recipientId: "init",
        timestamp: new Date().toISOString(),
        text: ""
      };
    }
    
    // Validate that the message contains all required fields.
    const requiredFields = ['id', 'conversationId', 'senderId', 'recipientId', 'timestamp'];
    for (const field of requiredFields) {
      if (message[field] == null) {
        console.error(`Missing required field '${field}' in message:`, JSON.stringify(message, null, 2));
        throw new Error(`Missing required field '${field}' in message payload.`);
      }
    }
    
    return message;
    
  } catch (error) {
    console.error("Error in identity lambda:", error);
    throw error;
  }
};