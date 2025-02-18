import { defineFunction } from '@aws-amplify/backend';

export const mutateUserProfile = defineFunction({
  name: 'mutate-user-profile',
  entry: './handler.ts',
  environment: {
    USER_PROFILE_TABLE_NAME: process.env['USER_PROFILE_TABLE_NAME'] || 'UserProfileTable',
  },
});