import { defineFunction } from '@aws-amplify/backend';

export const mutateUserProfile = defineFunction({
  name: 'mutate-user-profile',
  entry: './handler.ts',
});