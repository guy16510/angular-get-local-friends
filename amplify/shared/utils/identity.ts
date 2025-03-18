// export function getCognitoIdentityId(identity: any): string {
//   if (!identity || typeof identity !== 'object') {
//     console.error("Missing identity object:", identity);
//     throw new Error("Unauthorized: Identity object missing or malformed.");
//   }

//   // Prefer identityId if available, otherwise fallback to claims.sub or sub
//   if (identity.identityId) {
//     return identity.identityId;
//   } else if (identity.claims && identity.claims.sub) {
//     return identity.claims.sub;
//   } else if (identity.sub) {
//     return identity.sub;
//   }

//   console.error("Identity object missing 'identityId' or 'sub':", identity);
//   throw new Error("Unauthorized: Missing Cognito identityId.");
// }

export function getCognitoIdentityId(identity: any): string {
  if (!identity || typeof identity !== 'object') {
    console.error("[getCognitoIdentityId] Identity object missing or malformed:", identity);
    throw new Error("Unauthorized: Identity object is missing or malformed.");
  }

  // Must return identityId in expected AWS format: us-east-1:xxxxxxxx...
  console.log("IDENTTIY: ", identity);
  const identityId = identity?.identityId;

  if (typeof identityId === 'string' && identityId.includes(':')) {
    return identityId;
  }

  console.error("[getCognitoIdentityId] Invalid or missing identityId:", identityId);
  throw new Error("Unauthorized: Expected a valid Cognito identityId (e.g., us-east-1:xxx).");
}