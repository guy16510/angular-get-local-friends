import type { Schema } from '../../data/resource';
import type { AppSyncIdentityCognito } from 'aws-lambda';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import * as ddbGeo from 'dynamodb-geo-v3';

const ddb = new DynamoDB({});
const TABLE_NAME = process.env['USER_PROFILE_TABLE_NAME']!;
if (!TABLE_NAME) throw new Error("Missing environment variable: USER_PROFILE_TABLE_NAME");

const config = new ddbGeo.GeoDataManagerConfiguration(ddb, TABLE_NAME);
config.hashKeyLength = 5;
const geoTableManager = new ddbGeo.GeoDataManager(config);

interface NearbyUser {
  identityId: string;
  locationLat: number;
  locationLng: number;
  userName?: string;
  surveyAnswers?: any;
  geohash?: string;
  distance?: string;
  actualDistance?: number;
  [key: string]: any;
}

export const handler: Schema["findNearbyUsers"]["functionHandler"] = async (event) => {
  const { lat, lng, radius, nextToken } = event.arguments;

  let identityId: string;
  if (event.identity && 'username' in event.identity) {
    identityId = (event.identity as AppSyncIdentityCognito).username;
  } else if (event.arguments.identityId) {
    identityId = event.arguments.identityId;
  } else {
    throw new Error('IdentityId is missing from event');
  }

  console.info('🔍 [findNearbyUsers] Query:', { lat, lng, radius, identityId, nextToken });

  try {
    const radiusInMeters = radius * 1609.34;

    // Handle nextToken parsing
    const ExclusiveStartKey = nextToken ? JSON.parse(Buffer.from(nextToken, 'base64').toString('utf-8')) : undefined;

    // Perform the Geo Query with pagination
    const results = await geoTableManager.queryRadius({
      RadiusInMeter: radiusInMeters,
      CenterPoint: { latitude: lat, longitude: lng },
      QueryInput: {
        TableName: TABLE_NAME,
        ExclusiveStartKey,
        Limit: 50 // DynamoDB pagination limit
      }
    });

    console.info(`[findNearbyUsers] Dynamo results count:`, results.length);

    const items = results.map(item => unmarshall(item)) as NearbyUser[];

    const filteredUsers = items
      .filter(user => user.identityId !== identityId)
      .map(user => {
        const distance = haversine(lat, lng, user.locationLat, user.locationLng);
        return {
          ...user,
          actualDistance: distance,
          distance: distance >= 5 ? `${distance.toFixed(1)} miles` : '< 5 miles',
        };
      })
      .sort((a, b) => a.actualDistance - b.actualDistance)
      .slice(0, 25);

    const lastEvaluatedKeyRaw = (results as any).LastEvaluatedKey;
    const lastEvaluatedKey = lastEvaluatedKeyRaw
      ? Buffer.from(JSON.stringify(lastEvaluatedKeyRaw)).toString('base64')
      : null;

    console.info(`✅ [findNearbyUsers] Found ${filteredUsers.length} users`);

    return {
      id: "nearbyUsersResponse",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      success: true,
      error: null,
      nearbyUsers: filteredUsersWithoutActualDistance(filteredUsers),
      nextToken: lastEvaluatedKey,
    };

  } catch (error: any) {
    console.error("❌ [findNearbyUsers] Error:", error);
    return {
      id: "nearbyUsersResponse",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      success: false,
      error: "Internal error occurred",
      nearbyUsers: [],
      nextToken: null,
    };
  }
};

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const toRad = (d: number) => d * (Math.PI / 180);
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function filteredUsersWithoutActualDistance(users: NearbyUser[]): Omit<NearbyUser, 'actualDistance'>[] {
  return users.map(({ actualDistance, ...user }) => user);
}