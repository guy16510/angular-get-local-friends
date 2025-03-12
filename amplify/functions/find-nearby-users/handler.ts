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
  const R = 3958.8;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

const GEOHASH_PRECISION = 7;

async function queryGeohash(geohash: string, nextToken?: AWS.DynamoDB.DocumentClient.Key) {
  const params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName: TABLE_NAME,
    IndexName: 'userProfilesByGeohashAndRangeKey',
    KeyConditionExpression: 'geohash = :hash',
    ExpressionAttributeValues: { ':hash': geohash },
    Limit: 25,
    ExclusiveStartKey: nextToken,
  };

  try {
    return await docClient.query(params).promise();
  } catch (error: any) {
    console.error(`❌ DynamoDB Query Error (${geohash}):`, error);
    throw new Error(error.message);
  }
}

// Fix: Use AppSyncResolverHandler with the correct return type

export const handler: AppSyncResolverHandler<any, any> = async (event) => {
  const { lat, lng, radius, nextToken } = event.arguments;

  if ([lat, lng, radius].some(param => typeof param !== 'number')) {
    throw new Error("lat, lng, and radius must be numbers");
  }

  if (radius < 1 || radius > 50) {
    throw new Error("Radius must be between 1 and 50 miles");
  }

  const centerHash = ngeohash.encode(lat, lng, GEOHASH_PRECISION);
  const hashesToQuery = [centerHash, ...ngeohash.neighbors(centerHash)];

  let allUsers: any[] = [];
  const paginationState = nextToken ? JSON.parse(nextToken) : {};
  const evaluatedKeys: { [hash: string]: AWS.DynamoDB.DocumentClient.Key | undefined } = paginationState.evaluatedKeys || {};

  try {
    for (const hash of hashesToQuery) {
      const exclusiveStartKey = evaluatedKeys[hash];

      const result = await queryGeohash(hash, exclusiveStartKey);
      evaluatedKeys[hash] = result.LastEvaluatedKey;

      allUsers.push(...(result.Items || []));
      if (allUsers.length >= 20) break;
    }

    const filteredUsers = allUsers
      .filter(user => {
        if (typeof user['locationLat'] !== 'number' || typeof user['locationLng'] !== 'number') return false;
        const distance = haversine(lat, lng, user['locationLat'], user['locationLng']);
        user['distance'] = distance >= 5 ? `${distance.toFixed(1)} miles` : '< 5 miles';
        user['actualDistance'] = distance;
        return distance <= radius;
      })
      .sort((a, b) => a.actualDistance - b.actualDistance)
      .slice(0, 25);

    const hasMoreResults = Object.values(evaluatedKeys).some(key => !!key);
    const newNextToken = hasMoreResults ? JSON.stringify({ evaluatedKeys }) : null;

    // Return success with the appropriate format
    return {
      success: true,
      nearbyUsers: filteredUsers,
      nextToken: newNextToken,
    };
  } catch (error: any) {
    console.error("❌ Unexpected Error in handler:", error);
    return {
      success: false,
      error: error.message,
      nearbyUsers: [],   // empty array when there's an error
      nextToken: null    // null or empty string, as defined by your schema
    };
  }
};