import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { getIdentityId } from '../../shared/utils/identity';
import { CognitoIdentityProviderClient, AdminAddUserToGroupCommand } from '@aws-sdk/client-cognito-identity-provider';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const cognitoClient = new CognitoIdentityProviderClient({});

const USER_POOL_ID = process.env['USER_POOL_ID'] as string;
const AWS_BRANCH = process.env['AWS_BRANCH'];
const PREMIUM_GROUP = `PREMIUM-${AWS_BRANCH}`;

export const handler = async (event: any) => {
  console.log('Handler triggered with event:', JSON.stringify(event));
  console.log('USER_POOL_ID:', USER_POOL_ID);
  console.log('AWS_BRANCH:', AWS_BRANCH);
  console.log('Constructed PREMIUM_GROUP:', PREMIUM_GROUP);

  try {
    const identityId = getIdentityId(event.identity);
    console.log('Extracted identityId:', identityId);
    
    if (!identityId) {
      console.error('No identityId found in event. Aborting process.');
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' })
      };
    }

    // Add user to premium group in Cognito
    console.log(`Attempting to add user "${identityId}" to group "${PREMIUM_GROUP}" in user pool "${USER_POOL_ID}"`);
    const addToGroupCommand = new AdminAddUserToGroupCommand({
      UserPoolId: USER_POOL_ID,
      Username: identityId,
      GroupName: PREMIUM_GROUP
    });

    const groupAddResponse = await cognitoClient.send(addToGroupCommand);
    console.log('Successfully added user to premium group. Response:', groupAddResponse);

    // Update user profile with enrollment timestamp
    const premiumEnrolledAt = new Date().toISOString();
    console.log(`Updating DynamoDB table "${process.env['USER_PROFILE_TABLE']}" for user "${identityId}" with premiumEnrolledAt: ${premiumEnrolledAt}`);
    const updateCommand = new UpdateCommand({
      TableName: process.env['USER_PROFILE_TABLE'],
      Key: { identityId },
      UpdateExpression: 'SET premiumEnrolledAt = :premiumEnrolledAt',
      ExpressionAttributeValues: {
        ':premiumEnrolledAt': premiumEnrolledAt
      }
    });

    const updateResponse = await docClient.send(updateCommand);
    console.log('Successfully updated user profile with premium enrollment. Response:', updateResponse);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Successfully enrolled in premium',
        isPremium: true
      })
    };
  } catch (error) {
    console.error('Error enrolling in premium:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to enroll in premium' })
    };
  }
};