import { DynamoDB } from 'aws-sdk';
import type { Schema } from '../../data/resource';
import { getIdentityId } from '../../shared/utils/identity';

const docClient = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env['USER_BLOCK_TABLE_NAME']!;

export const handler: Schema['blockUser']['functionHandler'] = async (event) => {
  const userId = getIdentityId(event.identity);
  const blockedUserId = event.arguments.blockedUserId as string;

  if (!userId || !blockedUserId) {
    throw new Error('Missing userId or blockedUserId');
  }

  const item = {
    id: `${userId}-${blockedUserId}`,
    userId,
    blockedUserId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await docClient.put({ TableName: TABLE_NAME, Item: item }).promise();

  return item;
};
