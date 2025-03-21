/**
 * Ensures conversationId is deterministic and consistent across sender/recipient.
 */
export function getNormalizedConversationId(userIdA: string, userIdB: string): string {
  return [userIdA, userIdB].sort().join('#');
}

/**
 * Deduplicates messages array based on unique `id`.
 */
export function deduplicateMessages(messages: any[]): any[] {
  const map = new Map<string, any>();
  messages.forEach(msg => map.set(msg.id, msg));
  return Array.from(map.values());
}

/**
 * Appends paginated messages to existing message array, ensuring no duplicates.
 */
export function appendPaginatedMessages(
  existing: any[],
  incoming: any[]
): any[] {
  const combined = [...existing, ...incoming];
  return deduplicateMessages(combined);
}
