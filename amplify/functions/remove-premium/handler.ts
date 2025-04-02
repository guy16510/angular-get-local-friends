import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { getIdentityId } from '../../shared/utils/identity';
import { CognitoIdentityProviderClient, AdminRemoveUserFromGroupCommand } from '@aws-sdk/client-cognito-identity-provider';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const cognitoClient = new CognitoIdentityProviderClient({});

const USER_POOL_ID = process.env['USER_POOL_ID'] as string;
const AWS_BRANCH = process.env['AWS_BRANCH'];
const PREMIUM_GROUP = process.env['PREMIUM_GROUP_NAME'];

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

    // Remove user from premium group in Cognito
    console.log(`Attempting to remove user "${identityId}" from group "${PREMIUM_GROUP}" in user pool "${USER_POOL_ID}"`);
    const removeFromGroupCommand = new AdminRemoveUserFromGroupCommand({
      UserPoolId: USER_POOL_ID,
      Username: identityId,
      GroupName: PREMIUM_GROUP
    });

    const groupRemoveResponse = await cognitoClient.send(removeFromGroupCommand);
    console.log('Successfully removed user from premium group. Response:', groupRemoveResponse);

    // First, query the user profile to get the primary key
    console.log(`Querying user profile for identityId: ${identityId}`);
    const queryCommand = new QueryCommand({
      TableName: process.env['USER_PROFILE_TABLE'],
      IndexName: 'identityId-index',
      KeyConditionExpression: 'identityId = :identityId',
      ExpressionAttributeValues: {
        ':identityId': identityId
      }
    });

    const queryResponse = await docClient.send(queryCommand);
    if (!queryResponse.Items || queryResponse.Items.length === 0) {
      throw new Error(`No user profile found for identityId: ${identityId}`);
    }

    const userProfile = queryResponse.Items[0];

    if (!userProfile || !userProfile['id']) {
      throw new Error(`Queried user profile missing 'id': ${JSON.stringify(userProfile, null, 2)}`);
    }
    
    const primaryKey = {
      id: userProfile['id']
    };

    // Remove premiumEnrolledAt from user profile
    console.log(`Removing premiumEnrolledAt from DynamoDB table "${process.env['USER_PROFILE_TABLE']}" for user "${identityId}"`);
    const updateCommand = new UpdateCommand({
      TableName: process.env['USER_PROFILE_TABLE'],
      Key: primaryKey,
      UpdateExpression: 'REMOVE premiumEnrolledAt',
    });

    const updateResponse = await docClient.send(updateCommand);
    console.log('Successfully removed premium enrollment from user profile. Response:', updateResponse);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Successfully removed premium status',
        isPremium: false
      })
    };
  } catch (error) {
    console.error('Error removing premium status:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to remove premium status' })
    };
  }
}; 