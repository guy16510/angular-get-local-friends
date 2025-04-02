import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { getIdentityId } from '../../shared/utils/identity';
import type { Schema } from '../../data/resource';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const sesClient = new SESClient({});

export const handler: Schema['createReport']['functionHandler'] = async (event) => {
  const { reportedUserId, conversationId, messageId, reason } = event.arguments;
  const reporterId = getIdentityId(event.identity);

  if (!reporterId) {
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

    await docClient.send(new PutCommand({
      TableName: process.env['AMPLIFY_REPORT_TABLE_NAME']!,
      Item: report
    }));

    // Send email notification to admin
    const adminEmail = process.env['ADMIN_EMAIL'];
    if (adminEmail) {
      await sesClient.send(new SendEmailCommand({
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
      }));
    }

    return report;
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
}; 