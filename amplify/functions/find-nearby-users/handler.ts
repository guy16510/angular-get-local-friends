import type { Schema } from '../../data/resource';
import type { AppSyncIdentityCognito } from 'aws-lambda';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import ngeohash from 'ngeohash';

const ddb = new DynamoDB({});
const TABLE_NAME = process.env['USER_PROFILE_TABLE_NAME']!;
if (!TABLE_NAME) throw new Error("Missing USER_PROFILE_TABLE_NAME");

const GEOHASH_PRECISION = 5;
const PAGINATION_LIMIT = 50;

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
  const { lat, lng, radius } = event.arguments;

  let identityId: string;
  if (event.identity && 'username' in event.identity) {
    identityId = (event.identity as AppSyncIdentityCognito).username;
  } else if (event.arguments.identityId) {
    identityId = event.arguments.identityId;
  } else {
    throw new Error('IdentityId is missing');
  }

  console.info('🔍 [findNearbyUsers] Query:', { lat, lng, radius, identityId });

  const baseGeohash = ngeohash.encode(lat, lng, GEOHASH_PRECISION);
  const neighbors = ngeohash.neighbors(baseGeohash);
  const geohashPrefixes = [baseGeohash, ...neighbors];

  const ddbResults: NearbyUser[] = [];

  for (const prefix of geohashPrefixes) {
    const queryParams = {
      TableName: TABLE_NAME,
      IndexName: 'geohash-index',
      KeyConditionExpression: 'geohash = :prefix',
      ExpressionAttributeValues: {
        ':prefix': { S: prefix }
      },
      Limit: PAGINATION_LIMIT
    };

    try {
      const result = await ddb.query(queryParams);
      const items: NearbyUser[] = result.Items?.map(item => {
        try {
          return unmarshall(item) as NearbyUser;
        } catch (e) {
          console.error('⚠️ Failed to unmarshall item:', item, e);
          return null;
        }
      }).filter(Boolean) as NearbyUser[] ?? [];
    } catch (err) {
      console.error(`❌ [findNearbyUsers] Failed query for prefix ${prefix}`, err);
    }
  }

  const filteredUsers = ddbResults
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
    .slice(0, 25); // If you still want to cap per response

  console.info(`✅ [findNearbyUsers] Found ${filteredUsers.length} users`);

  return {
    id: "nearbyUsersResponse",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    success: true,
    error: null,
    nearbyUsers: filteredUsersWithoutActualDistance(filteredUsers),
    nextToken: null // Optional: could extend if you want per-prefix paging
  };
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