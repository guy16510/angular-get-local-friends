import { defineFunction } from '@aws-amplify/backend';

export const enrollPremium = defineFunction({
  name: 'enrollPremium',
  entry: './handler.ts',
  environment: {
    USER_PROFILE_TABLE: process.env['AMPLIFY_USER_PROFILE_TABLE_NAME'] as string,
    USER_POOL_ID: process.env['AMPLIFY_USER_POOL_ID'] as string,
    PREMIUM_GROUP_NAME: `PREMIUM-${process.env['AWS_BRANCH']}`
  }
}); 