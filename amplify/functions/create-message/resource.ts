import { defineFunction } from '@aws-amplify/backend';

export const createMessage = defineFunction({
  name: 'create-message',
  entry: './handler.ts',
});