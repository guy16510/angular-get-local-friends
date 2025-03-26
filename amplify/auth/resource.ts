import { defineAuth, secret } from '@aws-amplify/backend';
import { postConfirmation } from "./post-confirmation/resource";

export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      facebook: {
        clientId: secret('FACEBOOK_APP_ID'),
        clientSecret: secret('FACEBOOK_APP_SECRET'),
        scopes: ['public_profile', 'email'],
        attributeMapping: {
          email: 'email',
          nickname: 'name'
        }
      },
      callbackUrls: [
        'http://localhost:4200/myProfile',
        'http://192.168.2.15:4200/myProfile',
        'https://dev.getlocalfriends.com/myProfile',
        'https://getlocalfriends.com/myProfile',
        'https://getlocalfriends-auth.auth.us-east-1.amazoncognito.com/oauth2/idpresponse',
        'https://dev-getlocalfriends-auth.auth.us-east-1.amazoncognito.com/oauth2/idpresponse'
      ],
      logoutUrls: [
        'http://localhost:4200/',
        'http://192.168.2.15:4200/',
        'https://dev.getlocalfriends.com/',
        'https://getlocalfriends.com/',
        'https://getlocalfriends-auth.auth.us-east-1.amazoncognito.com/logout',
        'https://dev-getlocalfriends-auth.auth.us-east-1.amazoncognito.com/logout',
      ],
    },
  },
  groups: [
    `EVERYONE-${process.env['AWS_BRANCH']}`,
    `PREMIUM-${process.env['AWS_BRANCH']}`,
    `ADMINS-${process.env['AWS_BRANCH']}`
  ],
  userAttributes: {
    nickname: {
      mutable: true,
      required: false,
    },
    birthdate: {
      mutable: true,
      required: false,
    }
  },
  triggers: {
    postConfirmation,
  },
  access: (allow) => [
    allow.resource(postConfirmation).to(["addUserToGroup"]),
  ],
});