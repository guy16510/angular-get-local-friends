import { defineStorage } from '@aws-amplify/backend';
import { mutateUserProfile } from '../functions/mutate-user-profile/resource';
import { findNearbyUsers } from '../functions/find-nearby-users/resource';

export const storage = defineStorage({
  name: 'UserProfileTable',
  access: (allow) => ({
    'UserProfileTable/*': [
      allow.resource(mutateUserProfile).to(['read', 'write', 'delete']),
      allow.resource(findNearbyUsers).to(['read']), // Grant read-only access
    ],
  }),
});