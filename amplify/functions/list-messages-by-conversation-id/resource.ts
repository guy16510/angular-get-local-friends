import { defineFunction } from '@aws-amplify/backend';

export const listMessagesByConversationId = defineFunction({
  name: 'list-messages-by-conversation-id',
  entry: './handler.ts',
  environment: {
    CHAT_MESSAGE_TABLE_NAME: process.env['AMPLIFY_CHAT_MESSAGE_TABLE_NAME'] || '',
    CONVERSATION_TABLE_NAME: process.env['AMPLIFY_CONVERSATION_TABLE_NAME'] || '',
  },
});