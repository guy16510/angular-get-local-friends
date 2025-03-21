import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../data/resource';
import { getIdentityId } from '../../shared/utils/identity';

const client = generateClient<Schema>();

export const handler = async (event: any) => {
  const requesterId = getIdentityId(event.identity);

  if (!requesterId) {
    throw new Error('Unauthorized: missing requester ID');
  }

  const { limit = 20, nextTokenA, nextTokenB } = event.arguments;

  try {
    const [
      { data: conversationsA, nextToken: newNextTokenA, errors: errorsA },
      { data: conversationsB, nextToken: newNextTokenB, errors: errorsB },
    ] = await Promise.all([
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

    if (errorsA?.length || errorsB?.length) {
      console.error('Errors fetching conversations:', { errorsA, errorsB });
      throw new Error('Error fetching conversations');
    }

    // Merge results from both queries
    const combinedConversations = [...(conversationsA ?? []), ...(conversationsB ?? [])];

    // Manually sort by lastTimestamp descending (newest first)
    combinedConversations.sort(
      (a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime()
    );

    return {
      conversations: combinedConversations.slice(0, limit),
      nextTokenA: newNextTokenA,
      nextTokenB: newNextTokenB,
    };
  } catch (error) {
    console.error('Unexpected error fetching conversations:', error);
    throw error;
  }
};