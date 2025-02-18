import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { sayHello } from '../functions/say-hello/resource';

/*== DATA MODEL ===============================================================
This schema defines several models. In addition to existing models, we add a
UserProfile model with geospatial fields:
  - userId: Unique user ID
  - lat: Latitude coordinate
  - lng: Longitude coordinate
  - geohash: Geohash string for spatial queries
  - geoPrecision: (Optional) The precision/length of the geohash
  - lastUpdated: Timestamp for the last update
=============================================================================*/
const schema = a.schema({
  sayHello: a
    .query()
    .arguments({ name: a.string().required() })
    .returns(a.string())
    .handler(a.handler.function(sayHello))
    .authorization(allow => [allow.publicApiKey()]),

  Todo: a
    .model({
      content: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization(allow => [allow.owner()]),
    
  UserProfile: a
    .model({
      userId: a.string().required(),       // Unique user ID
      lat: a.float().required(),            // Latitude coordinate
      lng: a.float().required(),            // Longitude coordinate
      geohash: a.string().required(),       // Geohash for spatial queries
      geoPrecision: a.float(),             // Optional: Precision of the geohash (e.g., number of characters)
      lastUpdated: a.datetime().required(), // Last update timestamp
    })
    .authorization(allow => [allow.owner()]),

  Contact: a
    .model({
      email: a.string().required(),
      name: a.string().required(),
      summary: a.string().required(),
      createdAt: a.datetime().required(),
      ipAddress: a.ipAddress().required(),
    })
    .authorization(allow => [allow.publicApiKey().to(['create'])]),
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