import { defineStorage } from '@aws-amplify/backend';

// Use the AWS_BRANCH environment variable to suffix your bucket name.
// If AWS_BRANCH is not set, default to 'default'.
const branch = process.env['AWS_BRANCH'] || 'default';

export const storage = defineStorage({
  // Mark this bucket as default if it's your primary storage resource.
  isDefault: true,
  // Append the AWS branch to the bucket name.
  name: `userimages-${branch}`,
  // Define custom file path access rules.
  access: (allow) => ({
    'protected/{entity_id}/*': [
      // Only the user whose identity matches {entity_id} may write/delete.
      allow.entity('identity').to(['read', 'write', 'delete']),
      // Other authenticated users can only read.
      allow.authenticated.to(['read'])
    ]
  })
});