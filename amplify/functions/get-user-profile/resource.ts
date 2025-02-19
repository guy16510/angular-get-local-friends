import { defineFunction } from '@aws-amplify/backend';

export const getUserProfile = defineFunction({
  name: 'get-user-profile',
  entry: './handler.ts',
  environment: {
    USER_PROFILE_TABLE_NAME: process.env['AMPLIFY_USER_PROFILE_TABLE_NAME'] || '',
  }
});