import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { sayHello } from './functions/say-hello/resource';
import { findNearbyUsers } from './functions/find-nearby-users/resource';
import { mutateUserProfile } from './functions/mutate-user-profile/resource';
import { findPremiumMatches } from './functions/find-premium-matches/resource';
import { updateUserImages } from './functions/update-user-images/resource';
import { createMessage } from './functions/create-message/resource';
import { listConversations } from './functions/list-conversations/resource';
import { getUserProfile } from "./functions/get-user-profile/resource";
import * as iam from "aws-cdk-lib/aws-iam";

const backend = defineBackend({
  auth,
  data,
  sayHello,
  storage,
  findNearbyUsers,
  mutateUserProfile,
  findPremiumMatches,
  updateUserImages,
  createMessage,
  listConversations,
  getUserProfile
});

// ✅ Get the Lambda execution role
const userProfileLambda = backend.getUserProfile.resources.lambda;

// ✅ Attach IAM Policy to allow DynamoDB read access
userProfileLambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ["dynamodb:GetItem", "dynamodb:Query"],
  resources: [
    `arn:aws:dynamodb:us-east-1:*:table/${process.env['AMPLIFY_USER_PROFILE_TABLE_NAME']}`
  ]
}));