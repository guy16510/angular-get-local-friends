import { defineStorage } from '@aws-amplify/backend';

const branch = process.env['AWS_BRANCH'] || 'default';

export const storage = defineStorage({
  isDefault: true,
  name: `userimages-${branch}`,
  access: (allow) => ({
    // All authenticated users can read any file under "protected"
    'protected/*': [allow.authenticated.to(['read'])],
    // Authenticated users have full control over their own folders
    'protected/${cognito:sub}/*': [allow.authenticated.to(['read', 'write', 'delete'])],
    'protected/${cognito-identity.amazonaws.com:sub}/*': [allow.authenticated.to(['read', 'write', 'delete'])],
    'protected/${cognito:username}/*': [allow.authenticated.to(['read', 'write', 'delete'])]
  })
});