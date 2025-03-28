import type { Schema } from '../../data/resource';
import { AppSyncResolverEvent } from 'aws-lambda';
import { getIdentityId } from '../../shared/utils/identity';

export const handler: Schema['notifyUnreadMessage']['functionHandler'] = async (
  event: AppSyncResolverEvent<{ identityId: string }>
) => {
  // The subscriber's identity (from the token)
  const subscriberIdentityId = getIdentityId(event.identity);
  const { identityId } = event.arguments; // this should be the same as subscriberIdentityId
  const message = event.source as Schema['ChatMessage']['type'];
  if (!message || !subscriberIdentityId) return null as any;

  // Ensure the message is for the subscriber.
  if (message.recipientId !== subscriberIdentityId) {
    return null as any;
  }

  return message;
};