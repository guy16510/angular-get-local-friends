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

export const handler: Schema["findNearbyUsers"]["functionHandler"] = async (event) => {
  const { lat, lng, radius, nextToken } = event.arguments;

  if (typeof lat !== 'number' || typeof lng !== 'number' || typeof radius !== 'number') {
    throw new Error("lat, lng, and radius must be numbers");
  }
  if (radius < 1 || radius > 5) {
    throw new Error("Radius must be between 1 and 5 miles");
  }

  // ✅ Force geohash precision to match stored values (7)
  const precision = 7;
  const centerHash = ngeohash.encode(lat, lng, precision);
  console.log("Computed centerHash:", centerHash);

  // ✅ Query only by geohash (remove faulty rangeKey filtering)
  const params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName: TABLE_NAME,
    IndexName: 'userProfilesByGeohashAndRangeKey', // Ensure this index exists
    KeyConditionExpression: 'geohash = :hash',
    ExpressionAttributeValues: {
      ':hash': centerHash,
    },
    Limit: 20, // Increased limit to fetch more potential results
    ExclusiveStartKey: nextToken ? JSON.parse(nextToken) : undefined,
  };

  console.log("DynamoDB Query Params:", JSON.stringify(params, null, 2));

  try {
    const result = await docClient.query(params).promise();
    console.log("Raw DynamoDB Query Result:", JSON.stringify(result, null, 2));

    // ✅ Apply Haversine filter to refine results
    const filteredUsers = (result.Items || []).filter(user =>
      haversine(lat, lng, user['locationLat'], user['locationLng']) <= radius
    );

    console.log(`Filtered Users (within ${radius} miles):`, filteredUsers.length);

    // ✅ Build response
    return JSON.stringify({
      nearbyUsers: filteredUsers,
      nextToken: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null,
    });

  } catch (error) {
    console.error("DynamoDB Query Error:", error);
    throw new Error("Failed to query nearby users.");
  }
};