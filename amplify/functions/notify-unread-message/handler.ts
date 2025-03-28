import type { Schema } from '../../data/resource';
import { AppSyncResolverEvent } from 'aws-lambda';
import { getIdentityId } from '../../shared/utils/identity';

export const handler: Schema['notifyUnreadMessage']['functionHandler'] = async (
  event: AppSyncResolverEvent<{ identityId: string }>
) => {
  console.log('[notifyUnreadMessage] Handler invoked. Event:', JSON.stringify(event));

  const subscriberIdentityId = getIdentityId(event.identity);
  const { identityId } = event.arguments; // this should be the same as subscriberIdentityId
  console.log('[notifyUnreadMessage] Subscriber identity from token:', subscriberIdentityId, ' | Passed identity argument:', identityId);

  const message = event.source as Schema['ChatMessage']['type'];
  console.log('[notifyUnreadMessage] Message received from event.source:', JSON.stringify(message));

  if (!message || !subscriberIdentityId) {
    console.error('[notifyUnreadMessage] Missing message or subscriber identity', { message, subscriberIdentityId });
    return null as any;
  }

  // Ensure the message is for the subscriber.
  if (message.recipientId !== subscriberIdentityId) {
    console.warn('[notifyUnreadMessage] Message recipient does not match subscriber identity', { messageRecipient: message.recipientId, subscriberIdentityId });
    return null as any;
  }

  console.log('[notifyUnreadMessage] Returning message for subscriber:', subscriberIdentityId, 'Message:', JSON.stringify(message));
  return message;
};