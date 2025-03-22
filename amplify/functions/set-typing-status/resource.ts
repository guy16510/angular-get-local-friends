import { defineFunction } from '@aws-amplify/backend';

export const setTypingStatus = defineFunction({
  name: 'setTypingStatus',
  entry: './handler.ts',
  environment: {
    CHAT_MESSAGE_TABLE_NAME: process.env['AMPLIFY_TYPING_STATUS_TABLE_NAME'] || '',
  },
});