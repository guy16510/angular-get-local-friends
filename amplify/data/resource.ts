import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { sayHello } from '../functions/say-hello/resource';
import { findNearbyUsers } from '../functions/find-nearby-users/resource';
import { mutateUserProfile } from '../functions/mutate-user-profile/resource';
import { updateUserImages } from '../functions/update-user-images/resource';
import { getUserProfile } from '../functions/get-user-profile/resource';
import { findPremiumMatches } from '../functions/find-premium-matches/resource';
import { createMessage } from '../functions/create-message/resource';
import { listConversations } from '../functions/list-conversations/resource';
import { listMessagesByConversationId } from '../functions/list-messages-by-conversation-id/resource';

/* --- Define Models First --- */


const ChatMessage = a.model({
  id: a.string().required(),
  conversationId: a.string().required(),
  timestamp: a.datetime().required(),
  senderId: a.string().required(),
  recipientId: a.string().required(),
  text: a.string().required(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
})
.secondaryIndexes(index => [
  index('conversationId').sortKeys(['timestamp'])
])
.authorization(allow => [allow.authenticated()]);

const Conversation = a.model({
  id: a.string().required(),              // Partition key
  participantA: a.string().required(),
  participantB: a.string().required(),
  lastMessage: a.string().required(),
  lastTimestamp: a.datetime().required(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
})
.secondaryIndexes(index => [
  index('participantA').sortKeys(['lastTimestamp']),
  index('participantB').sortKeys(['lastTimestamp'])
]).authorization(allow => [allow.owner()]);

const UserProfile = a.model({
  identityId: a.string().required(),
  locationLat: a.float().required(),
  locationLng: a.float().required(),
  hashKey: a.integer().required(),
  rangeKey: a.string().required(),
  geohash: a.string().required(),
  geoPrecision: a.float(),
  lastUpdated: a.datetime().required(),
  lastOnlineAt: a.datetime(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  images: a.string().array(),
  userName: a.string().required(),
  surveyAnswers: a.json().required()
}).identifier(['hashKey', 'rangeKey'])
.authorization(allow => [allow.owner()]);

const Contact = a.model({
  email: a.string().required(),
  name: a.string().required(),
  summary: a.string().required(),
  createdAt: a.datetime().required(),
  ipAddress: a.string().required()
}).authorization(allow => [
  allow.guest().to(['create']),
  allow.authenticated().to(['create']),
  allow.owner().to(['read', 'update', 'delete'])
]);

const NearbyUsersResponse = a.model({
  id: a.string().required(), // explicitly define id
  createdAt: a.datetime().required(),
  updatedAt: a.datetime().required(),
  success: a.boolean().required(),
  error: a.string(), // can be null if not set
  nearbyUsers: a.json().array(),
  nextToken: a.string()
})
.identifier(['id']) // use id as the identifier
.authorization(allow => [allow.authenticated()]);

/* --- Now Define Operations That Reference The Models --- */

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
      nextToken: a.string(),
      identityId: a.string(),
    })
    .returns(a.ref('NearbyUsersResponse'))
    .handler(a.handler.function(findNearbyUsers))
    .authorization(allow => [allow.guest(), allow.authenticated()]),

  mutateUserProfile: a
    .mutation()
    .arguments({
      action: a.string().required(),
      payload: a.string().required()
    })
    .returns(a.json())
    .handler(a.handler.function(mutateUserProfile))
    .authorization(allow => [allow.authenticated()]),

  updateUserImages: a
    .mutation()
    .arguments({
      identityId: a.string().required(),
      images: a.string().array()
    })
    .returns(a.string())
    .handler(a.handler.function(updateUserImages))
    .authorization(allow => [allow.authenticated()]),

  // Renamed query to avoid conflict with auto-generated getUserProfile
  fetchUserProfile: a
    .query()
    .arguments({
      identityId: a.string().required()
    })
    .returns(a.json())
    .handler(a.handler.function(getUserProfile))
    .authorization(allow => [allow.authenticated(), allow.guest()]),

  findPremiumMatches: a
    .query()
    .arguments({
      lat: a.float().required(),
      lng: a.float().required(),
      radius: a.float().required(),
      surveyFilter: a.json().required(),
      nextToken: a.string()
    })
    .returns(a.string())
    .handler(a.handler.function(findPremiumMatches))
    .authorization(allow => [allow.authenticated()]),

  createMessage: a
    .mutation()
    .arguments({ recipientId: a.string().required(), text: a.string().required() })
    .returns(a.ref('ChatMessage'))
    .handler(a.handler.function(createMessage))
    .authorization(allow => [allow.authenticated()]),

  onCreateMessage: a
    .subscription()
    .for(a.ref('createMessage'))
    .handler(a.handler.function(createMessage))
    .authorization(allow => [allow.authenticated()]),

  customListConversations: a
    .query()
    .arguments({})
    .returns(a.ref('Conversation').array())
    .handler(a.handler.function(listConversations))
    .authorization(allow => [allow.authenticated()]),

  customListMessagesByConversationId: a
    .query()
    .arguments({ conversationId: a.string().required() })
    .returns(a.ref('ChatMessage').array())
    .handler(a.handler.function(listMessagesByConversationId))
    .authorization(allow => [allow.authenticated()]),
  
  ChatMessage,
  Conversation,
  UserProfile,
  Contact,
  NearbyUsersResponse
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30
    }
  }
});