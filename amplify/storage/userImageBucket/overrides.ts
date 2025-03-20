// amplify/backend/storage/userimages-develop/overrides.ts
export function override(resources: any) {
    // Replace with the actual logical ID from your generated CloudFormation template.
    const bucketLogicalId = 'userimagesdevelopBucket4565D270';
  
    if (resources.Resources && resources.Resources[bucketLogicalId]) {
      resources.Resources[bucketLogicalId].Properties.PublicAccessBlockConfiguration = {
        BlockPublicPolicy: false,  // Allow bucket policies that grant public access.
        BlockPublicAcls: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: false,
      };
      console.log("Overrides applied to bucket:", bucketLogicalId);
    } else {
      console.warn(`Bucket resource '${bucketLogicalId}' not found in CloudFormation resources.`);
    }
    return resources;
  }