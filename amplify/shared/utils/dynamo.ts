// ===== amplify/shared/utils/dynamo.ts =====
export function unwrapString(attr?: { S?: string }): string {
    if (!attr?.S) throw new Error('Expected DynamoDB string attribute');
    return attr.S;
  }