import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { findNearbyUsers } from '../functions/find-nearby-users/resource';
import { mutateUserProfile } from '../functions/mutate-user-profile/resource';
import { updateUserImages } from '../functions/update-user-images/resource';
import { getUserProfile } from '../functions/get-user-profile/resource';
import { getAnimalProfile } from '../functions/get-animal-profile/resource';
import { findPremiumMatches } from '../functions/find-premium-matches/resource';
import { createMessage } from '../functions/create-message/resource';
import { listConversations } from '../functions/list-conversations/resource';
import { listMessagesByConversationId } from '../functions/list-messages-by-conversation-id/resource';

/* --- Define Models --- */

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
  id: a.string().required(),
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
])
.authorization(allow => [allow.authenticated()]);

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
  id: a.string().required(),
  createdAt: a.datetime().required(),
  updatedAt: a.datetime().required(),
  success: a.boolean().required(),
  error: a.string(),
  nearbyUsers: a.json().array(),
  nextToken: a.string()
})
.identifier(['id'])
.authorization(allow => [allow.authenticated()]);

/* --- Define Operations --- */

const schema = a.schema({
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
    .authorization(allow => [allow.authenticated()]),

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

  fetchUserProfile: a
    .query()
    .arguments({
      identityId: a.string().required()
    })
    .returns(a.json())
    .handler(a.handler.function(getUserProfile))
    .authorization(allow => [allow.authenticated()]),

  fetchAnimalProfile: a
    .query()
    .arguments({
      identityId: a.string().required()
    })
    .returns(a.json())
    .handler(a.handler.function(getAnimalProfile))
    .authorization(allow => [allow.authenticated()]),

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

  // Models
  ChatMessage,
  Conversation,
  Contact,
  NearbyUsersResponse,
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    lambdaAuthorizationMode: undefined,
    apiKeyAuthorizationMode: {
      expiresInDays: 30
    }
  }
});