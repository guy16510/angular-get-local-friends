import { defineFunction } from '@aws-amplify/backend';

export const reactToMessage = defineFunction({
  name: 'react-to-message',
  entry: './handler.ts',
  environment: {
    CHAT_MESSAGE_TABLE_NAME: process.env['AMPLIFY_CHAT_MESSAGE_TABLE_NAME']!,
  },
});