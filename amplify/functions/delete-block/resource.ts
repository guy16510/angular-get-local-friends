import { defineFunction } from '@aws-amplify/backend';

export const deleteBlock = defineFunction({
  name: 'delete-block',
  entry: './handler.ts',
  environment: {
    BLOCK_TABLE_NAME: process.env['AMPLIFY_BLOCK_TABLE_NAME'] || '',
  },
});
