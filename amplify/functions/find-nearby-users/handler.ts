import type { Schema } from '../../data/resource';
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
  const R = 3958.8;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Always use precision 7 (~150m) for best accuracy.
 */
const GEOHASH_PRECISION = 7;

/**
 * Query DynamoDB for a given geohash and nextToken for pagination
 */
async function queryGeohash(geohash: string, nextToken?: AWS.DynamoDB.DocumentClient.Key) {
  const params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName: TABLE_NAME,
    IndexName: 'userProfilesByGeohashAndRangeKey',
    KeyConditionExpression: 'geohash = :hash',
    ExpressionAttributeValues: { ':hash': geohash },
    Limit: 25,
    ExclusiveStartKey: nextToken,
  };

  console.log(`📌 Querying DynamoDB geohash: ${geohash}`, params);

  try {
    return await docClient.query(params).promise();
  } catch (error: any) {
    console.error(`❌ DynamoDB Query Error (${geohash}):`, error);
    throw new Error(error.message);
  }
}

export const handler: Schema["findNearbyUsers"]["functionHandler"] = async (event) => {
  const { lat, lng, radius, nextToken } = event.arguments;

  console.log("📌 Input parameters:", { lat, lng, radius, nextToken });

  if ([lat, lng, radius].some(param => typeof param !== 'number')) {
    throw new Error("lat, lng, and radius must be numbers");
  }

  if (radius < 1 || radius > 50) {
    throw new Error("Radius must be between 1 and 50 miles");
  }

  const centerHash = ngeohash.encode(lat, lng, GEOHASH_PRECISION);
  const hashesToQuery = [centerHash, ...ngeohash.neighbors(centerHash)];

  let allUsers: any[] = [];
  let evaluatedKeys: { [hash: string]: AWS.DynamoDB.DocumentClient.Key | undefined } = {};

  // Decode incoming pagination token if present
  const paginationState = nextToken ? JSON.parse(nextToken) : {};
  evaluatedKeys = paginationState.evaluatedKeys || {};

  try {
    for (const hash of hashesToQuery) {
      const exclusiveStartKey = evaluatedKeys[hash];

      const result = await queryGeohash(hash, exclusiveStartKey);
      evaluatedKeys[hash] = result.LastEvaluatedKey;

      allUsers.push(...(result.Items || []));
      console.log(`✅ Found ${result.Items?.length || 0} users in geohash ${hash}`);

      if (allUsers.length >= 20) break; // Fetch at most 20 results per page
    }

    // Filter precisely by haversine distance
    const filteredUsers = allUsers
      .map(user => {
        const distance = haversine(lat, lng, user.locationLat, user.locationLng);
        return {
          ...user,
          distance: distance >= 5 ? `${distance.toFixed(1)} miles` : '< 5 miles',
          actualDistance: distance // ✅ store privately for internal sorting only
        };
      })
      .filter(user => user.actualDistance <= radius)
      .sort((a, b) => a.actualDistance - b.actualDistance)
      .slice(0, 25); // use previously recommended limit

    // Prepare the nextToken for pagination (if there are more results)
    const hasMoreResults = Object.values(evaluatedKeys).some(key => !!key);
    const newNextToken = hasMoreResults
      ? JSON.stringify({ evaluatedKeys })
      : null;

    console.log(`✅ Users returned after filtering: ${filteredUsers.length}`);
    console.log(`📌 Next token for pagination: ${newNextToken}`);

    return JSON.stringify({
      success: true,
      nearbyUsers: filteredUsers,
      nextToken: newNextToken,
    });
  } catch (error: any) {
    console.error("❌ Unexpected Error in handler:", error);
    return JSON.stringify({
      success: false,
      error: error.message,
    });
  }
};