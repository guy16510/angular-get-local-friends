import { defineFunction } from '@aws-amplify/backend';

export const getCallerIdentity = defineFunction({
  name: 'get-caller-identity',
  entry: './handler.ts',
});