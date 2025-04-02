import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { getIdentityId } from '../../shared/utils/identity';
import { CognitoIdentityProviderClient, AdminAddUserToGroupCommand } from '@aws-sdk/client-cognito-identity-provider';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const cognitoClient = new CognitoIdentityProviderClient({});

const USER_POOL_ID = process.env['USER_POOL_ID'] as string;
const PREMIUM_GROUP = `PREMIUM-${process.env['AWS_BRANCH']}`;

export const handler = async (event: any) => {
  try {
    const identityId = getIdentityId(event.identity);
    
    if (!identityId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' })
      };
    }

    // Add user to premium group in Cognito
    const addToGroupCommand = new AdminAddUserToGroupCommand({
      UserPoolId: USER_POOL_ID,
      Username: identityId,
      GroupName: PREMIUM_GROUP
    });

    await cognitoClient.send(addToGroupCommand);

    // Update user profile with enrollment timestamp
    const command = new UpdateCommand({
      TableName: process.env['USER_PROFILE_TABLE'],
      Key: { identityId },
      UpdateExpression: 'SET premiumEnrolledAt = :premiumEnrolledAt',
      ExpressionAttributeValues: {
        ':premiumEnrolledAt': new Date().toISOString()
      }
    });

    await docClient.send(command);

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