import { defineFunction } from '@aws-amplify/backend';

export const createReport = defineFunction({
  name: 'create-report',
  entry: './handler.ts',
  environment: {
    ADMIN_EMAIL: process.env['ADMIN_EMAIL'] || 'getlocalfriends@gmail.com',
  }
}); 