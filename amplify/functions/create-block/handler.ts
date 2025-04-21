import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { getIdentityId } from '../../shared/utils/identity';
import { sanitizeBigInts } from '../../shared/utils/sanitize';
import crypto from 'crypto';

const ddb = new DynamoDBClient({});
const doc = DynamoDBDocumentClient.from(ddb);
const TABLE = process.env['BLOCK_TABLE_NAME']!;
if (!TABLE) throw new Error('BLOCK_TABLE_NAME env var is missing');

export const handler = async (event:any) => {
  const blockerId = getIdentityId(event.identity);
  if (!blockerId) throw new Error('Unauthorized');
  const { blockedUserId } = event.arguments;

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const item = { id, blockerId, blockedId: blockedUserId, createdAt: now, updatedAt: now };

  await doc.send(new PutCommand({ TableName: TABLE, Item: item }));
  return sanitizeBigInts(item);
};
