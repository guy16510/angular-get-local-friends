import { defineAuth } from '@aws-amplify/backend';
import { postConfirmation } from "./post-confirmation/resource"

export const auth = defineAuth({
  loginWith: {
    email: true,
  },  
  groups: [
    `EVERYONE-${process.env['AWS_BRANCH']}`,  // Groups now use AWS_BRANCH
    `PREMIUM-${process.env['AWS_BRANCH']}`,
    `ADMINS-${process.env['AWS_BRANCH']}`
  ],
  userAttributes: {
    nickname: {
      mutable: true,
      required: false,
    },
  },
  triggers: {
    postConfirmation,
  },
  access: (allow) => [
    allow.resource(postConfirmation).to(["addUserToGroup"]),
  ],
});