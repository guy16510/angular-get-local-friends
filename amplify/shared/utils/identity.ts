export function getCognitoIdentityId(identity: any): string {
  if (!identity || typeof identity !== 'object') {
    console.error("[getCognitoIdentityId] Identity object missing or malformed:", identity);
    throw new Error("Unauthorized: Identity object is missing or malformed.");
  }

  // Prefer identityId when using identityPool (best practice for IAM-based systems)
  const identityId = identity?.identityId;
  if (typeof identityId === 'string' && identityId.includes(':')) {
    console.log(`[getCognitoIdentityId] Using identityId: ${identityId}`);
    return identityId;
  }

  // Fallback warning: system is in userPool mode
  const sub = identity?.sub || identity?.claims?.sub;
  if (typeof sub === 'string') {
    console.warn("[getCognitoIdentityId] WARNING: Falling back to sub — identityId not available. Using sub instead:", sub);
    return sub;
  }

  console.error("[getCognitoIdentityId] Neither identityId nor sub is available. Identity object:", identity);
  throw new Error("Unauthorized: Missing Cognito identityId or sub.");
}