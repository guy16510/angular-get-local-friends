import { DynamoDB } from 'aws-sdk';
import { SurveyAnswers, AnimalProfile } from './types';
import { calculatePersonalityTraits } from './traits-calculator';
import { generateSelfProfile, generateSeekingProfile } from './profile-generator';
import { getIdentityId } from '../../shared/utils/identity';
import { logger } from './utils/logger';

const docClient = new DynamoDB.DocumentClient();
const USER_PROFILE_TABLE_NAME = process.env['USER_PROFILE_TABLE_NAME']!;

if (!USER_PROFILE_TABLE_NAME) throw new Error("Missing environment variable: USER_PROFILE_TABLE_NAME");

export const handler = async (event: any) => {
  try {
    logger.info('Processing request', { event });
    
    // Extract user identity
    const identityId = getIdentityId(event.identity);
    if (!identityId) {
      logger.error('No identity provided');
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized: No identity provided.' })
      };
    }
    
    // Get survey answers from DynamoDB or request body based on the event type
    let surveyAnswers: SurveyAnswers;
    let existingUserProfile: any = null;
    
    if (identityId) {
      // If this is a direct Lambda invocation with a surveyId
      // Using the GSI to query by identityId
      const surveyResult = await docClient.query({
        TableName: USER_PROFILE_TABLE_NAME,
        IndexName: 'identityId-index',
        KeyConditionExpression: 'identityId = :identityId',
        ExpressionAttributeValues: {
          ':identityId': identityId
        }
      }).promise();
      
      if (!surveyResult.Items || surveyResult.Items.length === 0) {
        logger.error('Survey not found for identity', { identityId });
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Survey not found for user' })
        };
      }
      
      // Get the first item from the results
      existingUserProfile = surveyResult.Items[0];
      surveyAnswers = existingUserProfile.answers;
    } else {
      logger.error('No survey data provided');
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'No survey data provided' })
      };
    }
    
    // Validate required answers
    try {
      validateSurveyAnswers(surveyAnswers);
    } catch (error: any) {
      logger.error('Invalid survey data', { error: error.message });
      return {
        statusCode: 400,
        body: JSON.stringify({ message: error.message })
      };
    }
    
    // Calculate personality traits and generate profiles
    const traits = calculatePersonalityTraits(surveyAnswers);
    const selfProfile = generateSelfProfile(traits, surveyAnswers);
    const seekingProfile = generateSeekingProfile(traits, surveyAnswers);
    
    // Get the user profile to update
    let userProfile;
    if (existingUserProfile) {
      // If we already retrieved the user profile earlier, use that
      userProfile = existingUserProfile;
    } else {
      // Otherwise, try to get the user profile directly
      const userResult = await docClient.get({
        TableName: USER_PROFILE_TABLE_NAME,
        Key: { userId: identityId }
      }).promise();
      
      userProfile = userResult.Item || { userId: identityId };
    }
    
    // Update the user profile with the new fields
    const updatedUserProfile = {
      ...userProfile,
      updatedAt: new Date().toISOString(),
      selfProfile,
      seekingProfile,
      animalCreatedAt: new Date().toISOString(),
    };

    // Save the updated user profile back to DynamoDB
    await docClient.put({
      TableName: USER_PROFILE_TABLE_NAME,
      Item: updatedUserProfile
    }).promise();
    
    logger.info('Updated user profile with animal data', { userId: identityId });
    
    // Return the generated profiles
    return {
      statusCode: 200,
      body: JSON.stringify({
        selfProfile,
        seekingProfile
      })
    };
  } catch (error: any) {
    logger.error('Error processing request', { error: error.message });
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};

// Validates that required survey answers are present
function validateSurveyAnswers(answers: SurveyAnswers): void {
  const requiredQuestions = [16, 18, 20, 22, 25, 26, 27, 29, 30];
  
  for (const questionId of requiredQuestions) {
    if (answers[questionId] === undefined) {
      throw new Error(`Missing required answer for question ${questionId}`);
    }
  }
}