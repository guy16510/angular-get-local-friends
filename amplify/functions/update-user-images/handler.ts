import type { Schema } from '../../data/resource';
import AWS from 'aws-sdk';

const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env['USER_PROFILE_TABLE_NAME'] || '';

if (!TABLE_NAME || TABLE_NAME.length === 0) {
  console.error("ERROR: USER_PROFILE_TABLE_NAME is not set!");
  throw new Error("Missing environment variable: USER_PROFILE_TABLE_NAME");
}

export const handler: Schema["updateUserImages"]["functionHandler"] = async (event) => {
  const { identityId, images } = event.arguments;
  if (!identityId) {
    throw new Error("identityId is required");
  }
  
  // The 'images' argument is expected to be an array of S3 keys/URLs.
  // When files are uploaded with level "protected", Amplify automatically prefixes the key with the user's identity.
  
  const params = {
    TableName: TABLE_NAME,
    Key: { identityId },
    UpdateExpression: 'set images = :imgs, updatedAt = :upd, lastUpdated = :upd',
    ExpressionAttributeValues: {
      ':imgs': images,
      ':upd': new Date().toISOString(),
    },
    ReturnValues: 'UPDATED_NEW'
  };
  
  await docClient.update(params).promise();
  
  return `UserProfile for ${identityId} updated with images successfully.`;
};