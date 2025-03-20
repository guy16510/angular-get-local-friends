############
## Use this to provision a manual S3 bucket with a custom bucket policy for per-user folder access.
## This bucket allows public GET on "protected/*" and lets each user (by their Cognito sub)
## PUT and DELETE objects in their own folder at "protected/${cognito:sub}/*".
## Run this script in AWS CloudShell (or your CLI). Adjust BUCKET_NAME as needed.
################

# 1. Create a temp project directory and navigate into it
mkdir -p ~/manual-s3-bucket && cd ~/manual-s3-bucket

# 2. Set your bucket name (change as needed) and region
BUCKET_NAME="users-images-develop"  # <-- update with your bucket name
REGION="us-east-1"              # <-- update if needed

# 3. Create the bucket, checking for us-east-1 (omit location constraint for us-east-1)
if [ "$REGION" = "us-east-1" ]; then
  aws s3api create-bucket \
    --bucket $BUCKET_NAME \
    --region $REGION
else
  aws s3api create-bucket \
    --bucket $BUCKET_NAME \
    --region $REGION \
    --create-bucket-configuration LocationConstraint=$REGION
fi

# 4. Disable Block Public Access settings so the bucket policy can be applied
aws s3api put-public-access-block \
  --bucket $BUCKET_NAME \
  --public-access-block-configuration '{
    "BlockPublicAcls": false,
    "IgnorePublicAcls": false,
    "BlockPublicPolicy": false,
    "RestrictPublicBuckets": false
}'

# 5. Create a bucket policy file (bucket-policy.json)
cat << 'EOF' > bucket-policy.json
{
  "Version": "2012-10-17",
  "Id": "ManualBucketPolicy",
  "Statement": [
    {
      "Sid": "AllowGetForProtectedFolder",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::MY_MANUAL_BUCKET/protected/*"
    },
    {
      "Sid": "AllowPutForOwnerFolder",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::MY_MANUAL_BUCKET/protected/${cognito:sub}/*"
    },
    {
      "Sid": "AllowDeleteForOwnerFolder",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:DeleteObject",
      "Resource": "arn:aws:s3:::MY_MANUAL_BUCKET/protected/${cognito:sub}/*"
    }
  ]
}
EOF

# 6. Replace the placeholder MY_MANUAL_BUCKET with your actual bucket name in the policy file
sed -i "s/MY_MANUAL_BUCKET/$BUCKET_NAME/g" bucket-policy.json

# 7. Apply the bucket policy
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json

echo "✅ Manual S3 bucket '$BUCKET_NAME' created and bucket policy applied."