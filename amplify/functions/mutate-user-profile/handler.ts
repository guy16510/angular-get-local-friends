import type { Handler } from 'aws-lambda';
import type { Schema } from '../../data/resource';
import AWS from 'aws-sdk';
import ngeohash from 'ngeohash';

const docClient = new AWS.DynamoDB.DocumentClient();
// Construct the table name dynamically using bracket notation
const TABLE_NAME = process.env['USER_PROFILE_TABLE_NAME'] || null;

if (!TABLE_NAME || TABLE_NAME.length === 0) {
  console.error("ERROR: USER_PROFILE_TABLE_NAME is not set!");
  throw new Error("Missing environment variable: USER_PROFILE_TABLE_NAME");
}

// Use a fixed precision for simplicity
const GEO_PRECISION = 7;

export const handler: Schema["mutateUserProfile"]["functionHandler"] = async (event) => {
  // Expect a JSON-encoded payload along with an action
  const { action, payload: payloadStr } = event.arguments;
  
  if (!action || !['create', 'update', 'delete'].includes(action)) {
    throw new Error("Invalid action. Must be 'create', 'update', or 'delete'");
  }
  
  let payload: any;
  try {
    payload = JSON.parse(payloadStr);
  } catch (err) {
    throw new Error("payload must be a valid JSON string");
  }
  
  const { userId, locationLat, locationLng } = payload;
  
  if (!userId || typeof userId !== 'string') {
    throw new Error("payload must include a userId (string)");
  }
  
  const now = new Date().toISOString();
  
  if (action === 'create') {
    // For create, we require locationLat and locationLng
    if (typeof locationLat !== 'number' || typeof locationLng !== 'number') {
      throw new Error("For create, payload must include locationLat and locationLng as numbers");
    }
    
    // Compute geospatial fields
    const geohash = ngeohash.encode(locationLat, locationLng, GEO_PRECISION);
    const rangeKey = `${geohash}#${userId}`; // Example concatenation
    const geoPrecision = GEO_PRECISION;
    
    const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
      TableName: TABLE_NAME,
      Item: {
        id: userId,  // Use 'id' instead of 'userId' if your table requires it
        userId,      // Keep userId for tracking, but 'id' is the PK
        locationLat,
        locationLng,
        geohash,
        rangeKey,
        geoPrecision,
        createdAt: now,  // Add createdAt timestamp
        updatedAt: now,  // Add updatedAt timestamp
        lastUpdated: now, // Keep for consistency
      },
      ConditionExpression: 'attribute_not_exists(id)', // fail if already exists
    };
    
    await docClient.put(params).promise();
    return `UserProfile for ${userId} created successfully.`;
    
  } else if (action === 'update') {
    // For update, we also require locationLat and locationLng
    if (typeof locationLat !== 'number' || typeof locationLng !== 'number') {
      throw new Error("For update, payload must include locationLat and locationLng as numbers");
    }
    
    // Recompute geospatial fields
    const geohash = ngeohash.encode(locationLat, locationLng, GEO_PRECISION);
    const rangeKey = `${geohash}#${userId}`;
    const geoPrecision = GEO_PRECISION;
    
    const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: TABLE_NAME,
      Key: { userId },
      UpdateExpression: 'set locationLat = :lat, locationLng = :lng, geohash = :gh, rangeKey = :rk, geoPrecision = :gp, lastUpdated = :lu',
      ExpressionAttributeValues: {
        ':lat': locationLat,
        ':lng': locationLng,
        ':gh': geohash,
        ':rk': rangeKey,
        ':gp': geoPrecision,
        ':lu': now,
      },
      ConditionExpression: 'attribute_exists(userId)', // update only if exists
    };
    
    await docClient.update(params).promise();
    return `UserProfile for ${userId} updated successfully.`;
    
  } else if (action === 'delete') {
    // For delete, only userId is required.
    const params: AWS.DynamoDB.DocumentClient.DeleteItemInput = {
      TableName: TABLE_NAME,
      Key: { userId },
      ConditionExpression: 'attribute_exists(userId)', // delete only if exists
    };
    
    await docClient.delete(params).promise();
    return `UserProfile for ${userId} deleted successfully.`;
  }
  
  throw new Error("Unhandled action");
};