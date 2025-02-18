import { defineFunction } from '@aws-amplify/backend';

export const findNearbyUsers = defineFunction({
  name: 'find-nearby-users',
  entry: './handler.ts',
  environment: {
    'USER_PROFILE_TABLE' : 'UserProfileTable'
  },
});