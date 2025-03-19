import type { Schema } from '../../data/resource';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import * as ddbGeo from 'dynamodb-geo-v3';
import { getIdentityId } from '../../shared/utils/identity';

const TABLE_NAME = process.env['USER_PROFILE_TABLE_NAME']!;
if (!TABLE_NAME) throw new Error("Missing USER_PROFILE_TABLE_NAME env var");

const ddb = new DynamoDB({});
const geoConfig = new ddbGeo.GeoDataManagerConfiguration(ddb, TABLE_NAME);
geoConfig.hashKeyLength = 5;

const geoTableManager = new ddbGeo.GeoDataManager(geoConfig);

export const handler: Schema["mutateUserProfile"]["functionHandler"] = async (event) => {
  const { action, payload: payloadStr } = event.arguments;

  if (!['create', 'update', 'delete', 'onlinePing'].includes(action)) {
    throw new Error("Invalid action.");
  }

  let payload: any;
  try {
    payload = JSON.parse(payloadStr);
  } catch (err) {
    console.error('❌ Invalid JSON:', err);
    throw new Error("Payload must be valid JSON");
  }

  // Get the unique identifier (sub) from the event's signature.
  const userId = getIdentityId(event.identity);

  // Destructure values from payload except identityId (now obtained from the signature)
  const { locationLat, locationLng, userName, surveyAnswers = [], images = [] } = payload;
  const now = new Date().toISOString();

  if (['create', 'update'].includes(action)) {
    if (typeof locationLat !== 'number' || typeof locationLng !== 'number') {
      throw new Error("locationLat and locationLng are required and must be numbers");
    }

    // Compute the range key based on the unique userId
    const rangeKey = `geo#${userId}`;

    await geoTableManager.putPoint({
      RangeKeyValue: { S: rangeKey },
      GeoPoint: { latitude: locationLat, longitude: locationLng },
      PutItemInput: {
        Item: {
          identityId: { S: userId },
          userName: { S: userName },
          surveyAnswers: { S: JSON.stringify(surveyAnswers) },
          images: { S: JSON.stringify(images) },
          locationLat: { N: locationLat.toString() },
          locationLng: { N: locationLng.toString() },
          createdAt: { S: now },
          updatedAt: { S: now },
          lastUpdated: { S: now },
          lastOnlineAt: { S: now }
        }
      }
    });

    console.log(`✅ [mutateUserProfile] ${action} successful for ${userId}`);
    return { success: true, message: `UserProfile ${action}d`, action, identityId: userId };
  }

  if (action === 'delete') {
    if (typeof locationLat !== 'number' || typeof locationLng !== 'number') {
      throw new Error("locationLat and locationLng are required for deletion");
    }
    // Compute the range key from the unique identifier
    const rangeKey = `geo#${userId}`;

    await geoTableManager.deletePoint({
      RangeKeyValue: { S: rangeKey },
      GeoPoint: { latitude: locationLat, longitude: locationLng }
    });
    return { success: true, message: "Deleted", action, identityId: userId };
  }

  if (action === 'onlinePing') {
    // Lookup the user by unique identifier using the identityId index to get hashKey + rangeKey
    const queryResult = await ddb.query({
      TableName: TABLE_NAME,
      IndexName: 'identityId-index',
      KeyConditionExpression: 'identityId = :id',
      ExpressionAttributeValues: {
        ':id': { S: userId }
      }
    });

    if (!queryResult.Items || queryResult.Items.length === 0) {
      console.warn(`[mutateUserProfile] No user found for identityId: ${userId}`);
      return {
        success: false,
        message: 'User not found for onlinePing',
        action,
        identityId: userId
      };
    }

    const userItem = queryResult.Items[0];
    const hashKey = userItem['hashKey']?.N;
    const rangeKey = userItem['rangeKey']?.S;

    if (!hashKey || !rangeKey) {
      console.error(`[mutateUserProfile] User item missing hashKey or rangeKey`);
      throw new Error("UserProfile missing keys");
    }

    await ddb.updateItem({
      TableName: TABLE_NAME,
      Key: {
        hashKey: { N: hashKey.toString() },
        rangeKey: { S: rangeKey }
      },
      UpdateExpression: 'set lastOnlineAt = :lo',
      ExpressionAttributeValues: {
        ':lo': { S: new Date().toISOString() }
      }
    });

    console.info(`✅ [mutateUserProfile] Online ping updated for ${userId}`);

    return {
      success: true,
      message: 'Online ping updated successfully',
      action,
      identityId: userId
    };
  }

  throw new Error("Unhandled action");
};