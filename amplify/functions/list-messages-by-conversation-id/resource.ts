import { defineFunction } from '@aws-amplify/backend';

export const listMessagesByConversationId = defineFunction({
  name: 'list-messages-by-conversation-id',
  entry: './handler.ts',
});