import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { sayHello } from '../functions/say-hello/resource';
import { findNearbyUsers } from '../functions/find-nearby-users/resource';
import { mutateUserProfile } from '../functions/mutate-user-profile/resource';
import { updateUserImages } from '../functions/update-user-images/resource';
import { getUserProfile } from '../functions/get-user-profile/resource';

/*== DATA MODEL ===============================================================
This schema defines several models. In addition to existing models, we add a
UserProfile model with geospatial fields and an images field to store S3 keys:
  - userId: Unique user ID
  - locationLat: Latitude coordinate
  - locationLng: Longitude coordinate
  - geohash: Geohash string for spatial queries
  - geoPrecision: (Optional) The precision/length of the geohash
  - lastUpdated: Timestamp for the last update
  - images: Array of S3 keys or URLs for the user’s images
=============================================================================*/
const schema = a.schema({
  sayHello: a
    .query()
    .arguments({ name: a.string().required() })
    .returns(a.string())
    .handler(a.handler.function(sayHello))
    .authorization(allow => [allow.publicApiKey()]),
  
  findNearbyUsers: a
    .query()
    .arguments({
      lat: a.float().required(),
      lng: a.float().required(),
      radius: a.float().required(),
      nextToken: a.string(), // optional pagination token
    })
    .returns(a.string()) // returns JSON string representing { nearbyUsers, nextToken }
    .handler(a.handler.function(findNearbyUsers))
    .authorization(allow => [
      allow.guest(),
      allow.authenticated(),
    ]),

  getUserProfile: a
    .query()
    .arguments({
      userId: a.string().required(),
    })
    .returns(a.string())  // or define a custom type if you prefer an object response
    .handler(a.handler.function(getUserProfile))
    .authorization(allow => [allow.guest(), allow.authenticated()]),
    
  mutateUserProfile: a
    .mutation()
    .arguments({
      action: a.string().required(),
      payload: a.string().required(), // JSON-encoded payload
    })
    .returns(a.string())
    .handler(a.handler.function(mutateUserProfile))
    .authorization(allow => [allow.authenticated()]),

  // New mutation to update a user’s images
  updateUserImages: a
    .mutation()
    .arguments({
      userId: a.string().required(),
      images: a.string().array(), // array of S3 keys or URLs
    })
    .returns(a.string())
    .handler(a.handler.function(updateUserImages))
    .authorization(allow => [allow.authenticated()]),

  Todo: a
    .model({
      content: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization(allow => [allow.owner()]),

  UserProfile: a
    .model({
      userId: a.string().required(),        // Unique user ID
      locationLat: a.float().required(),      // Latitude coordinate
      locationLng: a.float().required(),      // Longitude coordinate
      geohash: a.string().required(),         // Geohash for spatial queries
      rangeKey: a.string().required(),        // Range key for spatial queries
      geoPrecision: a.float(),                // Optional: Precision of the geohash
      lastUpdated: a.datetime().required(),   // Last update timestamp
      createdAt: a.datetime(),                // Add createdAt timestamp
      updatedAt: a.datetime(),                // Add updatedAt timestamp
      images: a.string().array()              // Array of S3 keys/URLs for images
    })
    .authorization(allow => [allow.owner()])
    .secondaryIndexes(index => [index('geohash').sortKeys(['rangeKey'])]),
        
  Contact: a
    .model({
      email: a.string().required(),
      name: a.string().required(),
      summary: a.string().required(),
      createdAt: a.datetime().required(),
      ipAddress: a.ipAddress().required(),
    })
    .authorization(allow => [
      allow.guest().to(['create']),
      allow.owner().to(['create']),
      allow.authenticated().to(['create']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});