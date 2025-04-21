import { defineFunction } from '@aws-amplify/backend';

export const createBlock = defineFunction({
  name: 'create-block',
  entry: './handler.ts',
  environment: {
    BLOCK_TABLE_NAME: process.env['AMPLIFY_BLOCK_TABLE_NAME'] || '',
  },
});
