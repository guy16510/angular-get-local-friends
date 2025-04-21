import type { Schema } from '../../data/resource';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { sanitizeBigInts } from '../../shared/utils/sanitize';

const TABLE_NAME = process.env['USER_PROFILE_TABLE_NAME']!;
if (!TABLE_NAME) throw new Error("Missing environment variable: USER_PROFILE_TABLE_NAME");

const ddbClient = new DynamoDB({});
const docClient = DynamoDBDocument.from(ddbClient);

export const handler: Schema["fetchUserProfile"]["functionHandler"] = async (event) => {
  const { identityId } = event.arguments;
  if (!identityId) throw new Error("Missing identityId");

  try {
    // Try query via GSI (assuming identityId-index exists)
    const result = await docClient.query({
      TableName: TABLE_NAME,
      IndexName: 'identityId-index',
      KeyConditionExpression: 'identityId = :identityId',
      ExpressionAttributeValues: {
        ':identityId': identityId
      }
    });

    if (!result.Items || result.Items.length === 0) {
      console.warn(`⚠️ No user profile found for identityId: ${identityId}`);
      return null;
    }

    const sanitized = sanitizeBigInts(result.Items[0]);

    return sanitized;
  } catch (err) {
    console.error(`❌ [fetchUserProfile] Error:`, err);
    throw new Error("Internal server error");
  }
};

/**
 * add signature to pass user who is invoking this api's identity ID, then you can add teh blocked user code here:
 * 
 * const BLOCK_TABLE = process.env.BLOCK_TABLE_NAME!;
const { blockedByMe, blockedMe, blockedSet } = 
  await getBlockLists(identityId, BLOCK_TABLE);

  
  if (blockedByMe.includes(recipientId) || blockedMe.includes(recipientId)) {
  throw new Error('Messaging not allowed due to block');
}

 */