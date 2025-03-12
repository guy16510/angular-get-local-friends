// amplify/shared/utils/identity.ts
export function getCognitoIdentityId(identity: any): string {
  if (!identity || typeof identity !== 'object') {
    console.error("Missing identity object:", identity);
    throw new Error("Unauthorized: Identity object missing or malformed.");
  }

  if (!identity.identityId) {
    console.error("Identity object missing 'identityId':", identity);
    throw new Error("Unauthorized: Missing Cognito identityId.");
  }

  return identity.identityId;
}