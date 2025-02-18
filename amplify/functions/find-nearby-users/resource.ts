import { defineFunction } from '@aws-amplify/backend';

export const findNearbyUsers = defineFunction({
  name: 'find-nearby-users',
  entry: './handler.ts',
});