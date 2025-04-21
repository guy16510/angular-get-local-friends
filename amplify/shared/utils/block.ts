import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

/**
 * Fetches who the given user has blocked and who has blocked them.
 * Returns { blockedByMe, blockedMe, blockedSet } for easy filtering/guarding.
 */
export async function getBlockLists(
  identityId: string,
  blockTableName: string
): Promise<{
  blockedByMe: string[];
  blockedMe: string[];
  blockedSet: Set<string>;
}> {
  if (!identityId) throw new Error('Missing caller identity');
  if (!blockTableName) throw new Error('Missing BLOCK_TABLE_NAME env var');

  const ddb = new DynamoDB({});
  const doc = DynamoDBDocumentClient.from(ddb);

  // 1) who I’ve blocked
  const resp1 = await doc.send(new QueryCommand({
    TableName: blockTableName,
    IndexName: 'blockerId',                    // secondary index on blockerId
    KeyConditionExpression: 'blockerId = :me',
    ExpressionAttributeValues: { ':me': identityId }
  }));
  const blockedByMe = (resp1.Items || []).map(i => unmarshall(i)['blockedId']);

  // 2) who’s blocked me
  const resp2 = await doc.send(new QueryCommand({
    TableName: blockTableName,
    IndexName: 'blockedId',                    // secondary index on blockedId
    KeyConditionExpression: 'blockedId = :me',
    ExpressionAttributeValues: { ':me': identityId }
  }));
  const blockedMe = (resp2.Items || []).map(i => unmarshall(i)['blockerId']);

  const blockedSet = new Set<string>([...blockedByMe, ...blockedMe]);
  return { blockedByMe, blockedMe, blockedSet };
}
