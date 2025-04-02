import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { getIdentityId } from '../../shared/utils/identity';
import { CognitoIdentityProviderClient, AdminListGroupsForUserCommand } from '@aws-sdk/client-cognito-identity-provider';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const cognitoClient = new CognitoIdentityProviderClient({});

const USER_POOL_ID = process.env['USER_POOL_ID'] as string;
const PREMIUM_GROUP = process.env['PREMIUM_GROUP_NAME'];

const DAILY_MESSAGE_LIMIT = 5;

export const handler = async (event: any) => {
  try {
    const identityId = getIdentityId(event.identity);
    
    if (!identityId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' })
      };
    }

    // Check if user is in premium group
    const listGroupsCommand = new AdminListGroupsForUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: identityId
    });

    const groupsResult = await cognitoClient.send(listGroupsCommand);
    const isPremium = groupsResult.Groups?.some(group => group.GroupName === PREMIUM_GROUP) || false;

    if (isPremium) {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          canSendMessage: true,
          isPremium: true,
          message: 'Premium users have unlimited messages'
        })
      };
    }

    // Get today's date at midnight UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Count messages sent today
    const messageCommand = new QueryCommand({
      TableName: process.env['CHAT_MESSAGE_TABLE'],
      KeyConditionExpression: 'senderId = :senderId AND createdAt >= :today',
      ExpressionAttributeValues: {
        ':senderId': identityId,
        ':today': todayISO
      }
    });

    const messageResult = await docClient.send(messageCommand);
    const messagesSentToday = messageResult.Items?.length || 0;

    const canSendMessage = messagesSentToday < DAILY_MESSAGE_LIMIT;

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        canSendMessage,
        isPremium: false,
        messagesSentToday,
        dailyLimit: DAILY_MESSAGE_LIMIT,
        message: canSendMessage 
          ? `You can send ${DAILY_MESSAGE_LIMIT - messagesSentToday} more messages today`
          : 'You have reached your daily message limit. Upgrade to premium for unlimited messages'
      })
    };
  } catch (error) {
    console.error('Error checking message limit:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to check message limit' })
    };
  }
}; 