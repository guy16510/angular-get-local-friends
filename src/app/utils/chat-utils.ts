export function getNormalizedConversationId(a: string, b: string): string {
    return [a, b].sort().join('#');
  }