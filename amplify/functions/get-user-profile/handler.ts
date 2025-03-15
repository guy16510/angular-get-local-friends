import type { Schema } from '../../data/resource';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument} from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = process.env['USER_PROFILE_TABLE_NAME']!;
if (!TABLE_NAME) throw new Error("Missing environment variable: USER_PROFILE_TABLE_NAME");

const ddbClient = new DynamoDB({});
const docClient = DynamoDBDocument.from(ddbClient);

export const handler: Schema["fetchUserProfile"]["functionHandler"] = async (event) => {
  const { identityId } = event.arguments;

  const params = {
    TableName: TABLE_NAME,
    IndexName: 'identityId-index', // <-- Explicitly add a GSI to your table
    KeyConditionExpression: 'identityId = :identityId',
    ExpressionAttributeValues: {
      ':identityId': identityId
    }
  };

  try {
    const result = await docClient.query(params);
    if (!result.Items || result.Items.length === 0) {
      console.info(`ℹ️ No user found for identityId: ${identityId}`);
      return null;
    }

    console.info(`✅ UserProfile fetched successfully for identityId: ${identityId}`);
    return result.Items[0]; // Return first match (should only be one)
  } catch (error) {
    console.error(`❌ Failed fetching user profile for identityId: ${identityId}`, error);
    throw new Error("Internal server error");
  }
};