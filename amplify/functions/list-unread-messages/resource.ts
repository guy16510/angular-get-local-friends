import { defineFunction } from '@aws-amplify/backend';

export const listUnreadMessages = defineFunction({
  name: 'list-unread-messages',
  entry: './handler.ts',
  environment: {
    CHAT_MESSAGE_TABLE_NAME: process.env['AMPLIFY_CHAT_MESSAGE_TABLE_NAME']!,
    BLOCK_TABLE_NAME: process.env['AMPLIFY_BLOCK_TABLE_NAME']!,
  },
});