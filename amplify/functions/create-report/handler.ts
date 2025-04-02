import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { getIdentityId } from '../../shared/utils/identity';
import crypto from 'crypto';
import { sanitizeBigInts } from '../../shared/utils/sanitize';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const sesClient = new SESClient({});

const ADMIN_EMAIL = process.env['ADMIN_EMAIL'] || 'getlocalfriends@gmail.com';

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
    // Throw an error so that AppSync correctly handles an unauthorized request.
    throw new Error('Unauthorized');
  }

  try {
    // Create the report record
    const now = new Date().toISOString();
    const report = {
      id: crypto.randomUUID(),
      reporterId,
      reportedUserId,
      conversationId,
      messageId,
      timestamp: now,
      reason,
      status: 'pending',
      adminNotes: null,
      createdAt: now,
      updatedAt: now
    };
    console.log('Created report object:', JSON.stringify(report, null, 2));

    // Write the report to DynamoDB.
    console.log('Attempting to write to DynamoDB table:', process.env['AMPLIFY_REPORT_TABLE_NAME']);
    const putCommand = new PutCommand({
      TableName: process.env['AMPLIFY_REPORT_TABLE_NAME']!,
      Item: report
    });
    
    const putResult = await docClient.send(putCommand);
    console.log('DynamoDB PutCommand result:', JSON.stringify(putResult, null, 2));

    // Send email notification to the admin.
    console.log('Attempting to send email notification to admin');
    const emailCommand = new SendEmailCommand({
      Source: ADMIN_EMAIL,
      Destination: {
        ToAddresses: [ADMIN_EMAIL]
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
Message ID: ${messageId ?? 'N/A'}
Reason: ${reason}
Timestamp: ${report.timestamp}

Please review this report in the admin dashboard.
            `.trim()
          }
        }
      }
    });

    const emailResult = await sesClient.send(emailCommand);
    console.log('SES SendEmail result:', JSON.stringify(emailResult, null, 2));

    console.log('Successfully completed report creation');
    // Return the report directly so that AppSync sees all required fields.
    return sanitizeBigInts(report);
  } catch (error: any) {
    console.error('Error creating report:', error);
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    // Propagate the error for AppSync to handle.
    throw new Error('Failed to create report');
  }
};