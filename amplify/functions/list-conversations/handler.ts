import type { Schema } from '../../data/resource';
import { getIdentityId } from '../../shared/utils/identity';
import { getBlockLists } from '../../shared/utils/block';
import { toConversation } from '../../shared/mappers/conversationMapper';
import { DynamoDB } from 'aws-sdk';

const docClient = new DynamoDB.DocumentClient();
const CONV_TABLE = process.env['CONVERSATION_TABLE_NAME']!;
const BLOCK_TABLE = process.env['BLOCK_TABLE_NAME']!;

export const handler: Schema["customListConversations"]["functionHandler"] = async (event) => {
  const identityId = getIdentityId(event.identity);
  if (!identityId) throw new Error("Unauthorized");

  // Load blocks
  const { blockedSet } = await getBlockLists(identityId, BLOCK_TABLE);

  // Query conversations where I'm participant A or B
  const [resA, resB] = await Promise.all([
    docClient.query({
      TableName: CONV_TABLE,
      IndexName: 'conversationsByParticipantAAndLastTimestamp',
      KeyConditionExpression: 'participantA = :uid',
      ExpressionAttributeValues: { ':uid': identityId },
      ScanIndexForward: false,
    }).promise(),
    docClient.query({
      TableName: CONV_TABLE,
      IndexName: 'conversationsByParticipantBAndLastTimestamp',
      KeyConditionExpression: 'participantB = :uid',
      ExpressionAttributeValues: { ':uid': identityId },
      ScanIndexForward: false,
    }).promise()
  ]);

  // Dedupe and filter out any convo with a blocked user
  const all = [...(resA.Items||[]), ...(resB.Items||[])];
  const unique = Array.from(new Map(all.map(c => [c['id'], c])).values());
  const safe = unique.filter(c => {
    const other = c['participantA'] === identityId
      ? c['participantB']
      : c['participantA'];
    return !blockedSet.has(other);
  });

  return safe.map(toConversation);
};
