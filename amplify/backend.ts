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

// Grant permissions to mutateUserProfile function
backend.mutateUserProfile.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'dynamodb:PutItem',
      'dynamodb:UpdateItem',
      'dynamodb:DeleteItem',
      'dynamodb:GetItem',
    ],
    resources: ['arn:aws:dynamodb:*:*:table/UserProfileTable'],
  })
);

// Grant read-only permissions to findNearbyUsers function
backend.findNearbyUsers.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:GetItem', 'dynamodb:Scan', 'dynamodb:Query'],
    resources: ['arn:aws:dynamodb:*:*:table/UserProfileTable'],
  })
);

export default backend;