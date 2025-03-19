import type { Schema } from '../../data/resource';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import * as ddbGeo from 'dynamodb-geo-v3';
import { getIdentityId } from '../../shared/utils/identity';
import { sanitizeBigInts } from '../../shared/utils/sanitize';

const TABLE_NAME = process.env['USER_PROFILE_TABLE_NAME']!;
if (!TABLE_NAME) throw new Error("Missing environment variable: USER_PROFILE_TABLE_NAME");

const ddb = new DynamoDB({});
const geoConfig = new ddbGeo.GeoDataManagerConfiguration(ddb, TABLE_NAME);
geoConfig.hashKeyLength = 5;

const geoTableManager = new ddbGeo.GeoDataManager(geoConfig);

interface NearbyUser {
  identityId: string;
  locationLat: number;
  locationLng: number;
  userName?: string;
  surveyAnswers?: any;
  geohash?: string;
  distance?: string;
  actualDistance?: number;
  [key: string]: any;
}

export const handler: Schema["findNearbyUsers"]["functionHandler"] = async (event) => {
  const { lat, lng, radius } = event.arguments;
  const radiusInMeters = radius * 1609.34;

  // Get the identityId from the event context (requester’s identity)
  const identityId = getIdentityId(event.identity);

  console.info(`🔍 [findNearbyUsers] lat=${lat}, lng=${lng}, radius=${radius}mi, identityId=${identityId}`);

  try {
    const rawResults = await geoTableManager.queryRadius({
      RadiusInMeter: radiusInMeters,
      CenterPoint: { latitude: lat, longitude: lng }
    });

    const items = rawResults.map(item => sanitizeBigInts(unmarshall(item))) as NearbyUser[];

    const filteredUsers = items
      .filter(user => user && user.identityId !== identityId)
      .map(user => {
        const distance = haversine(lat, lng, user.locationLat, user.locationLng);
        return {
          ...user,
          distance: distance >= 5 ? `${distance.toFixed(1)} miles` : '< 5 miles',
          actualDistance: distance
        };
      })
      .sort((a, b) => a.actualDistance - b.actualDistance);

    return {
      id: "nearbyUsersResponse",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      success: true,
      error: null,
      nearbyUsers: filteredUsers.map(({ actualDistance, ...rest }) => rest),
      nextToken: null // extend later if paginating via ddbGeo
    };

  } catch (err) {
    console.error("❌ [findNearbyUsers] Error:", err);
    return {
      id: "nearbyUsersResponse",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      success: false,
      error: "Internal server error",
      nearbyUsers: [],
      nextToken: null
    };
  }
};

// Simple haversine formula to compute distance in miles
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Radius of Earth in miles
  const toRad = (d: number) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}