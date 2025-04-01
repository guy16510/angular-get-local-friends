import { getIdentityId } from '../../shared/utils/identity';
import { CognitoIdentityProviderClient, AdminRemoveUserFromGroupCommand } from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({});

const USER_POOL_ID = process.env['AMPLIFY_USER_POOL_ID'] as string;
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

    // Remove user from premium group in Cognito
    const removeFromGroupCommand = new AdminRemoveUserFromGroupCommand({
      UserPoolId: USER_POOL_ID,
      Username: identityId,
      GroupName: PREMIUM_GROUP
    });

    await cognitoClient.send(removeFromGroupCommand);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Successfully removed from premium',
        isPremium: false
      })
    };
  } catch (error) {
    console.error('Error removing from premium:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to remove from premium' })
    };
  }
}; 