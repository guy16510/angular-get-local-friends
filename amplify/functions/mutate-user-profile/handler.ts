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

function extractProfileAttributes(surveyAnswers: any[]) {
  const get = (id: number) =>
    surveyAnswers
      .filter(q => q.questionId === id)
      .map(q => q.answer);

  const single = (id: number) => get(id)[0]; // For multiple-choice, true/false, etc.

  const ageRange = single(1);
  const desiredFriendAgeRanges = get(2); // multi-select
  const gender = single(3);
  const genderFriendPreference = single(4);
  const hasKids = single(5) === 'Yes' || single(5) === 'Expecting';
  const wantsFriendsWithKids = single(6) === 'Yes';
  const childAgeGroups = get(7); // multi-select
  const wantsSimilarChildAges = single(8) === true || single(8) === 'true';

  return {
    ageRange,
    desiredFriendAgeRanges,
    gender,
    genderFriendPreference,
    hasKids,
    wantsFriendsWithKids,
    childAgeGroups,
    wantsSimilarChildAges,
  };
}


function addIf<T>(obj: Record<string, any>, key: string, value: T | undefined, transformer: (v: T) => any) {
  if (value !== undefined) {
    obj[key] = transformer(value);
  }
}

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
    if (typeof locationLat !== "number" || typeof locationLng !== "number") {
      throw new Error("locationLat and locationLng are required and must be numbers");
    }

    const rangeKey = `geo#${userId}`;
    const traits = extractProfileAttributes(surveyAnswers);

    const item: Record<string, any> = {
      identityId: { S: userId },
      userName: { S: userName },
      surveyAnswers: { S: JSON.stringify(surveyAnswers) },
      images: { S: JSON.stringify(images) },
      hasKids: { BOOL: traits.hasKids },
      wantsFriendsWithKids: { BOOL: traits.wantsFriendsWithKids },
      wantsSimilarChildAges: { BOOL: traits.wantsSimilarChildAges },
      createdAt: { S: now },
      updatedAt: { S: now },
    };

    addIf(item, 'ageRange', traits.ageRange, v => ({ S: v }));
    addIf(item, 'gender', traits.gender, v => ({ S: v }));
    addIf(item, 'genderFriendPreference', traits.genderFriendPreference, v => ({ S: v }));
    addIf(item, 'desiredFriendAgeRanges', traits.desiredFriendAgeRanges, v => ({ S: JSON.stringify(v) }));
    addIf(item, 'childAgeGroups', traits.childAgeGroups, v => ({ S: JSON.stringify(v) }));
    
    await geoTableManager.putPoint({
      RangeKeyValue: { S: rangeKey },
      GeoPoint: { latitude: locationLat, longitude: locationLng },
      PutItemInput: {
        Item: item,
      },
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