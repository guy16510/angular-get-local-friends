import { defineFunction } from '@aws-amplify/backend';

export const listConversations = defineFunction({
  name: 'list-conversations',
  entry: './handler.ts'
});