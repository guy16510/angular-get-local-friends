import { defineFunction } from '@aws-amplify/backend';

export const listConversations = defineFunction({
  name: 'list-conversations',
  entry: './handler.ts',
  environment: {
    CONVERSATION_TABLE_NAME: process.env['AMPLIFY_CONVERSATION_TABLE_NAME'] || '',
  },
});