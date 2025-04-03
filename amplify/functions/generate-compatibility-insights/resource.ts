import { defineFunction } from '@aws-amplify/backend';

export const generateCompatibilityInsights = defineFunction({
  name: 'generate-compatibility-insights',
  entry: './handler.ts',
  environment: {
    USER_PROFILE_TABLE_NAME: process.env['AMPLIFY_USER_PROFILE_TABLE_NAME']!,
  }
}); 