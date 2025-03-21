// ===== amplify/functions/get-animal-profile/handler.ts =====
import { DynamoDB } from 'aws-sdk';
import { SurveyAnswers, AnimalProfile } from './types';
import { calculatePersonalityTraits } from './traits-calculator';
import { generateSelfProfile, generateSeekingProfile } from './profile-generator';
import { getIdentityId } from '../../shared/utils/identity';
import { logger } from './utils/logger';
import { unwrapString } from '../../shared/utils/dynamo';

const docClient = new DynamoDB.DocumentClient();
const USER_PROFILE_TABLE_NAME = process.env['USER_PROFILE_TABLE_NAME']!;
if (!USER_PROFILE_TABLE_NAME) throw new Error("Missing environment variable: USER_PROFILE_TABLE_NAME");

export const handler = async (event: any) => {
  try {
    logger.info('Processing request', { event });

    const identityId = getIdentityId(event.identity);
    if (!identityId) {
      logger.error('No identity provided');
      return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized: No identity provided.' }) };
    }

    let surveyAnswers: SurveyAnswers;
    let existingUserProfile: any = null;

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
      return { statusCode: 404, body: JSON.stringify({ message: 'Survey not found for user' }) };
    }

    existingUserProfile = surveyResult.Items[0];
    const rawAnswers = unwrapString(existingUserProfile.surveyAnswers);
    surveyAnswers = JSON.parse(rawAnswers);

    if (!surveyAnswers) {
      logger.error('Survey answers are missing for user', { identityId, existingUserProfile });
      return { statusCode: 400, body: JSON.stringify({ message: 'Survey answers not found in user profile.' }) };
    }

    logger.info('Survey answers retrieved', { surveyAnswers });

    try {
      validateSurveyAnswers(surveyAnswers);
    } catch (error: any) {
      logger.error('Invalid survey data', { error: error.message });
      return { statusCode: 400, body: JSON.stringify({ message: error.message }) };
    }

    const traits = calculatePersonalityTraits(surveyAnswers);
    const selfProfile = generateSelfProfile(traits, surveyAnswers);
    const seekingProfile = generateSeekingProfile(traits, surveyAnswers);

    let userProfile = existingUserProfile;

    const updatedUserProfile = {
      ...userProfile,
      updatedAt: new Date().toISOString(),
      selfProfile,
      seekingProfile,
      animalCreatedAt: new Date().toISOString(),
    };

    await docClient.put({
      TableName: USER_PROFILE_TABLE_NAME,
      Item: updatedUserProfile
    }).promise();

    logger.info('Updated user profile with animal data', { userId: identityId });

    return {
      statusCode: 200,
      body: JSON.stringify({ selfProfile, seekingProfile })
    };
  } catch (error: any) {
    logger.error('Error processing request', { error: error.message });
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error' }) };
  }
};

function validateSurveyAnswers(answers: SurveyAnswers): void {
  const requiredQuestions = [16, 18, 20, 22, 25, 26, 27, 29, 30];
  for (const questionId of requiredQuestions) {
    if (answers[questionId] === undefined) {
      throw new Error(`Missing required answer for question ${questionId}`);
    }
  }
}