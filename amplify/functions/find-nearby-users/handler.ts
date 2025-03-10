import type { Schema } from '../../data/resource';
import AWS from 'aws-sdk';
import ngeohash from 'ngeohash';

const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env['USER_PROFILE_TABLE_NAME'] || '';

if (!TABLE_NAME || TABLE_NAME.length === 0) {
  console.error("ERROR: USER_PROFILE_TABLE_NAME is not set!");
  throw new Error("Missing environment variable: USER_PROFILE_TABLE_NAME");
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function getGeohashPrecision(radius: number): number {
  if (radius <= 5) return 7;
  if (radius <= 10) return 6;
  if (radius <= 20) return 5;
  return 4;
}

async function queryGeohash(geohash: string, nextToken?: string) {
  const params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName: TABLE_NAME,
    IndexName: 'userProfilesByGeohashAndRangeKey',
    KeyConditionExpression: 'geohash = :hash',
    ExpressionAttributeValues: { ':hash': geohash },
    Limit: 10,
    ExclusiveStartKey: nextToken ? JSON.parse(nextToken) : undefined,
  };

  console.log(`📌 Querying DynamoDB with params:`, JSON.stringify(params));

  try {
    return await docClient.query(params).promise();
  } catch (error: any) {
    console.error(`❌ DynamoDB Query Error for geohash ${geohash}:`, error);
    throw new Error(error.message);
  }
}

export const handler: Schema["findNearbyUsers"]["functionHandler"] = async (event) => {
  const { lat, lng, radius, nextToken } = event.arguments;

  console.log("📌 Input parameters:", { lat, lng, radius, nextToken });

  if (typeof lat !== 'number' || typeof lng !== 'number' || typeof radius !== 'number') {
    throw new Error("lat, lng, and radius must be numbers");
  }

  if (radius < 1 || radius > 50) {
    throw new Error("Radius must be between 1 and 50 miles");
  }

  const precision = getGeohashPrecision(radius);
  console.log(`📌 Determined geohash precision: ${precision}`);

  const centerHash = ngeohash.encode(lat, lng, precision);
  console.log(`📌 Computed center geohash: ${centerHash}`);

  let allUsers: any[] = [];

  try {
    let result = await queryGeohash(centerHash, nextToken || undefined);
    allUsers = result.Items || [];

    console.log(`✅ Users found in center geohash ${centerHash}:`, allUsers.length);

    if (allUsers.length < 10) {
      const neighborHashes = ngeohash.neighbors(centerHash);
      console.log("📌 Neighboring geohashes:", neighborHashes);

      for (const geohash of neighborHashes) {
        if (allUsers.length >= 10) break;

        let neighborResult = await queryGeohash(geohash);
        allUsers = allUsers.concat(neighborResult.Items || []);
        console.log(`✅ Users found in neighbor geohash ${geohash}:`, neighborResult.Items?.length || 0);
      }
    }

    const filteredUsers = allUsers.map(user => {
      const distance = haversine(lat, lng, user.locationLat, user.locationLng);
      console.log(`📌 User ${user.identityId} is ${distance.toFixed(2)} miles away`);
      return { ...user, distance };
    }).filter(user => user.distance <= radius);

    console.log(`✅ Filtered users within ${radius} miles:`, filteredUsers.length);

    // Explicitly stringify return
    return JSON.stringify({
      success: true,
      nearbyUsers: filteredUsers.slice(0, 10),
      nextToken: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null,
    });
  } catch (error: any) {
    console.error("❌ Unexpected Error in handler:", error);
    return JSON.stringify({
      success: false,
      error: error.message,
    });
  }
};
