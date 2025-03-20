import { defineStorage } from '@aws-amplify/backend';

const branch = process.env['AWS_BRANCH'] || 'default';

export const storage = defineStorage({
  isDefault: true,
  name: `userimages-${branch}`,
  access: (allow) => ({
    // All authenticated users can read any file under "protected"
    'protected/*': [allow.authenticated.to(['read'])],
    
    // Standard Cognito sub-based path
    'protected/${cognito:sub}/*': [allow.authenticated.to(['read', 'write', 'delete'])],
    
    // Also allow sub-based access (which might be different from cognito:sub in some cases)
    'protected/${cognito-identity.amazonaws.com:sub}/*': [allow.authenticated.to(['read', 'write', 'delete'])],
    
    // User pool-based access
    'protected/${cognito:username}/*': [allow.authenticated.to(['read', 'write', 'delete'])]
  })
});