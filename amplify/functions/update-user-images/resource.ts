import { defineFunction } from '@aws-amplify/backend';

export const updateUserImages = defineFunction({
  name: 'update-user-images',
  entry: './handler.ts',
  environment: {
    USER_PROFILE_TABLE_NAME: process.env['AMPLIFY_USER_PROFILE_TABLE_NAME'] || '',
  }
});