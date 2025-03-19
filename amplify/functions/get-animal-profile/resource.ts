import { defineFunction } from '@aws-amplify/backend';

export const getAnimalProfile = defineFunction({
  name: 'get-animal-profile',
  entry: './handler.ts',
  environment: {
    USER_PROFILE_TABLE_NAME: process.env['AMPLIFY_USER_PROFILE_TABLE_NAME'] || '',
  },
});
