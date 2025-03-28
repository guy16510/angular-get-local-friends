import { defineFunction } from '@aws-amplify/backend';

export const notifyUnreadMessage = defineFunction({
  name: 'notifyUnreadMessage',
  entry: './handler.ts',
});