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
import { markMessagesAsRead } from './functions/mark-messages-as-read/resource';
import { notifyUnreadMessage } from './functions/notify-unread-message/resource';
import { reactToMessage } from './functions/react-to-message/resource';

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
  listMessagesByConversationId,
  setTypingStatus, 
  markMessagesAsRead,
  notifyUnreadMessage,
  reactToMessage,
});

/** 🔐 User Profile Table (Geo-Enabled) */
const userProfileTableArn = `arn:aws:dynamodb:us-east-1:${process.env['AWS_ACCOUNT_ID']}:table/${process.env['AMPLIFY_USER_PROFILE_TABLE_NAME']}`;
const userProfileTableIndexArn = `${userProfileTableArn}/index/*`;

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

/** 🔐 S3 Bucket Access for Cognito Role */
const iamStack = backend.createStack("IAMStack");
const everyoneRole = iam.Role.fromRoleArn(
  iamStack,
  'EVERYONERole',
  process.env['AMPLIFY_EVERYONE_ROLE_ARN'] as string
);

const bucketArn = `arn:aws:s3:::${process.env['AMPLIFY_STORAGE_BUCKET_NAME']}`;

everyoneRole.addToPrincipalPolicy(new iam.PolicyStatement({
  actions: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
  resources: [`${bucketArn}/protected/*`]
}));

everyoneRole.addToPrincipalPolicy(new iam.PolicyStatement({
  actions: ['appsync:GraphQL'],
  resources: [`arn:aws:appsync:us-east-1:${process.env['AWS_ACCOUNT_ID']}:apis/${process.env['AMPLIFY_GRAPHQL_API_ID']}/*`]
}));

/** 💬 ChatMessage & Conversation Tables */
const chatMessageTableArn = `arn:aws:dynamodb:us-east-1:${process.env['AWS_ACCOUNT_ID']}:table/${process.env['AMPLIFY_CHAT_MESSAGE_TABLE_NAME']}`;
const chatMessageIndexArn = `${chatMessageTableArn}/index/*`;

const conversationTableArn = `arn:aws:dynamodb:us-east-1:${process.env['AWS_ACCOUNT_ID']}:table/${process.env['AMPLIFY_CONVERSATION_TABLE_NAME']}`;
const conversationIndexArn = `${conversationTableArn}/index/*`;

backend.createMessage.resources.lambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ['dynamodb:PutItem', 'dynamodb:UpdateItem'],
  resources: [chatMessageTableArn, conversationTableArn]
}));

backend.createMessage.resources.lambda.addToRolePolicy(new iam.PolicyStatement({
  actions: [
    'logs:CreateLogGroup',
    'logs:CreateLogStream',
    'logs:PutLogEvents'
  ],
  resources: ['arn:aws:logs:*:*:*']
}));

backend.listMessagesByConversationId.resources.lambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ['dynamodb:Query'],
  resources: [chatMessageTableArn, chatMessageIndexArn]
}));

backend.listConversations.resources.lambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ['dynamodb:Query'],
  resources: [conversationTableArn, conversationIndexArn]
}));

backend.setTypingStatus.resources.lambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ['dynamodb:PutItem', 'dynamodb:UpdateItem'],
  resources: [`arn:aws:dynamodb:us-east-1:${process.env['AWS_ACCOUNT_ID']}:table/${process.env['AMPLIFY_TYPING_STATUS_TABLE_NAME']}`]
}));

backend.markMessagesAsRead.resources.lambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ['dynamodb:Query', 'dynamodb:UpdateItem'],
  resources: [chatMessageTableArn, chatMessageIndexArn]
}));


// ✅ This is the new permissions block for reactions (editing the ChatMessage model)
backend.reactToMessage.resources.lambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ['dynamodb:UpdateItem'],
  resources: [chatMessageTableArn]
}));
