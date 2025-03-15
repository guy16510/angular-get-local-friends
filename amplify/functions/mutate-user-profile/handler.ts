import type { Schema } from '../../data/resource';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import * as ddbGeo from 'dynamodb-geo-v3';
import ngeohash from 'ngeohash';

const TABLE_NAME = process.env['USER_PROFILE_TABLE_NAME']!;
if (!TABLE_NAME) throw new Error("Missing USER_PROFILE_TABLE_NAME environment variable");

// Correct DynamoDB instance (NOT DocumentClient!)
const ddb = new DynamoDB({});
const geoConfig = new ddbGeo.GeoDataManagerConfiguration(ddb, TABLE_NAME);
geoConfig.hashKeyLength = 5;

const geoTableManager = new ddbGeo.GeoDataManager(geoConfig);
const GEO_PRECISION = 7;

export const handler: Schema["mutateUserProfile"]["functionHandler"] = async (event) => {
  const { action, payload: payloadStr } = event.arguments;

  if (!action || !['create', 'update', 'delete', 'onlinePing'].includes(action)) {
    throw new Error("Invalid action.");
  }

  let payload: any;
  try {
    payload = JSON.parse(payloadStr);
  } catch (err) {
    console.error('[mutateUserProfile] Invalid JSON:', err);
    throw new Error("Payload must be valid JSON");
  }

  const { identityId, locationLat, locationLng, userName, surveyAnswers, images } = payload;
  const now = new Date().toISOString();

  if (['create', 'update'].includes(action)) {
    if (!identityId || typeof locationLat !== 'number' || typeof locationLng !== 'number') {
      throw new Error(`identityId, locationLat, and locationLng are required for ${action}`);
    }

    const geohash = ngeohash.encode(locationLat, locationLng, GEO_PRECISION);
    const rangeKey = `${geohash}#${identityId}`;

    await geoTableManager.putPoint({
      RangeKeyValue: { S: rangeKey },
      GeoPoint: { latitude: locationLat, longitude: locationLng },
      PutItemInput: {
        Item: {
          identityId: { S: identityId },
          userName: { S: userName },
          surveyAnswers: { S: JSON.stringify(surveyAnswers) },
          locationLat: { N: locationLat.toString() },
          locationLng: { N: locationLng.toString() },
          geohash: { S: geohash },
          createdAt: { S: new Date().toISOString() },
          updatedAt: { S: new Date().toISOString() }
        }
      }});

    console.info(`✅ [mutateUserProfile] ${action} successful for ${identityId}`);

    return {
      success: true,
      message: `UserProfile ${action}d successfully.`,
      action,
      identityId,
    };
  }

  if (action === 'delete') {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        hashKey: { N: payload.hashKey.toString() },
        rangeKey: { S: payload.rangeKey }
      }
    };

    await ddb.deleteItem(params);
    console.info(`🗑️ [mutateUserProfile] Deleted ${identityId}`);

    return {
      success: true,
      message: "Deleted successfully",
      action,
      identityId
    };
  }

  if (action === 'onlinePing') {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        hashKey: { N: payload.hashKey.toString() },
        rangeKey: { S: payload.rangeKey }
      },
      UpdateExpression: 'set lastOnlineAt = :lo',
      ExpressionAttributeValues: {
        ':lo': { S: new Date().toISOString() }
      }
    };

    await ddb.updateItem(params);
    console.info(`✅ [mutateUserProfile] Online ping updated for ${identityId}`);

    return {
      success: true,
      message: "OnlinePing successful",
      action: 'onlinePing',
      identityId
    };
  }

  console.error("❌ [mutateUserProfile] Invalid action provided");
  throw new Error("Invalid action");
};