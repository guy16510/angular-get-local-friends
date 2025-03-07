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

// ✅ Get the Lambda execution role for `getUserProfile`
const userProfileLambda = backend.getUserProfile.resources.lambda;

// ✅ Allow `getUserProfile` Lambda to read from DynamoDB
userProfileLambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ["dynamodb:GetItem", "dynamodb:Query"],
  resources: [
    `arn:aws:dynamodb:us-east-1:*:table/${process.env['AMPLIFY_USER_PROFILE_TABLE_NAME']}`
  ]
}));

// ✅ Get the Lambda execution role for `mutateUserProfile`
const mutateUserProfileLambda = backend.mutateUserProfile.resources.lambda;

// ✅ Allow `mutateUserProfile` Lambda to write to DynamoDB
mutateUserProfileLambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ["dynamodb:PutItem"],
  resources: [
    `arn:aws:dynamodb:us-east-1:*:table/${process.env['AMPLIFY_USER_PROFILE_TABLE_NAME']}`
  ]
}));

// ✅ Get the IAM role for authenticated users (Cognito Identity Pool)
const authenticatedRole = backend.auth.resources.authenticatedUserIamRole;

// ✅ Allow authenticated users to upload and read from S3
authenticatedRole.addToPrincipalPolicy(new iam.PolicyStatement({
  actions: ["s3:PutObject", "s3:GetObject"],
  resources: [
    `arn:aws:s3:::${process.env['AMPLIFY_STORAGE_BUCKET_NAME']}/*`
  ]
}));