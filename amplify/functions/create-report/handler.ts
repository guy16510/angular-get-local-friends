import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { getIdentityId } from '../../shared/utils/identity';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const sesClient = new SESClient({});

type CreateReportEvent = {
  arguments: {
    reportedUserId: string;
    conversationId: string;
    messageId?: string;
    reason: string;
  };
  identity: {
    sub: string;
  };
};

export const handler = async (event: CreateReportEvent) => {
  console.log('Handler triggered with event:', JSON.stringify(event, null, 2));
  console.log('USER_POOL_ID:', process.env['USER_POOL_ID']);
  console.log('AWS_BRANCH:', process.env['AWS_BRANCH']);
  console.log('Constructed PREMIUM_GROUP:', process.env['PREMIUM_GROUP']);

  const { reportedUserId, conversationId, messageId, reason } = event.arguments;
  console.log('Extracted arguments:', { reportedUserId, conversationId, messageId, reason });

  const reporterId = getIdentityId(event.identity);
  console.log('[getIdentityId] Using Cognito User Pool unique identifier (sub):', reporterId);
  console.log('Extracted identityId:', reporterId);

  if (!reporterId) {
    console.error('No reporterId found - unauthorized');
    throw new Error('Unauthorized');
  }

  try {
    // Create the report record
    const report = {
      id: crypto.randomUUID(),
      reporterId,
      reportedUserId,
      conversationId,
      messageId,
      timestamp: new Date().toISOString(),
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    console.log('Created report object:', JSON.stringify(report, null, 2));

    console.log('Attempting to write to DynamoDB table:', process.env['AMPLIFY_REPORT_TABLE_NAME']);
    const putCommand = new PutCommand({
      TableName: process.env['AMPLIFY_REPORT_TABLE_NAME']!,
      Item: report
    });
    
    const putResult = await docClient.send(putCommand);
    console.log('DynamoDB PutCommand result:', JSON.stringify(putResult, null, 2));

    // Send email notification to admin
    const adminEmail = process.env['ADMIN_EMAIL'];
    console.log('Admin email configured:', adminEmail);
    
    if (adminEmail) {
      console.log('Attempting to send email notification to admin');
      const emailCommand = new SendEmailCommand({
        Destination: {
          ToAddresses: [adminEmail]
        },
        Message: {
          Subject: {
            Data: 'New User Report Submitted'
          },
          Body: {
            Text: {
              Data: `
                A new report has been submitted:
                
                Reporter ID: ${reporterId}
                Reported User ID: ${reportedUserId}
                Conversation ID: ${conversationId}
                Message ID: ${messageId}
                Reason: ${reason}
                Timestamp: ${report.timestamp}
                
                Please review this report in the admin dashboard.
              `
            }
          }
        },
        Source: adminEmail
      });

      const emailResult = await sesClient.send(emailCommand);
      console.log('SES SendEmail result:', JSON.stringify(emailResult, null, 2));
    } else {
      console.log('No admin email configured, skipping email notification');
    }

    console.log('Successfully completed report creation');
    return report;
  } catch (error: any) {
    console.error('Error creating report:', error);
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    throw error;
  }
}; 