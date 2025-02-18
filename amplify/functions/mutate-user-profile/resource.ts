import { defineFunction } from '@aws-amplify/backend';

export const mutateUserProfile = defineFunction({
  name: 'mutate-user-profile',
  entry: './handler.ts',
  environment:{
    USER_PROFILE_TABLE_NAME: `UserProfile-${process.env['AMPLIFY_PROJECT_ID']}-${process.env['AMPLIFY_ENV']}-NONE`,
  }
});