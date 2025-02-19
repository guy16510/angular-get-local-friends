import type { Schema } from '../../data/resource';
import AWS from 'aws-sdk';
import ngeohash from 'ngeohash';

const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env['USER_PROFILE_TABLE_NAME'] || null;

if (!TABLE_NAME) {
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
  if (radius <= 3) return 7;
  if (radius <= 10) return 6;
  if (radius <= 25) return 5;
  return 4; // Larger area for 25-100mi searches
}

export const handler: Schema["findNearbyUsers"]["functionHandler"] = async (event) => {
  const { lat, lng, radius, nextToken } = event.arguments;

  if (typeof lat !== 'number' || typeof lng !== 'number' || typeof radius !== 'number') {
    throw new Error("lat, lng, and radius must be numbers");
  }
  if (radius < 1 || radius > 100) {
    throw new Error("Radius must be between 1 and 100 miles");
  }

  // ✅ Adjust geohash precision based on radius
  const precision = getGeohashPrecision(radius);
  const centerHash = ngeohash.encode(lat, lng, precision);
  console.log(`Computed centerHash: ${centerHash} (Precision: ${precision})`);

  // ✅ Query by geohash only
  const params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName: TABLE_NAME,
    IndexName: 'userProfilesByGeohashAndRangeKey', // Ensure this index exists
    KeyConditionExpression: 'geohash = :hash',
    ExpressionAttributeValues: {
      ':hash': centerHash,
    },
    Limit: 50, // Fetch more results for better filtering
    ExclusiveStartKey: nextToken ? JSON.parse(nextToken) : undefined,
  };

  console.log("DynamoDB Query Params:", JSON.stringify(params, null, 2));

  try {
    const result = await docClient.query(params).promise();
    console.log("Raw DynamoDB Query Result:", JSON.stringify(result, null, 2));

    // ✅ Apply Haversine filter and add distance to each user
    const filteredUsers = (result.Items || []).map(user => {
      const distance = haversine(lat, lng, user['locationLat'], user['locationLng']);
      return { ...user, distance }; // Include distance in response
    }).filter(user => user.distance <= radius);

    console.log(`Filtered Users (within ${radius} miles):`, filteredUsers.length);

    // ✅ Build response with distance included
    return JSON.stringify({
      nearbyUsers: filteredUsers,
      nextToken: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null,
    });

  } catch (error) {
    console.error("DynamoDB Query Error:", error);
    throw new Error("Failed to query nearby users.");
  }
};