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
  if (radius <= 5) return 7;   // 150m precision
  if (radius <= 10) return 6;  // 1.2km precision
  if (radius <= 20) return 5;  // 4.8km precision
  return 4;                    // 39km precision (for 20-50 miles)
}

/**
 * Expands geohashes within the search radius.
 */
function getGeohashesInRadius(lat: number, lng: number, precision: number): string[] {
  const centerHash = ngeohash.encode(lat, lng, precision);
  const neighbors = ngeohash.neighbors(centerHash);
  
  // ✅ Also include center geohash in the search
  neighbors.push(centerHash);
  
  console.log(`Computed Geohashes (Precision: ${precision}):`, neighbors);
  return neighbors;
}
interface UserProfile {
  userId: string;
  locationLat: number;
  locationLng: number;
  geohash: string;
  rangeKey: string;
  distance?: number;
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

  // ✅ Compute geohashes based on radius
  const precision = getGeohashPrecision(radius);
  console.log(`Determined geohash precision: ${precision}`);

  const geohashes = getGeohashesInRadius(lat, lng, precision);

  // ✅ Build query conditions for multiple geohashes
  const filterExpressionParts = geohashes.map((_, index) => `geohash = :hash${index}`);
  const expressionAttributeValues = geohashes.reduce((acc, hash, index) => {
    acc[`:hash${index}`] = hash;
    return acc;
  }, {} as Record<string, string>);

  console.log("Generated DynamoDB Query Parameters:", {
    filterExpressionParts,
    expressionAttributeValues
  });

  // ✅ Query DynamoDB
  const params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName: TABLE_NAME,
    IndexName: 'userProfilesByGeohashAndRangeKey', // Ensure this index exists
    KeyConditionExpression: filterExpressionParts.join(" OR "),
    ExpressionAttributeValues: expressionAttributeValues,
    Limit: 100, // Increased for better coverage
    ExclusiveStartKey: nextToken ? JSON.parse(nextToken) : undefined,
  };

  console.log("DynamoDB Query Params:", JSON.stringify(params, null, 2));

  try {
    const result = await docClient.query(params).promise();
    console.log("Raw DynamoDB Query Result:", JSON.stringify(result, null, 2));

    // ✅ Apply Haversine filtering and return distance in response
    const filteredUsers = (result.Items as UserProfile[] || []).map(user => {
      const distance = haversine(lat, lng, user.locationLat, user.locationLng);
      console.log(`User ${user.userId} distance: ${distance.toFixed(2)} miles`);
      return { ...user, distance };
    }).filter(user => {
      const withinRadius = user.distance !== undefined && user.distance <= radius;
      console.log(`User ${user.userId} is ${withinRadius ? "within" : "outside"} ${radius} miles`);
      return withinRadius;
    });

    console.log(`Filtered Users (within ${radius} miles):`, filteredUsers.length);

    return JSON.stringify({
      nearbyUsers: filteredUsers,
      nextToken: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null,
    });

  } catch (error) {
    console.error("DynamoDB Query Error:", error);
    throw new Error("Failed to query nearby users.");
  }
};