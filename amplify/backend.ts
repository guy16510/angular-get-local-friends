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

/**
 * Gets detail on the specific userProfile
 */
const userProfileLambda = backend.getUserProfile.resources.lambda;
userProfileLambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ["dynamodb:GetItem", "dynamodb:Query"],
  resources: [
    `arn:aws:dynamodb:us-east-1:${process.env['AWS_ACCOUNT_ID']}:table/${process.env['AMPLIFY_USER_PROFILE_TABLE_NAME']}`
  ]
}));

/**
 * GeoSpatial look up for users in Dynamo
 */
const findNearbyUsersLambda = backend.findNearbyUsers.resources.lambda;
findNearbyUsersLambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ["dynamodb:Query"],
  resources: [
    `arn:aws:dynamodb:us-east-1:${process.env['AWS_ACCOUNT_ID']}:table/${process.env['AMPLIFY_USER_PROFILE_TABLE_NAME']}`,
    `arn:aws:dynamodb:us-east-1:${process.env['AWS_ACCOUNT_ID']}:table/${process.env['AMPLIFY_USER_PROFILE_TABLE_NAME']}/index/userProfilesByGeohashAndRangeKey`
  ]
}));

/**
 * For users to add their survey results to Dynamo
 */
const mutateUserProfileLambda = backend.mutateUserProfile.resources.lambda;
mutateUserProfileLambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ["dynamodb:PutItem"],
  resources: [
    `arn:aws:dynamodb:us-east-1:${process.env['AWS_ACCOUNT_ID']}:table/${process.env['AMPLIFY_USER_PROFILE_TABLE_NAME']}`
  ]
}));


/**
 * For adding users impages to S3 bucket.
 */
const authResources = backend.auth.resources;
const everyoneRole = authResources.authenticatedUserIamRole;

// ✅ Add IAM Policy to allow `EVERYONE` users to access S3
everyoneRole.addToPrincipalPolicy(new iam.PolicyStatement({
  actions: ["s3:GetObject"],
  resources: [`arn:aws:s3:::${process.env['AMPLIFY_STORAGE_BUCKET_NAME']}/protected/*`],
  effect: iam.Effect.ALLOW,
}));

everyoneRole.addToPrincipalPolicy(new iam.PolicyStatement({
  actions: ["s3:PutObject", "s3:DeleteObject"],
  resources: [`arn:aws:s3:::${process.env['AMPLIFY_STORAGE_BUCKET_NAME']}/protected/*`],
  effect: iam.Effect.ALLOW,
  conditions: {
    StringLike: {
      "s3:prefix": ["protected/${cognito-identity.amazonaws.com:sub}/*"]
    }
  }
}));