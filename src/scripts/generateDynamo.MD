# 1. Create a temp project directory
mkdir -p ~/geo-table-setup && cd ~/geo-table-setup

# 2. Initialize Node project
npm init -y

# 3. Install required packages
npm install @aws-sdk/client-dynamodb dynamodb-geo-v3

# 4. Create create-userprofile-table.js
cat << 'EOF' > create-userprofile-table.js
const { DynamoDB } = require('@aws-sdk/client-dynamodb');

const ddb = new DynamoDB({ region: 'us-east-1' });

const TABLE_NAME = 'UserProfile-dev';

const createTableInput = {
  TableName: TABLE_NAME,
  AttributeDefinitions: [
    { AttributeName: 'hashKey', AttributeType: 'N' },
    { AttributeName: 'rangeKey', AttributeType: 'S' },
    { AttributeName: 'geohash', AttributeType: 'S' }, // optional, if indexing on geohash
    { AttributeName: 'identityId', AttributeType: 'S' } // optional secondary index
  ],
  KeySchema: [
    { AttributeName: 'hashKey', KeyType: 'HASH' },
    { AttributeName: 'rangeKey', KeyType: 'RANGE' }
  ],
  BillingMode: 'PAY_PER_REQUEST',
  GlobalSecondaryIndexes: [
    {
      IndexName: 'identityId-index',
      KeySchema: [{ AttributeName: 'identityId', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' }
    },
    {
      IndexName: 'geohash-index',
      KeySchema: [{ AttributeName: 'geohash', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' }
    }
  ]
};

const create = async () => {
  try {
    console.log(`🚀 Creating table: ${TABLE_NAME}...`);
    await ddb.createTable(createTableInput);
    console.log(`✅ Table created: ${TABLE_NAME}`);
  } catch (err) {
    console.error(`❌ Table creation failed:`, err);
  }
};

create();
EOF

# 5. Run the script
node create-userprofile-table.js