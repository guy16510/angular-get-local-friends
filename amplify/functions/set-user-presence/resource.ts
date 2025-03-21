import { defineFunction } from '@aws-amplify/backend';

export const setUserPresence = defineFunction({
  name: 'setUserPresence',
  entry: './handler.ts'
});