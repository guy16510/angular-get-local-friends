// import type { Handler } from 'aws-lambda';
import type { Schema } from '../../data/resource';
import AWS from 'aws-sdk';
import ngeohash from 'ngeohash';

const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env['USER_PROFILE_TABLE_NAME'] || 
  `UserProfile-${process.env['AMPLIFY_PROJECT_ID']}-${process.env['AMPLIFY_ENV']}-NONE`;

if (!TABLE_NAME) {
  console.error("ERROR: USER_PROFILE_TABLE_NAME is not set!");
  throw new Error("Missing environment variable: USER_PROFILE_TABLE_NAME");
}


/**
 * Use low geohash precision to minimize cost and complexity.
 * (No extra distance filtering is done since you don’t care about precision.)
 */
function getGeohashPrecision(radius: number): number {
  return radius <= 3 ? 6 : 5;
}

export const handler: Schema["findNearbyUsers"]["functionHandler"] = async (event) => {
  const { lat, lng, radius, nextToken } = event.arguments;

  if (typeof lat !== 'number' || typeof lng !== 'number' || typeof radius !== 'number') {
    throw new Error("lat, lng, and radius must be numbers");
  }
  if (radius < 1 || radius > 5) {
    throw new Error("Radius must be between 1 and 5 miles");
  }

  const precision = getGeohashPrecision(radius);
  const centerHash = ngeohash.encode(lat, lng, precision);

  // Use a simple begins_with query on the secondary index (named "geohash")
  const params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName: TABLE_NAME,
    IndexName: 'geohash',
    KeyConditionExpression: 'begins_with(geohash, :hash)',
    ExpressionAttributeValues: {
      ':hash': centerHash,
    },
    Limit: 10, // adjust page size as needed
    ExclusiveStartKey: nextToken ? JSON.parse(nextToken) : undefined,
  };

  const result = await docClient.query(params).promise();

  // Build the response object
  const response = {
    nearbyUsers: result.Items || [],
    nextToken: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null,
  };

  // Return the response as a JSON string.
  return JSON.stringify(response);
};