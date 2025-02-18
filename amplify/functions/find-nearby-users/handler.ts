// import type { Handler } from 'aws-lambda';
import type { Schema } from '../../data/resource';
import AWS from 'aws-sdk';
import ngeohash from 'ngeohash';

// Initialize AWS Services
const docClient = new AWS.DynamoDB.DocumentClient();
const cloudwatch = new AWS.CloudWatchLogs({ region: process.env['AWS_REGION'] || 'us-east-1' });

// Construct table name dynamically
const TABLE_NAME = process.env['USER_PROFILE_TABLE_NAME'] || 
  `UserProfile-${process.env['AMPLIFY_PROJECT_ID']}-${process.env['AMPLIFY_ENV']}-NONE`;

if (!TABLE_NAME) {
  console.error("ERROR: USER_PROFILE_TABLE_NAME is not set!");
  throw new Error("Missing environment variable: USER_PROFILE_TABLE_NAME");
}

/**
 * Determine geohash precision based on radius.
 */
function getGeohashPrecision(radius: number): number {
  return radius <= 3 ? 6 : 5;
}

/**
 * Log event data and CloudWatch logs.
 */
async function logToCloudWatch(logGroup: string, message: any) {
  try {
    const logStream = `${new Date().toISOString().split('T')[0]}-stream`;

    // Ensure log group exists
    await cloudwatch.createLogGroup({ logGroupName: logGroup }).promise().catch(() => {});

    // Ensure log stream exists
    await cloudwatch.createLogStream({ logGroupName: logGroup, logStreamName: logStream }).promise().catch(() => {});

    // Put log event
    await cloudwatch.putLogEvents({
      logGroupName: logGroup,
      logStreamName: logStream,
      logEvents: [
        {
          timestamp: Date.now(),
          message: JSON.stringify(message, null, 2),
        },
      ],
    }).promise();
  } catch (error) {
    console.error("CloudWatch Logging Error:", error);
  }
}

export const handler: Schema["findNearbyUsers"]["functionHandler"] = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));
  await logToCloudWatch("/aws/lambda/findNearbyUsers", { event });

  const { lat, lng, radius, nextToken } = event.arguments;

  if (typeof lat !== 'number' || typeof lng !== 'number' || typeof radius !== 'number') {
    console.error("Validation Error: lat, lng, and radius must be numbers");
    throw new Error("lat, lng, and radius must be numbers");
  }
  if (radius < 1 || radius > 5) {
    console.error("Validation Error: Radius must be between 1 and 5 miles");
    throw new Error("Radius must be between 1 and 5 miles");
  }

  const precision = getGeohashPrecision(radius);
  const centerHash = ngeohash.encode(lat, lng, precision);
  console.log("Calculated Geohash:", centerHash);

  // Query parameters for DynamoDB
  const params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName: TABLE_NAME,
    IndexName: 'geohash',
    KeyConditionExpression: 'begins_with(geohash, :hash)',
    ExpressionAttributeValues: {
      ':hash': centerHash,
    },
    Limit: 10,
    ExclusiveStartKey: nextToken ? JSON.parse(nextToken) : undefined,
  };

  try {
    console.log("DynamoDB Query Params:", JSON.stringify(params, null, 2));
    await logToCloudWatch("/aws/lambda/findNearbyUsers", { queryParams: params });

    const result = await docClient.query(params).promise();
    console.log("DynamoDB Query Result:", JSON.stringify(result, null, 2));
    await logToCloudWatch("/aws/lambda/findNearbyUsers", { queryResult: result });

    const response = {
      nearbyUsers: result.Items || [],
      nextToken: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null,
    };

    console.log("Response:", JSON.stringify(response, null, 2));
    await logToCloudWatch("/aws/lambda/findNearbyUsers", { response });

    return JSON.stringify(response);
  } catch (error) {
    console.error("DynamoDB Query Error:", error);
    await logToCloudWatch("/aws/lambda/findNearbyUsers", { error });
    throw new Error("Failed to fetch nearby users");
  }
};