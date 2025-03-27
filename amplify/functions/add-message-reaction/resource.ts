import { defineFunction } from '@aws-amplify/backend';

export const addMessageReaction = defineFunction({
  name: 'add-message-reaction',
  entry: './handler.ts',
  environment: {
    MESSAGE_REACTION_TABLE_NAME: process.env['AMPLIFY_MESSAGE_REACTION_TABLE_NAME']!
  },
});