import { DynamoDB } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import type {Schema} from '../../data/resource';
import { getIdentityId } from '../../shared/utils/identity';

const docClient = new DynamoDB.DocumentClient();

export const handler: Schema['addMessageReaction']['functionHandler'] = async (event) => {
  const { messageId, emoji } = event.arguments;
  const userId = getIdentityId(event.identity);
  if (!userId) throw new Error('Unauthorized');

  const timestamp = new Date().toISOString();
  const reaction = {
    id: uuid(),
    messageId,
    userId,
    emoji,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  const tableName = process.env['MESSAGE_REACTION_TABLE_NAME'];
  if (!tableName) throw new Error('Missing MESSAGE_REACTION_TABLE_NAME');

  await docClient.put({
    TableName: tableName,
    Item: reaction
  }).promise();

  return reaction; // ✅ This should be fine IF your schema.returnType is correctly set
};
