// For amplify/functions/list-conversations/handler.ts
import { generateClient } from '@aws-amplify/api';
import type { Schema } from '../../data/resource';
import { getIdentityId } from '../../shared/utils/identity';

export const handler = async (event: any) => {
  const requesterId = getIdentityId(event.identity);
  if (!requesterId) {
    throw new Error('Unauthorized: missing requester ID');
  }

  const { limit = 20, nextTokenA, nextTokenB } = event.arguments;

  try {
    // The client needs to be created inside the Lambda's environment
    // In Gen 2, the Lambda gets proper credentials automatically when deployed
    // No need for explicit configuration
    const client = generateClient<Schema>({
      authMode: 'userPool'
    });

    // Query using the filter – your schema's secondary indexes will be used automatically.
    const [resultA, resultB] = await Promise.all([
      client.models.Conversation.list({
        filter: { participantA: { eq: requesterId } },
        limit,
        nextToken: nextTokenA,
      }),
      client.models.Conversation.list({
        filter: { participantB: { eq: requesterId } },
        limit,
        nextToken: nextTokenB,
      }),
    ]);

    if (resultA.errors || resultB.errors) {
      console.error('Errors fetching conversations:', resultA.errors, resultB.errors);
      throw new Error('Error fetching conversations');
    }

    // Merge results from both queries
    const conversationsA = resultA.data ?? [];
    const conversationsB = resultB.data ?? [];
    const combinedConversations = [...conversationsA, ...conversationsB];

    // Re-sort by lastTimestamp
    combinedConversations.sort(
      (a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime()
    );

    return combinedConversations.slice(0, limit);
  } catch (error) {
    console.error('Unexpected error fetching conversations:', error);
    throw error;
  }
};