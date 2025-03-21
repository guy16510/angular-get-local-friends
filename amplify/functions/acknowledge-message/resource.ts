import { defineFunction } from '@aws-amplify/backend';

export const acknowledgeMessage = defineFunction({
  name: 'acknowledgeMessage',
  entry: './handler.ts'
});