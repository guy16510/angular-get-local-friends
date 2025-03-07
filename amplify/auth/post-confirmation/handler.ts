import type { PostConfirmationTriggerHandler } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand
} from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient();
const GROUP_NAME = `EVERYONE-${process.env['AWS_BRANCH']}`;  // Use AWS_BRANCH


// add user to group
export const handler: PostConfirmationTriggerHandler = async (event) => {
    console.log("Lambda environment variables:", process.env);
  
    const userPoolId = event.userPoolId;
    console.log("Using User Pool ID:", userPoolId);
  
    const groupName = process.env['GROUP_NAME'];
    console.log("Trying to add user to group:", groupName);
    
    console.log("PROCESS ENV: " + GROUP_NAME)

  const command = new AdminAddUserToGroupCommand({
    GroupName: groupName,
    Username: event.userName,
    UserPoolId: event.userPoolId
  });
  const response = await client.send(command);
  console.log('processed', response.$metadata.requestId);
  return event;
};