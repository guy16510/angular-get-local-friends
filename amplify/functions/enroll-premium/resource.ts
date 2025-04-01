import { defineFunction } from '@aws-amplify/backend';

export const enrollPremium = defineFunction({
  name: 'enrollPremium',
  entry: './handler.ts',
  environment: {
    USER_PROFILE_TABLE: process.env['AMPLIFY_USER_PROFILE_TABLE_NAME'] as string,
  }
}); 