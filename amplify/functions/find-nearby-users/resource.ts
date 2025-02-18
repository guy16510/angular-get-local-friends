import { defineFunction } from '@aws-amplify/backend';

export const findNearbyUsers = defineFunction({
  name: 'find-nearby-users',
  entry: './handler.ts',
  environment:{
    USER_PROFILE_TABLE_NAME: `UserProfile-${process.env['AMPLIFY_PROJECT_ID']}-${process.env['AMPLIFY_ENV']}-NONE`,
  }
});