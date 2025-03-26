import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { findNearbyUsers } from './functions/find-nearby-users/resource';
import { mutateUserProfile } from './functions/mutate-user-profile/resource';
import { findPremiumMatches } from './functions/find-premium-matches/resource';
import { updateUserImages } from './functions/update-user-images/resource';
import { createMessage } from './functions/create-message/resource';
import { listConversations } from './functions/list-conversations/resource';
import { getUserProfile } from './functions/get-user-profile/resource';
import { getAnimalProfile } from './functions/get-animal-profile/resource';
import { listMessagesByConversationId } from './functions/list-messages-by-conversation-id/resource';
import { setTypingStatus } from './functions/set-typing-status/resource';
import * as iam from 'aws-cdk-lib/aws-iam';

defineBackend({
  auth,
  data,
  storage,
  findNearbyUsers,
  mutateUserProfile,
  findPremiumMatches,
  updateUserImages,
  createMessage,
  listConversations,
  getUserProfile,
  getAnimalProfile,
  listMessagesByConversationId,
  setTypingStatus
});
