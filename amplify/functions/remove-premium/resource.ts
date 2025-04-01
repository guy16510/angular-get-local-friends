import { defineFunction } from '@aws-amplify/backend';

export const removePremium = defineFunction({
  name: 'remove-premium',
  entry: './handler.ts',
  environment: {
    USER_POOL_ID: process.env['AMPLIFY_USER_POOL_ID'] as string,
  }
}); 