import { defineFunction } from '@aws-amplify/backend';

export const findPremiumMatches = defineFunction({
  name: 'find-premium-matches',
  entry: './handler.ts',
  environment: {
    USER_PROFILE_TABLE_NAME: process.env['AMPLIFY_USER_PROFILE_TABLE_NAME'] || '',
    BLOCK_TABLE_NAME: process.env['AMPLIFY_BLOCK_TABLE_NAME']!,
  }
});