// seed-fake-users.js
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import * as ddbGeo from 'dynamodb-geo-v3';
import { randomUUID } from 'crypto';

const TABLE_NAME = process.env.USER_PROFILE_TABLE_NAME || 'UserProfile-dev'; // update as needed
const ddb = new DynamoDB({});
const config = new ddbGeo.GeoDataManagerConfiguration(ddb, TABLE_NAME);
config.hashKeyLength = 5;

const geoTableManager = new ddbGeo.GeoDataManager(config);

async function seedUsers() {
  const now = new Date().toISOString();

  const users = [
    {
      identityId: `us-east-1:${randomUUID()}`,
      locationLat: 42.3601,
      locationLng: -71.0589,
      userName: 'Alice',
      surveyAnswers: [
        { questionId: 1, answer: '25-34' },
        { questionId: 2, answer: 'Reading' },
      ],
    },
    {
      identityId: `us-east-1:${randomUUID()}`,
      locationLat: 42.3736,
      locationLng: -71.1097,
      userName: 'Bob',
      surveyAnswers: [
        { questionId: 1, answer: '35-44' },
        { questionId: 2, answer: 'Hiking' },
      ],
    },
    {
      identityId: `us-east-1:${randomUUID()}`,
      locationLat: 42.4072,
      locationLng: -71.3824,
      userName: 'Charlie',
      surveyAnswers: [
        { questionId: 1, answer: '18-24' },
        { questionId: 2, answer: 'Gaming' },
      ],
    }
  ];

  for (const user of users) {
    const geohash = require('ngeohash').encode(user.locationLat, user.locationLng, 7);
    const rangeKey = `${geohash}#${user.identityId}`;

    console.log(`📌 Seeding user ${user.userName} (${user.identityId})`);

    await geoTableManager.putPoint({
      RangeKeyValue: { S: rangeKey },
      GeoPoint: {
        latitude: user.locationLat,
        longitude: user.locationLng,
      },
      PutItemInput: {
        Item: {
          identityId: { S: user.identityId },
          userName: { S: user.userName },
          surveyAnswers: { S: JSON.stringify(user.surveyAnswers) },
          locationLat: { N: user.locationLat.toString() },
          locationLng: { N: user.locationLng.toString() },
          geohash: { S: geohash },
          geoPrecision: { N: '7' },
          createdAt: { S: now },
          updatedAt: { S: now },
          lastOnlineAt: { S: now },
          lastUpdated: { S: now },
        }
      }
    });
  }

  console.log('✅ Finished seeding users.');
}

seedUsers().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});


mkdir geo-seed && cd geo-seed
npm init -y
npm install @aws-sdk/client-dynamodb dynamodb-geo-v3 ngeohash
nano seed-fake-users.js   # Paste script
export USER_PROFILE_TABLE_NAME=UserProfile-dev  # or whatever your table is
node seed-fake-users.js