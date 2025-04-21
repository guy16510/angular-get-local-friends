import type { Schema } from '../../data/resource';
import AWS from 'aws-sdk';
import ngeohash from 'ngeohash';

const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env['USER_PROFILE_TABLE_NAME'] || '';

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
  if (radius <= 5) return 7;   // ~150m precision
  if (radius <= 10) return 6;  // ~1.2km precision
  if (radius <= 20) return 5;  // ~4.8km precision
  return 4;                    // ~39km precision
}

/**
 * Queries DynamoDB for users within a specific geohash.
 */
async function queryGeohash(geohash: string, nextToken?: string) {
  const safeNextToken = nextToken ?? undefined;

  const params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName: TABLE_NAME,
    IndexName: 'userProfilesByGeohashAndRangeKey',
    KeyConditionExpression: 'geohash = :hash',
    ExpressionAttributeValues: { ':hash': geohash },
    Limit: 20,
    ExclusiveStartKey: safeNextToken ? JSON.parse(safeNextToken) : undefined,
  };

  try {
    return await docClient.query(params).promise();
  } catch (error) {
    console.error(`DynamoDB Query Error for geohash ${geohash}:`, error);
    return { Items: [], LastEvaluatedKey: null };
  }
}

/**
 * Computes match score based on survey answer overlap.
 */
function computeMatchScore(userAnswers: any, filterAnswers: any[]): number {
  if (!Array.isArray(filterAnswers) || filterAnswers.length === 0) return 0;
  if (!userAnswers || typeof userAnswers !== 'object') return 0; // Handle missing answers

  let totalPossibleMatches = 0;
  let totalActualMatches = 0;

  for (const filter of filterAnswers) {
    const userResponse = userAnswers[filter.questionId];
    
    if (userResponse) {
      totalPossibleMatches++;

      if (Array.isArray(userResponse)) {
        // Multi-select: Score based on overlap
        const matchCount = userResponse.filter(ans => filter.answer.includes(ans)).length;
        totalActualMatches += matchCount / filter.answer.length;
      } else {
        // Single-choice: Exact match
        if (filter.answer.includes(userResponse)) {
          totalActualMatches++;
        }
      }
    }
  }

  return (totalActualMatches / totalPossibleMatches) * 100; // Return percentage match
}

export const handler: Schema["findPremiumMatches"]["functionHandler"] = async (event) => {
  const { lat, lng, radius, surveyFilter, nextToken } = event.arguments;

  console.log("Input Parameters:", { lat, lng, radius, surveyFilter, nextToken });

  if (typeof lat !== 'number' || typeof lng !== 'number' || typeof radius !== 'number') {
    throw new Error("lat, lng, and radius must be numbers");
  }
  if (radius < 1 || radius > 50) {
    throw new Error("Radius must be between 1 and 50 miles");
  }

  if (!Array.isArray(surveyFilter)) {
    throw new Error("surveyFilter must be an array of { questionId, answer: string[] } objects.");
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

  // ✅ Step 2: Expand search only if needed
  if (allUsers.length < 10) {
    const neighborHashes = ngeohash.neighbors(centerHash);
    console.log("Expanding search to neighboring geohashes:", neighborHashes);

    for (const geohash of neighborHashes) {
      if (allUsers.length >= 10) break;

      let neighborResult = await queryGeohash(geohash);
      allUsers = allUsers.concat(neighborResult.Items || []);
      console.log(`Users found in geohash ${geohash}:`, neighborResult.Items?.length || 0);
    }
  }

  console.log(`Total users before filtering: ${allUsers.length}`);

  // ✅ Step 3: Apply Haversine Distance Filtering
  const filteredUsers = allUsers
    .map(user => ({
      ...user,
      distance: haversine(lat, lng, user.locationLat, user.locationLng)
    }))
    .filter(user => user.distance <= radius);

  console.log(`Filtered Users (within ${radius} miles):`, filteredUsers.length);

  // ✅ Step 4: Apply Survey-Based Matching (Premium Feature)
  const scoredUsers = filteredUsers
    .map(user => ({
      ...user,
      matchScore: computeMatchScore(user.surveyAnswers, surveyFilter)
    }))
    .filter(user => user.matchScore > 0);

  // ✅ Step 5: Sort users by match score
  const sortedUsers = scoredUsers.sort((a, b) => b.matchScore - a.matchScore);

  console.log(`Final matched users: ${sortedUsers.length}`);

  return JSON.stringify({
    premiumMatches: sortedUsers.slice(0, 20), // ✅ Return only 20 users max
    nextToken: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null,
  });
};

/**
 * TODO add blocked uesrs, and addtional enhancements here.
 */