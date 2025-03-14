import type { AppSyncResolverHandler } from 'aws-lambda';
import AWS from 'aws-sdk';
import ngeohash from 'ngeohash';

const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env['USER_PROFILE_TABLE_NAME'] || '';

if (!TABLE_NAME) {
  console.error("ERROR: USER_PROFILE_TABLE_NAME is not set!");
  throw new Error("Missing environment variable: USER_PROFILE_TABLE_NAME");
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function calculateGeohashPrecision(radiusInMiles: number): number {
  const radiusInKm = radiusInMiles * 1.60934;
  if (radiusInKm >= 2500) return 1;
  if (radiusInKm >= 630) return 2;
  if (radiusInKm >= 78) return 3;
  if (radiusInKm >= 20) return 4;
  if (radiusInKm >= 2.4) return 5;
  if (radiusInKm >= 0.6) return 6;
  if (radiusInKm >= 0.076) return 7;
  return 8;
}

async function queryGeohash(geohash: string, nextToken?: AWS.DynamoDB.DocumentClient.Key) {
  const params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName: TABLE_NAME,
    IndexName: 'userProfilesByGeohashAndRangeKey',
    KeyConditionExpression: 'geohash = :hash',
    ExpressionAttributeValues: { ':hash': geohash },
    Limit: 35,
    ExclusiveStartKey: nextToken,
  };
  return docClient.query(params).promise();
}

export const handler: AppSyncResolverHandler<any, any> = async (event) => {
  const { lat, lng, radius, nextToken, identityId } = event.arguments;

  if ([lat, lng, radius].some(param => typeof param !== 'number')) {
    throw new Error("lat, lng, and radius must be numbers");
  }

  if (radius < 1 || radius > 50) {
    throw new Error("Radius must be between 1 and 50 miles");
  }

  const precision = calculateGeohashPrecision(radius);
  const centerHash = ngeohash.encode(lat, lng, precision);
  const hashesToQuery = new Set([centerHash, ...ngeohash.neighbors(centerHash)]);

  let allUsers: any[] = [];
  const paginationState = nextToken ? JSON.parse(nextToken) : {};
  const evaluatedKeys: { [hash: string]: AWS.DynamoDB.DocumentClient.Key | undefined } = paginationState.evaluatedKeys || {};

  try {
    for (const hash of hashesToQuery) {
      const exclusiveStartKey = evaluatedKeys[hash];
      const result = await queryGeohash(hash, exclusiveStartKey);
      evaluatedKeys[hash] = result.LastEvaluatedKey;
      allUsers.push(...(result.Items || []));
      if (allUsers.length >= 50) break;
    }

    const filteredUsers = allUsers
      .filter(user => {
        if (user.identityId === identityId) return false; // Exclude current user
        if (typeof user.locationLat !== 'number' || typeof user.locationLng !== 'number') return false;
        const distance = haversine(lat, lng, user.locationLat, user.locationLng);
        user.distance = distance >= 5 ? `${distance.toFixed(1)} miles` : '< 5 miles';
        user.actualDistance = distance;
        return distance <= radius;
      })
      .sort((a, b) => a.actualDistance - b.actualDistance)
      .slice(0, 25);

    const hasMoreResults = Object.values(evaluatedKeys).some(key => !!key);
    const newNextToken = hasMoreResults ? JSON.stringify({ evaluatedKeys }) : null;

    return {
      id: "nearbyUsersResponse",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      success: true,
      error: null,
      nearbyUsers: filteredUsers,
      nextToken: newNextToken,
    };
  } catch (error: any) {
    console.error("❌ Unexpected Error in handler:", error);
    return {
      id: "nearbyUsersResponse",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      success: false,
      error: error.message,
      nearbyUsers: [],
      nextToken: null,
    };
  }
};