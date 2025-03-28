import type { Schema } from '../../data/resource';
import { AppSyncResolverEvent } from 'aws-lambda';
import { getIdentityId } from '../../shared/utils/identity';

export const handler: Schema['notifyUnreadMessage']['functionHandler'] = async (
  event: AppSyncResolverEvent<{ conversationId: string }>
) => {
  const identityId = getIdentityId(event.identity);
  const { conversationId } = event.arguments;

  const message = event.source as Schema['ChatMessage']['type'];
  if (!message || !identityId) return null as any;

  if (
    message.conversationId !== conversationId ||
    message.recipientId !== identityId
  ) {
    return null as any;
  }

  return message;
};
