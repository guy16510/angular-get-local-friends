import type { Schema } from '../../data/resource';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import * as ddbGeo from 'dynamodb-geo-v3';

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

  const { identityId, locationLat, locationLng, userName, surveyAnswers = [], images = [] } = payload;
  const now = new Date().toISOString();

  if (['create', 'update'].includes(action)) {
    if (!identityId || typeof locationLat !== 'number' || typeof locationLng !== 'number') {
      throw new Error("identityId, locationLat, and locationLng required");
    }

    const rangeKey = `geo#${identityId}`;

    await geoTableManager.putPoint({
      RangeKeyValue: { S: rangeKey },
      GeoPoint: { latitude: locationLat, longitude: locationLng },
      PutItemInput: {
        Item: {
          identityId: { S: identityId },
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

    console.log(`✅ [mutateUserProfile] ${action} successful for ${identityId}`);
    return { success: true, message: `UserProfile ${action}d`, action, identityId };
  }

  if (action === 'delete') {
    await geoTableManager.deletePoint({
      RangeKeyValue: { S: payload.rangeKey },
      GeoPoint: { latitude: payload.locationLat, longitude: payload.locationLng }
    });
    return { success: true, message: "Deleted", action, identityId };
  }

  if (action === 'onlinePing') {
    await ddb.updateItem({
      TableName: TABLE_NAME,
      Key: {
        hashKey: { N: payload.hashKey.toString() },
        rangeKey: { S: payload.rangeKey }
      },
      UpdateExpression: 'SET lastOnlineAt = :lo',
      ExpressionAttributeValues: { ':lo': { S: now } }
    });
    return { success: true, message: "Pinged", action, identityId };
  }

  throw new Error("Unhandled action");
};