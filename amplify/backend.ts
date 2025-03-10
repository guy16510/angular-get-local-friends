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

const dynamoTableArn = `arn:aws:dynamodb:us-east-1:${process.env['AWS_ACCOUNT_ID']}:table/${process.env['AMPLIFY_USER_PROFILE_TABLE_NAME']}`;
const dynamoIndexArn = `${dynamoTableArn}/index/userProfilesByGeohashAndRangeKey`;

/**
 * ✅ Grant read access to `getUserProfile` Lambda
 */
const userProfileLambda = backend.getUserProfile.resources.lambda;
userProfileLambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ["dynamodb:GetItem", "dynamodb:Query"],
  resources: [dynamoTableArn]
}));

/**
 * ✅ Grant read access to `findNearbyUsers` Lambda
 */
const findNearbyUsersLambda = backend.findNearbyUsers.resources.lambda;
findNearbyUsersLambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ["dynamodb:Query"],
  resources: [dynamoTableArn, dynamoIndexArn]
}));

/**
 * ✅ Grant write access to `mutateUserProfile` Lambda
 */
const mutateUserProfileLambda = backend.mutateUserProfile.resources.lambda;
mutateUserProfileLambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ["dynamodb:PutItem"],
  resources: [dynamoTableArn]
}));

/**
 * ✅ Allow `EVERYONE` Cognito role to access S3
 */
const iamStack = backend.createStack("IAMStack");

const everyoneRole = iam.Role.fromRoleArn(
  iamStack,
  'EVERYONERole',
  process.env['AMPLIFY_EVERYONE_ROLE_ARN'] as string // from amplify.yml
);

const bucketArn = `arn:aws:s3:::${process.env['AMPLIFY_STORAGE_BUCKET_NAME']}`;

everyoneRole.addToPrincipalPolicy(new iam.PolicyStatement({
  actions: ["s3:GetObject"],
  resources: [`${bucketArn}/protected/*`],
}));

everyoneRole.addToPrincipalPolicy(new iam.PolicyStatement({
  actions: ["s3:PutObject", "s3:DeleteObject"],
  resources: [`${bucketArn}/protected/\${cognito-identity.amazonaws.com:sub}/*`],
}));