import { defineStorage } from '@aws-amplify/backend';

const branch = process.env['AWS_BRANCH'] || 'default';

export const storage = defineStorage({
  isDefault: true,
  name: `userimages-${branch}`,
  access: (allow) => ({
    // All authenticated users can read any file under "protected"
    'protected/*': [allow.authenticated.to(['read'])],
    // Only allow write/delete on files stored under a folder that matches the user's Cognito sub.
    // This requires that files are stored using keys like: protected/<cognito:sub>/profile.webp
    'protected/${cognito:sub}/*': [allow.authenticated.to(['write', 'delete'])]
  })
});