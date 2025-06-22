import { defineFunction } from '@aws-amplify/backend';

export const blockUser = defineFunction({
  name: 'block-user',
  entry: './handler.ts',
  environment: {
    USER_BLOCK_TABLE_NAME: process.env['AMPLIFY_USER_BLOCK_TABLE_NAME']!
  }
});
