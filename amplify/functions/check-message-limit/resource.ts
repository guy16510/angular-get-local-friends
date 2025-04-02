import { defineFunction } from '@aws-amplify/backend';

export const checkMessageLimit = defineFunction({
  name: 'checkMessageLimit',
  entry: './handler.ts',
  environment: {
    CHAT_MESSAGE_TABLE: process.env['AMPLIFY_CHAT_MESSAGE_TABLE_NAME'] as string,
    USER_POOL_ID: process.env['AMPLIFY_USER_POOL_ID'] as string,
  }
}); 