import { defineFunction } from '@aws-amplify/backend';

export const setTypingStatus = defineFunction({
  name: 'setTypingStatus',
  entry: './handler.ts'
});