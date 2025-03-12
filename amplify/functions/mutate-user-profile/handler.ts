import type { Schema } from '../../data/resource';
import AWS from 'aws-sdk';
import ngeohash from 'ngeohash';

const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env['USER_PROFILE_TABLE_NAME'] || null;

if (!TABLE_NAME || TABLE_NAME.length === 0) {
  console.error("ERROR: USER_PROFILE_TABLE_NAME is not set!");
  throw new Error("Missing environment variable: USER_PROFILE_TABLE_NAME");
}

const GEO_PRECISION = 7;

export const handler: Schema["mutateUserProfile"]["functionHandler"] = async (event) => {
  const { action, payload: payloadStr } = event.arguments;

  if (!action || !['create', 'update', 'delete', 'onlinePing'].includes(action)) {
    throw new Error("Invalid action. Must be 'create', 'update', 'delete', or 'onlinePing'");
  }

  let payload: any;
  try {
    payload = JSON.parse(payloadStr);
  } catch (err) {
    throw new Error("Payload must be a valid JSON string");
  }

  const { identityId, locationLat, locationLng, surveyAnswers, userName } = payload;
  if (!identityId || typeof identityId !== 'string') {
    throw new Error("Payload must include an identityId (string)");
  }

  const now = new Date().toISOString();

  if (action === 'create') {
    if (typeof locationLat !== 'number' || typeof locationLng !== 'number') {
      throw new Error("For create, payload must include locationLat and locationLng as numbers");
    }

    const geohash = ngeohash.encode(locationLat, locationLng, GEO_PRECISION);
    const rangeKey = `${geohash}#${identityId}`;
    const geoPrecision = GEO_PRECISION;

    const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
      TableName: TABLE_NAME,
      Item: {
        id: identityId,
        identityId,
        locationLat,
        locationLng,
        userName,
        geohash,
        rangeKey,
        geoPrecision,
        surveyAnswers,
        createdAt: now,
        updatedAt: now,
        lastOnlineAt: now,
        lastUpdated: now,
      },
      ReturnValues: "ALL_OLD",
    };

    await docClient.put(params).promise();
    return {
      success: true,
      message: `UserProfile for ${identityId} created successfully.`,
      action: 'create',
      identityId,
    };

  } else if (action === 'update') {
    if (typeof locationLat !== 'number' || typeof locationLng !== 'number') {
      throw new Error("For update, payload must include locationLat and locationLng as numbers");
    }

    const geohash = ngeohash.encode(locationLat, locationLng, GEO_PRECISION);
    const rangeKey = `${geohash}#${identityId}`;
    const geoPrecision = GEO_PRECISION;

    const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: TABLE_NAME,
      Key: { id: identityId },
      UpdateExpression: 'set locationLat = :lat, locationLng = :lng, geohash = :gh, rangeKey = :rk, geoPrecision = :gp, lastUpdated = :lu, lastOnlineAt = :la',
      ExpressionAttributeValues: {
        ':lat': locationLat,
        ':lng': locationLng,
        ':gh': geohash,
        ':rk': rangeKey,
        ':gp': geoPrecision,
        ':lu': now,
        ':la': now
      },
      ReturnValues: "ALL_NEW",
    };

    await docClient.update(params).promise();
    return {
      success: true,
      message: `UserProfile for ${identityId} updated successfully.`,
      action: 'update',
      identityId,
    };

  } else if (action === 'delete') {
    const params: AWS.DynamoDB.DocumentClient.DeleteItemInput = {
      TableName: TABLE_NAME,
      Key: { id: identityId },
    };

    await docClient.delete(params).promise();
    return {
      success: true,
      message: `UserProfile for ${identityId} deleted successfully.`,
      action: 'delete',
      identityId,
    };

  } else if (action === 'onlinePing') {
    const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: TABLE_NAME,
      Key: { id: identityId },
      UpdateExpression: 'set lastOnlineAt = :lo',
      ExpressionAttributeValues: {
        ':lo': now,
      },
      ReturnValues: "ALL_NEW",
    };

    await docClient.update(params).promise();
    return {
      success: true,
      message: `Online timestamp updated for ${identityId}.`,
      action: 'onlinePing',
      identityId,
    };
  }

  throw new Error("Unhandled action");
};