import { defineStorage } from '@aws-amplify/backend';

const branch = process.env['AWS_BRANCH'] || 'default';

export const storage = defineStorage({
  isDefault: true,
  name: `userimages-${branch}`,
  access: (allow) => ({
    'protected/*': [allow.authenticated.to(['read'])],
    'protected/${cognito:sub}/*': [allow.authenticated.to(['read','write', 'delete'])]
  })
});