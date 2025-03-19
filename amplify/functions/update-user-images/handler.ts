import type { Schema } from '../../data/resource';
import AWS from 'aws-sdk';
import { getIdentityId } from '../../shared/utils/identity';
/**
 * TODO not implemented yet.
 */
const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env['USER_PROFILE_TABLE_NAME'] || '';

if (!TABLE_NAME || TABLE_NAME.length === 0) {
  console.error("ERROR: USER_PROFILE_TABLE_NAME is not set!");
  throw new Error("Missing environment variable: USER_PROFILE_TABLE_NAME");
}

export const handler: Schema["updateUserImages"]["functionHandler"] = async (event) => {
  const { images } = event.arguments;
  
   // Retrieve unique user identifier from signed request
   const userId = getIdentityId(event.identity);
   if (!userId) {
     throw new Error("Unauthorized: Missing identity");
   }

  // Ensure primary key is correct
  const key = { id: userId };

  // Check if the user profile exists before updating
  const existingItem = await docClient.get({ TableName: TABLE_NAME, Key: key }).promise();
  
  if (!existingItem.Item) {
    throw new Error(`UserProfile with id ${userId} does not exist. Cannot update images.`);
  }

  const params = {
    TableName: TABLE_NAME,
    Key: key,
    UpdateExpression: 'set images = :imgs, updatedAt = :upd, lastUpdated = :upd',
    ExpressionAttributeValues: {
      ':imgs': images,
      ':upd': new Date().toISOString(),
    },
    ReturnValues: 'UPDATED_NEW'
  };

  await docClient.update(params).promise();
  
  return `UserProfile for ${userId} updated with images successfully.`;
};