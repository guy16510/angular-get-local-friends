import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { getIdentityId } from '../../shared/utils/identity';

const ddb = new DynamoDBClient({});
const doc = DynamoDBDocumentClient.from(ddb);
const TABLE = process.env['BLOCK_TABLE_NAME']!;
if (!TABLE) throw new Error('BLOCK_TABLE_NAME env var is missing');

export const handler = async (event: any) => {
  const blockerId = getIdentityId(event.identity);
  if (!blockerId) throw new Error('Unauthorized');
  const { blockedUserId } = event.arguments;

  // 1) find the Block record
  const queryResp = await doc.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'blockerId',
    KeyConditionExpression: 'blockerId = :b AND blockedId = :u',
    ExpressionAttributeValues: { ':b': blockerId, ':u': blockedUserId }
  }));
  if (!queryResp.Items || queryResp.Items.length === 0) return '';

  const { id } = queryResp.Items[0];
  await doc.send(new DeleteCommand({ TableName: TABLE, Key: { id } }));
  return id;
};
