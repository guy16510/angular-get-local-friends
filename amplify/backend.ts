import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { sayHello } from './functions/say-hello/resource';
import { findNearbyUsers } from './functions/find-nearby-users/resource';
import { mutateUserProfile } from './functions/mutate-user-profile/resource';

const backend = defineBackend({
  auth,
  data,
  sayHello,
  findNearbyUsers,
  mutateUserProfile,
});

// Use "*" wildcard for all DynamoDB tables (Less secure, but flexible)
const dynamoDBTableArn = "arn:aws:dynamodb:*:*:table/UserProfileTable";
const dynamoDBIndexArn = "arn:aws:dynamodb:*:*:table/UserProfileTable/index/GeohashIndex"; // GSI for geospatial queries

// Grant full permissions to mutateUserProfile function
backend.mutateUserProfile.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'dynamodb:PutItem',
      'dynamodb:UpdateItem',
      'dynamodb:DeleteItem',
      'dynamodb:GetItem',
    ],
    resources: [dynamoDBTableArn],
  })
);

// Grant read-only permissions to findNearbyUsers function (with GSI access)
backend.findNearbyUsers.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:GetItem', 'dynamodb:Scan', 'dynamodb:Query'],
    resources: [dynamoDBTableArn, dynamoDBIndexArn], // Add GSI for geospatial lookups
  })
);

export default backend;