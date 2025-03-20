import { defineStorage } from '@aws-amplify/backend';

// Use the AWS_BRANCH environment variable to suffix your bucket name.
// If AWS_BRANCH is not set, default to 'default'.
const branch = process.env['AWS_BRANCH'] || 'default';

export const storage = defineStorage({
  isDefault: true,
  name: `userimages-${branch}`,
  access: (access) => ({
    // Any authenticated user can read any file under "protected"
    'protected/*': [access.authenticated.to(['read'])],
    // Only allow write/delete actions on files in the folder named after the user's Cognito sub.
    // When a user uploads a file, it must be stored under:
    //    protected/<cognito sub>/filename.ext
    'protected/${cognito:sub}/*': [access.authenticated.to(['write', 'delete'])]
  })
});