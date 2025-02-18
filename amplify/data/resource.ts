import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { sayHello } from '../functions/say-hello/resource';

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
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
    
  Profile: a
    .model({
      firstName: a.string().required(),
      lastName: a.string().required(),
      hash: a.datetime().required(),
      createdAt: a.datetime().required(),
      updatedAt: a.datetime().required(),
    })
    .authorization(allow => [allow.owner()]),


  Contact: a
    .model({
      email: a.string().required(),
      name:  a.string().required(),
      summary:  a.string().required(),
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


