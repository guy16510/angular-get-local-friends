############
## Use this to provision dynamo for Geo Spatial look ups
## I spent days trying to get amplify to provision it.. It can not creating the index/hashing needed to support.
## Use this document to provision
################

# 1. Create a temp project directory
mkdir -p ~/geo-table-setup && cd ~/geo-table-setup

# 2. Initialize Node project
npm init -y

# 3. Install required packages
npm install @aws-sdk/client-dynamodb dynamodb-geo-v3

# 4. Create create-userprofile-table.js
cat << 'EOF' > create-userprofile-table.js
const { DynamoDB } = require('@aws-sdk/client-dynamodb');
const ddbGeo = require('dynamodb-geo-v3');

const ddb = new DynamoDB({ region: 'us-east-1' });

const TABLE_NAME = 'UserProfile-dev'; // change per environment

const config = new ddbGeo.GeoDataManagerConfiguration(ddb, TABLE_NAME);
config.hashKeyLength = 5;

(async () => {
  // Start with standard geo-enabled config
  const createTableInput = ddbGeo.GeoTableUtil.getCreateTableRequest(config);

  // Optional: Override throughput (for PROVISIONED mode only — not PAY_PER_REQUEST)
  // If you want on-demand, delete this block and use BillingMode: 'PAY_PER_REQUEST' instead.
  createTableInput.ProvisionedThroughput = {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  };

  // Optional: Switch to on-demand billing
  // createTableInput.BillingMode = 'PAY_PER_REQUEST';
  // delete createTableInput.ProvisionedThroughput;

  // 👉 Add identityId-index manually
  createTableInput.AttributeDefinitions.push({ AttributeName: 'identityId', AttributeType: 'S' });

  createTableInput.GlobalSecondaryIndexes = [
    {
      IndexName: 'identityId-index',
      KeySchema: [{ AttributeName: 'identityId', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
      // If you're using provisioned mode:
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    }
  ];

  try {
    console.log(`🚀 Creating geo-enabled table: ${TABLE_NAME}`);
    const result = await ddb.createTable(createTableInput);
    console.log(`✅ Created table: ${result.TableDescription.TableName}`);
  } catch (err) {
    console.error('❌ Table creation failed:', err);
  }
})();
EOF

# 5. Run the script
node create-userprofile-table.js