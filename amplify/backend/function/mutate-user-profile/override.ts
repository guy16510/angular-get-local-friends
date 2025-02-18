// amplify/backend/function/mutateuserprofile/override.ts
const override = (resources: any) => {
  resources.Properties.Policies.push({
    PolicyName: "DynamoDBUserProfileMutateAccess",
    PolicyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: [
            "dynamodb:PutItem",
            "dynamodb:UpdateItem",
            "dynamodb:DeleteItem",
            "dynamodb:GetItem"
          ],
          Resource: "arn:aws:dynamodb:us-east-1:438347844807:table/UserProfileTable"
        }
      ]
    }
  });
  return resources;
};

export default override;