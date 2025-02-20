import type { Schema } from '../../data/resource';
import AWS from 'aws-sdk';
import ngeohash from 'ngeohash';

const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env['USER_PROFILE_TABLE_NAME'] || '';

if (!TABLE_NAME || TABLE_NAME.length === 0) {
  console.error("ERROR: USER_PROFILE_TABLE_NAME is not set!");
  throw new Error("Missing environment variable: USER_PROFILE_TABLE_NAME");
}

/**
 * Converts degrees to radians.
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Haversine formula to calculate the great-circle distance between two points.
 */
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Determines appropriate geohash precision based on the search radius.
 */
function getGeohashPrecision(radius: number): number {
  if (typeof radius !== 'number' || radius <= 0) return 5; // Default precision
  if (radius <= 5) return 7;   // 150m precision
  if (radius <= 10) return 6;  // 1.2km precision
  if (radius <= 20) return 5;  // 4.8km precision
  return 4;                    // 39km precision (for 20-50 miles)
}

/**
 * Queries DynamoDB for users within a specific geohash.
 */
async function queryGeohash(geohash: string, nextToken?: string) {
  const safeNextToken = nextToken ?? undefined; // ✅ Fix TypeScript issue

  const params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName: TABLE_NAME,
    IndexName: 'userProfilesByGeohashAndRangeKey',
    KeyConditionExpression: 'geohash = :hash',
    ExpressionAttributeValues: { ':hash': geohash },
    Limit: 20, // Only fetch what we need
    ExclusiveStartKey: safeNextToken ? JSON.parse(safeNextToken) : undefined,
  };

  console.log(`Querying DynamoDB for geohash: ${geohash}`);
  console.log("Query Params:", JSON.stringify(params, null, 2));

  try {
    return await docClient.query(params).promise();
  } catch (error) {
    console.error(`DynamoDB Query Error for geohash ${geohash}:`, error);
    return { Items: [], LastEvaluatedKey: null };
  }
}

export const handler: Schema["findNearbyUsers"]["functionHandler"] = async (event) => {
  const { lat, lng, radius, nextToken } = event.arguments;

  console.log("Input Parameters:", { lat, lng, radius, nextToken });

  if (typeof lat !== 'number' || typeof lng !== 'number' || typeof radius !== 'number') {
    throw new Error("lat, lng, and radius must be numbers");
  }
  if (radius < 1 || radius > 50) {
    throw new Error("Radius must be between 1 and 50 miles");
  }

  const precision = getGeohashPrecision(radius);
  console.log(`Determined geohash precision: ${precision}`);

  const centerHash = ngeohash.encode(lat, lng, precision);
  console.log(`Computed center geohash: ${centerHash}`);

  let allUsers: any[] = [];

  // ✅ Step 1: Query the center geohash first
  let result = await queryGeohash(centerHash, nextToken ?? undefined);
  allUsers = result.Items || [];

  console.log(`Users found in center geohash ${centerHash}:`, allUsers.length);

  // ✅ Step 2: If < 10 results, expand to neighboring geohashes
  if (allUsers.length < 10) {
    const neighborHashes = ngeohash.neighbors(centerHash);
    console.log("Expanding search to neighboring geohashes:", neighborHashes);

    for (const geohash of neighborHashes) {
      if (allUsers.length >= 10) break; // Stop if we have enough users

      let neighborResult = await queryGeohash(geohash);
      allUsers = allUsers.concat(neighborResult.Items || []);
      console.log(`Users found in geohash ${geohash}:`, neighborResult.Items?.length || 0);
    }
  }

  console.log(`Total users before filtering: ${allUsers.length}`);

  // ✅ Step 3: Apply Haversine Distance Filtering
  const filteredUsers = allUsers.map(user => {
    const distance = haversine(lat, lng, user.locationLat, user.locationLng);
    console.log(`User ${user.identityId} is ${distance.toFixed(2)} miles away`);
    return { ...user, distance };
  }).filter(user => user.distance <= radius);

  console.log(`Filtered Users (within ${radius} miles):`, filteredUsers.length);

  return JSON.stringify({
    nearbyUsers: filteredUsers.slice(0, 20), // ✅ Return only 20 users max
    nextToken: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null,
  });
};