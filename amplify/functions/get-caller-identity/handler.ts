import { getIdentityId } from '../../shared/utils/identity';

export const handler = async (event: any): Promise<any> => {
  console.info("Identity lambda invoked with event:", JSON.stringify(event, null, 2));

  let payload = event;

  try {
    // If the event comes as a JSON string, parse it.
    if (typeof event === "string") {
      try {
        payload = JSON.parse(event);
      } catch (parseError) {
        console.error("Failed to parse event as JSON:", event);
        throw new Error("Invalid event format: unable to parse JSON.");
      }
    }

    // Optionally, process identity information for logging.
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

    // Unwrap the subscription payload if it's nested (common pattern is { data: { onCreateMessage: {...} } }).
    let message = payload;
    if (payload.data && payload.data.onCreateMessage) {
      message = payload.data.onCreateMessage;
    }

    // Validate that the returned message contains all required non-nullable fields.
    const requiredFields = ['id', 'conversationId', 'senderId', 'recipientId', 'timestamp'];
    for (const field of requiredFields) {
      if (!message[field]) {
        console.error(`Missing required field '${field}' in message:`, message);
        throw new Error(`Missing required field '${field}' in message payload.`);
      }
    }

    // Return the fully unwrapped and validated message.
    return message;
  } catch (error) {
    console.error("Error in identity lambda:", error);
    throw error;
  }
};