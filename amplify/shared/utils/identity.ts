export function getIdentityId(identity: any): string {
  if (!identity || typeof identity !== 'object') {
    console.error("[getIdentityId] Identity object missing or malformed:", identity);
    throw new Error("Unauthorized: Identity object is missing or malformed.");
  }

  // Use the unique identifier from the Cognito User Pool
  const uniqueId = identity.sub || identity?.claims?.sub;
  if (typeof uniqueId === 'string') {
    console.log(`[getIdentityId] Using Cognito User Pool unique identifier (sub): ${uniqueId}`);
    return uniqueId;
  }

  console.error("[getIdentityId] Unique identifier (sub) not found in identity object:", identity);
  throw new Error("Unauthorized: Missing Cognito unique identifier.");
}