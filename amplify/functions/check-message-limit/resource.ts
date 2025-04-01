import { defineFunction } from '@aws-amplify/backend';

export const checkMessageLimit = defineFunction({
  name: 'checkMessageLimit',
  entry: './handler.ts',
  environment: {
    USER_PROFILE_TABLE: process.env['AMPLIFY_USER_PROFILE_TABLE_NAME'] as string,
    CHAT_MESSAGE_TABLE: process.env['AMPLIFY_CHAT_MESSAGE_TABLE_NAME'] as string,
  }
}); 