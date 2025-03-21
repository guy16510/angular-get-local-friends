import { defineFunction } from '@aws-amplify/backend';

export const markMessageAsRead = defineFunction({
  name: 'markMessageAsRead',
  entry: './handler.ts'
});