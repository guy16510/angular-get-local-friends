import type { Schema } from '../../data/resource';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = process.env['USER_PROFILE_TABLE_NAME']!;
if (!TABLE_NAME) throw new Error("Missing environment variable: USER_PROFILE_TABLE_NAME");

const ddbClient = new DynamoDB({});
const docClient = DynamoDBDocument.from(ddbClient);

export const handler: Schema["fetchUserProfile"]["functionHandler"] = async (event) => {
  const { identityId } = event.arguments;

  const result = await docClient.query({
    TableName: TABLE_NAME,
    IndexName: 'userProfilesByIdentityId',
    KeyConditionExpression: 'identityId = :id',
    ExpressionAttributeValues: { ':id': identityId }
  });

  return result.Items?.[0] || null;
};