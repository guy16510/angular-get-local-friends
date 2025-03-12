export function getCognitoIdentityId(identity: any): string {
    if (identity && typeof identity === 'object' && 'identityId' in identity) {
      return identity.identityId;
    }
    throw new Error("Unauthorized: Missing or invalid Cognito identity");
  }