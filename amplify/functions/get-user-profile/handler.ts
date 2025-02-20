import type { Schema } from '../../data/resource';
import AWS from 'aws-sdk';

const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env['USER_PROFILE_TABLE_NAME'] || '';

if (!TABLE_NAME || TABLE_NAME.length === 0) {
  console.error("ERROR: USER_PROFILE_TABLE_NAME is not set!");
  throw new Error("Missing environment variable: USER_PROFILE_TABLE_NAME");
}

export const handler: Schema["fetchUserProfile"]["functionHandler"] = async (event) => {
  const { identityId } = event.arguments;
  if (!identityId) {
    throw new Error("identityId is required");
  }

  const params = {
    TableName: TABLE_NAME,
    Key: { id: identityId },
  };

  const result = await docClient.get(params).promise();
  // Return the item as a JSON string (if your schema returns a string) or as an object.
  return result.Item ? JSON.stringify(result.Item) : null;
};