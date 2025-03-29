import { getIdentityId } from '../../shared/utils/identity';

export const handler = async (event: any): Promise<any> => {
  // console.info("Identity lambda invoked with event:", JSON.stringify(event, null, 2));

  let parsedEvent = event;

  try {
    // If the event is a string, attempt to parse it as JSON.
    if (typeof event === "string") {
      try {
        parsedEvent = JSON.parse(event);
      } catch (parseError) {
        console.error("Failed to parse event as JSON:", event);
        throw new Error("Invalid event format: unable to parse JSON.");
      }
    }

    // Ensure the event is a valid object.
    if (!parsedEvent || typeof parsedEvent !== "object") {
      console.error("No valid event payload received.", { event });
      throw new Error("No valid event payload received.");
    }

    // Attempt to extract and log the identity ID.
    if (parsedEvent.identity && typeof parsedEvent.identity === "object") {
      try {
        const identityId = getIdentityId(parsedEvent.identity);
        console.info("Extracted identity ID:", identityId);
      } catch (idError) {
        console.warn("Failed to extract identity ID:", idError);
      }
    } else {
      console.warn("No identity provided in event or identity is not an object.");
    }

    // Return the processed event.
    return parsedEvent;
  } catch (error) {
    console.error("Error in identity lambda:", error);
    throw error;
  }
};