import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { sayHello } from './functions/say-hello/resource';
import { findNearbyUsers } from './functions/find-nearby-users/resource';
import { mutateUserProfile } from './functions/mutate-user-profile/resource';
import { storage } from './storage/resource';

defineBackend({
  auth,
  storage,
  data,
  sayHello,
  findNearbyUsers,
  mutateUserProfile,
});

