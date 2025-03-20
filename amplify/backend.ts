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
import * as iam from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
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
  listMessagesByConversationId
});

/** 🔐 User Profile Table (Geo-Enabled) — External DynamoDB Table */
const userProfileTableArn = `arn:aws:dynamodb:us-east-1:${process.env['AWS_ACCOUNT_ID']}:table/${process.env['AMPLIFY_USER_PROFILE_TABLE_NAME']}`;
const userProfileTableIndexArn = `${userProfileTableArn}/index/*`;

/** 🔐 Grant DynamoDB access for Geo-based Lambdas */
backend.findNearbyUsers.resources.lambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ['dynamodb:Query', 'dynamodb:Scan'],
  resources: [userProfileTableArn, userProfileTableIndexArn]
}));

backend.mutateUserProfile.resources.lambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ['dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:DeleteItem', 'dynamodb:Query'],
  resources: [userProfileTableArn, `${userProfileTableArn}/index/identityId-index`]
}));

backend.getUserProfile.resources.lambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ['dynamodb:GetItem', 'dynamodb:Query'],
  resources: [userProfileTableArn, userProfileTableIndexArn]
}));

backend.getAnimalProfile.resources.lambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ['dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:GetItem', 'dynamodb:Query'],
  resources: [userProfileTableArn, `${userProfileTableArn}/index/identityId-index`]
}));

/** 🔐 Allow `EVERYONE` Cognito Role to access S3 Bucket */
const iamStack = backend.createStack("IAMStack");
const everyoneRole = iam.Role.fromRoleArn(
  iamStack,
  'EVERYONERole',
  process.env['AMPLIFY_EVERYONE_ROLE_ARN'] as string
);

const bucketArn = `arn:aws:s3:::${process.env['AMPLIFY_STORAGE_BUCKET_NAME']}`;

everyoneRole.addToPrincipalPolicy(new iam.PolicyStatement({
  actions: ['s3:GetObject'],
  resources: [`${bucketArn}/protected/*`]
}));

everyoneRole.addToPrincipalPolicy(new iam.PolicyStatement({
  actions: ['s3:PutObject', 's3:DeleteObject'],
  resources: [`${bucketArn}/protected/\${cognito:sub}/*`]
}));

everyoneRole.addToPrincipalPolicy(new iam.PolicyStatement({
  actions: ['s3:PutObject', 's3:DeleteObject'],
  resources: [`${bucketArn}/protected/*`],
  conditions: {
    "StringLike": {
      "s3:prefix": "protected/\${cognito:sub}/*"
    }
  }
}));

everyoneRole.addToPrincipalPolicy(new iam.PolicyStatement({
  actions: ['s3:PutObject', 's3:DeleteObject'],
  resources: [`${bucketArn}/protected/\${aws:PrincipalTag/sub}/*`]
}));

/** 🔐 AppSync Scoped IAM Policy */
const appsyncApiArn = `arn:aws:appsync:us-east-1:${process.env['AWS_ACCOUNT_ID']}:apis/${process.env['AMPLIFY_GRAPHQL_API_ID']}/*`;

everyoneRole.addToPrincipalPolicy(new iam.PolicyStatement({
  actions: ['appsync:GraphQL'],
  resources: [appsyncApiArn]
}));

/** 💬 ChatMessage Table Permissions */
const chatMessageTableArn = `arn:aws:dynamodb:us-east-1:${process.env['AWS_ACCOUNT_ID']}:table/${process.env['AMPLIFY_CHAT_MESSAGE_TABLE_NAME']}`;
const chatMessageIndexArn = `${chatMessageTableArn}/index/*`;

/** 💬 Conversation Table Permissions */
const conversationTableArn = `arn:aws:dynamodb:us-east-1:${process.env['AWS_ACCOUNT_ID']}:table/${process.env['AMPLIFY_CONVERSATION_TABLE_NAME']}`;
const conversationIndexArn = `${conversationTableArn}/index/*`;

backend.createMessage.resources.lambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ['dynamodb:PutItem', 'dynamodb:UpdateItem'],
  resources: [chatMessageTableArn, conversationTableArn]
}));

backend.listMessagesByConversationId.resources.lambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ['dynamodb:Query'],
  resources: [chatMessageTableArn, chatMessageIndexArn]
}));

backend.listConversations.resources.lambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ['dynamodb:Query'],
  resources: [conversationTableArn, conversationIndexArn]
}));