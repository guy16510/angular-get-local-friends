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
import { setTypingStatus } from '../functions/set-typing-status/resource';
import { markMessagesAsRead } from '../functions/mark-messages-as-read/resource';
import {reactToMessage } from '../functions/react-to-message/resource';
import { listUnreadMessages } from '../functions/list-unread-messages/resource';
import { getCallerIdentity } from '../functions/get-caller-identity/resource';
import { enrollPremium } from '../functions/enroll-premium/resource';
import { removePremium } from '../functions/remove-premium/resource';
import { createReport } from '../functions/create-report/resource';

/* --- Define Models --- */
export const ChatMessage = a.model({
  id: a.id().required(),
  conversationId: a.string().required(),
  senderId: a.string().required(),
  recipientId: a.string().required(),
  text: a.string(),
  timestamp: a.datetime().required(),
  type: a.string().default('text'),
  mediaUrl: a.string(),
  status: a.string().default('sent'),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  reactions: a.json(),
})
  .secondaryIndexes(index => [
    index('conversationId').sortKeys(['timestamp']),
    index('recipientId').sortKeys(['status'])
  ])
  .authorization(allow => [allow.authenticated()]);

export const TypingStatus = a.model({
  conversationId: a.string().required(),
  userId: a.string().required(),
  isTyping: a.boolean().required(),
  updatedAt: a.datetime().required()
}).authorization(allow => [allow.authenticated().to(['create', 'update', 'read'])]);

export const UserPresence = a.model({
  userId: a.string().required(),
  status: a.string().default('offline'),
  lastSeen: a.datetime()
}).authorization(allow => [allow.authenticated().to(['create', 'update', 'read'])]);

export const Conversation = a.model({
  id: a.string().required(),
  participantA: a.string().required(),
  participantB: a.string().required(),
  lastMessage: a.string().required(),
  lastTimestamp: a.datetime().required(),
  createdAt: a.datetime(),
  updatedAt: a.datetime()
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

const Report = a.model({
  id: a.id().required(),
  reporterId: a.string().required(),
  reportedUserId: a.string().required(),
  conversationId: a.string().required(),
  messageId: a.string(),
  timestamp: a.datetime().required(),
  reason: a.string().required(),
  status: a.string().default('pending'),
  adminNotes: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime()
})
  .secondaryIndexes(index => [
    index('reporterId').sortKeys(['createdAt']),
    index('reportedUserId').sortKeys(['createdAt']),
    index('status').sortKeys(['createdAt'])
  ])
  .authorization(allow => [allow.authenticated()]);

/* --- Define Operations --- */
const schema = a.schema({
  findNearbyUsers: a.query()
    .arguments({ lat: a.float().required(), lng: a.float().required(), radius: a.float().required(), nextToken: a.string() })
    .returns(a.ref('NearbyUsersResponse'))
    .handler(a.handler.function(findNearbyUsers))
    .authorization(allow => [allow.authenticated()]),

  mutateUserProfile: a.mutation()
    .arguments({ action: a.string().required(), payload: a.string().required() })
    .returns(a.json())
    .handler(a.handler.function(mutateUserProfile))
    .authorization(allow => [allow.authenticated()]),

  updateUserImages: a.mutation()
    .arguments({ images: a.string().array() })
    .returns(a.string())
    .handler(a.handler.function(updateUserImages))
    .authorization(allow => [allow.authenticated()]),

  fetchUserProfile: a.query()
    .arguments({ identityId: a.string().required() })
    .returns(a.json())
    .handler(a.handler.function(getUserProfile))
    .authorization(allow => [allow.authenticated()]),

  fetchAnimalProfile: a.query()
    .arguments({})
    .returns(a.json())
    .handler(a.handler.function(getAnimalProfile))
    .authorization(allow => [allow.authenticated()]),

  findPremiumMatches: a.query()
    .arguments({ lat: a.float().required(), lng: a.float().required(), radius: a.float().required(), surveyFilter: a.json().required(), nextToken: a.string() })
    .returns(a.string())
    .handler(a.handler.function(findPremiumMatches))
    .authorization(allow => [allow.authenticated()]),

  createMessage: a.mutation()
    .arguments({ recipientId: a.string().required(), text: a.string().required() })
    .returns(a.ref('ChatMessage'))
    .handler(a.handler.function(createMessage))
    .authorization(allow => [allow.authenticated()]),

  onCreateMessage: a
    .subscription()
    .for(a.ref('createMessage'))
    .handler(a.handler.function(getCallerIdentity))
    .authorization(allow => [allow.authenticated()]),

  customListMessagesByConversationId: a.query()
    .arguments({ conversationId: a.string().required(), limit: a.integer(), nextToken: a.string() })
    .returns(a.ref('ChatMessage').array()) // ✅ FIXED: array of model
    .handler(a.handler.function(listMessagesByConversationId))
    .authorization(allow => [allow.authenticated()]),

  customListConversations: a.query()
    .arguments({ limit: a.integer(), nextTokenA: a.string(), nextTokenB: a.string() })
    .returns(a.ref('Conversation').array()) // ✅ FIXED: array of model
    .handler(a.handler.function(listConversations))
    .authorization(allow => [allow.authenticated()]),

  setTypingStatus: a.mutation()
    .arguments({ conversationId: a.string().required(), userId: a.string().required(), isTyping: a.boolean().required() })
    .returns(a.ref('TypingStatus'))
    .handler(a.handler.function(setTypingStatus))
    .authorization(allow => [allow.authenticated()]),

  onTypingStatus: a.subscription()
    .arguments({ conversationId: a.string().required() })
    .for(a.ref('setTypingStatus'))
    .handler(a.handler.function(setTypingStatus))
    .authorization(allow => [allow.authenticated()]),

  markMessagesAsRead: a.mutation()
    .arguments({
      conversationId: a.string().required(),
    })
    .returns(a.ref('ChatMessage').array()) // Return array of updated messages
    .handler(a.handler.function(markMessagesAsRead))
    .authorization(allow => [allow.authenticated()]),

  reactToMessage: a.mutation()
    .arguments({
      messageId: a.string().required(),
      emoji: a.string().required(),
    })
    .returns(a.ref('ChatMessage'))
    .handler(a.handler.function(reactToMessage))
    .authorization(allow => [allow.authenticated()]),
  
  listUnreadMessages: a.query()
    .arguments({ recipientId: a.string().required() })
    .returns(a.ref('ChatMessage').array())
    .handler(a.handler.function(listUnreadMessages))
    .authorization(allow => [allow.authenticated()]),

  enrollPremium: a.mutation()
    .returns(a.json())
    .handler(a.handler.function(enrollPremium))
    .authorization(allow => [allow.authenticated()]),

  removePremium: a.mutation()
    .returns(a.json())
    .handler(a.handler.function(removePremium))
    .authorization(allow => [allow.authenticated()]),

  createReport: a.mutation()
    .arguments({
      reportedUserId: a.string().required(),
      conversationId: a.string().required(),
      messageId: a.string(),
      reason: a.string().required()
    })
    .returns(a.ref('Report'))
    .handler(a.handler.function(createReport))
    .authorization(allow => [allow.authenticated()]),

  ChatMessage,
  Conversation,
  Contact,
  NearbyUsersResponse,
  TypingStatus,
  UserPresence,
  Report,
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: { expiresInDays: 30 }
  }
});