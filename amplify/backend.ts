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
import { reactToMessage } from './functions/react-to-message/resource';
import { listUnreadMessages } from './functions/list-unread-messages/resource';
import { enrollPremium } from './functions/enroll-premium/resource';
import { checkMessageLimit } from './functions/check-message-limit/resource';
import { removePremium } from './functions/remove-premium/resource';
import { createReport } from './functions/create-report/resource';
import { generateCompatibilityInsights } from './functions/generate-compatibility-insights/resource';
import { blockUser } from './functions/block-user/resource';

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
  reactToMessage,
  listUnreadMessages,
  enrollPremium,
  checkMessageLimit,
  removePremium,
  createReport,
  generateCompatibilityInsights,
  blockUser
});


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

const chatMessageTableArn = `arn:aws:dynamodb:us-east-1:${process.env['AWS_ACCOUNT_ID']}:table/${process.env['AMPLIFY_CHAT_MESSAGE_TABLE_NAME']}`;
const chatMessageIndexArn = `${chatMessageTableArn}/index/*`;

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

backend.setTypingStatus.resources.lambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ['dynamodb:PutItem', 'dynamodb:UpdateItem'],
  resources: [`arn:aws:dynamodb:us-east-1:${process.env['AWS_ACCOUNT_ID']}:table/${process.env['AMPLIFY_TYPING_STATUS_TABLE_NAME']}`]
}));

backend.markMessagesAsRead.resources.lambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ['dynamodb:Query', 'dynamodb:UpdateItem'],
  resources: [chatMessageTableArn, chatMessageIndexArn]
}));

backend.reactToMessage.resources.lambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ['dynamodb:UpdateItem'],
  resources: [chatMessageTableArn]
}));

backend.listUnreadMessages.resources.lambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ['dynamodb:Query'],
  resources: [
    chatMessageTableArn,
    `${chatMessageTableArn}/index/*`
  ]
}));

backend.enrollPremium.resources.lambda.addToRolePolicy(new iam.PolicyStatement({
  actions: [
    'dynamodb:UpdateItem',
    'dynamodb:Query',
    'cognito-idp:AdminAddUserToGroup'
  ],
  resources: [
    userProfileTableArn,
    `${userProfileTableArn}/index/identityId-index`,
    `arn:aws:cognito-idp:us-east-1:${process.env['AWS_ACCOUNT_ID']}:userpool/${process.env['AMPLIFY_USER_POOL_ID']}`
  ]
}));

backend.checkMessageLimit.resources.lambda.addToRolePolicy(new iam.PolicyStatement({
  actions: [
    'dynamodb:GetItem',
    'dynamodb:Query',
    'cognito-idp:AdminListGroupsForUser'
  ],
  resources: [
    userProfileTableArn,
    chatMessageTableArn,
    chatMessageIndexArn,
    `arn:aws:cognito-idp:us-east-1:${process.env['AWS_ACCOUNT_ID']}:userpool/${process.env['AMPLIFY_USER_POOL_ID']}`
  ]
}));

backend.removePremium.resources.lambda.addToRolePolicy(new iam.PolicyStatement({
  actions: [
    'cognito-idp:AdminRemoveUserFromGroup'
  ],
  resources: [
    `arn:aws:cognito-idp:us-east-1:${process.env['AWS_ACCOUNT_ID']}:userpool/${process.env['AMPLIFY_USER_POOL_ID']}`
  ]
}));

const reportTableArn = `arn:aws:dynamodb:us-east-1:${process.env['AWS_ACCOUNT_ID']}:table/${backend.data.resources.tables["Report"].tableName}`;
const blockTableArn = `arn:aws:dynamodb:us-east-1:${process.env['AWS_ACCOUNT_ID']}:table/${backend.data.resources.tables["UserBlock"].tableName}`;

backend.createReport.resources.lambda.addToRolePolicy(new iam.PolicyStatement({
  actions: [
    'dynamodb:PutItem',
    'dynamodb:GetItem',
    'dynamodb:UpdateItem',
    'dynamodb:DeleteItem',
    'dynamodb:Query',
    'dynamodb:Scan'
  ],
  resources: [reportTableArn]
}));

backend.blockUser.resources.lambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ['dynamodb:PutItem'],
  resources: [blockTableArn]
}));

backend.createReport.resources.lambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ['ses:SendEmail'],
  resources: ['*']
}));

// Grant DynamoDB access to the generateCompatibilityInsights function
backend.generateCompatibilityInsights.resources.lambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ['dynamodb:Query'],
  resources: [userProfileTableArn, `${userProfileTableArn}/index/identityId-index`]
}));

// Add this after the reportTableArn definition
backend.createReport.addEnvironment("AMPLIFY_REPORT_TABLE_NAME", backend.data.resources.tables["Report"].tableName);
backend.blockUser.addEnvironment("AMPLIFY_USER_BLOCK_TABLE_NAME", backend.data.resources.tables["UserBlock"].tableName);
