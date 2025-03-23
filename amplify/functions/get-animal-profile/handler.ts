// ===== amplify/functions/get-animal-profile/handler.ts =====
import { DynamoDB } from 'aws-sdk';
import { SurveyAnswers } from './types';
import { calculatePersonalityTraits } from './traits-calculator';
import { generateSelfProfile, generateSeekingProfile } from './profile-generator';
import { generateDeepProfileInsights } from './deep-profile-insights';
import { getIdentityId } from '../../shared/utils/identity';
import { logger } from './utils/logger';
import { unwrapString } from '../../shared/utils/dynamo';
import {
  HandlerResponse,
  GetAnimalProfileResponse
} from './handler-response-types';

const docClient = new DynamoDB.DocumentClient();
const USER_PROFILE_TABLE_NAME = process.env['USER_PROFILE_TABLE_NAME']!;
if (!USER_PROFILE_TABLE_NAME) throw new Error("Missing environment variable: USER_PROFILE_TABLE_NAME");

export const handler = async (event: any): Promise<HandlerResponse> => {
  try {
    logger.info('Processing request', { event });

    const identityId = getIdentityId(event.identity);
    if (!identityId) return errorResponse(401, 'Unauthorized: No identity provided.');

    const userProfile = await getUserProfileByIdentity(identityId);
    if (!userProfile) return errorResponse(404, 'Survey not found for user');

    const surveyAnswers = parseSurveyAnswers(userProfile);
    if (!surveyAnswers) return errorResponse(400, 'Survey answers not found in user profile.');

    try {
      validateSurveyAnswers(surveyAnswers);
    } catch (err: any) {
      logger.error('Invalid survey data', { error: err.message });
      return errorResponse(400, err.message);
    }

    const traits = calculatePersonalityTraits(surveyAnswers);
    const selfProfile = generateSelfProfile(traits, surveyAnswers);
    const seekingProfile = generateSeekingProfile(traits, surveyAnswers);
    const deepInsights = generateDeepProfileInsights(traits, surveyAnswers);

    const updatedUserProfile = {
      ...userProfile,
      updatedAt: new Date().toISOString(),
      animalCreatedAt: new Date().toISOString(),
      selfProfile,
      seekingProfile,
      deepInsights,
      traits
    };

    await docClient.put({
      TableName: USER_PROFILE_TABLE_NAME,
      Item: updatedUserProfile
    }).promise();

    logger.info('Updated user profile with animal data', { userId: identityId });

    const responseBody: GetAnimalProfileResponse = {
      selfProfile,
      seekingProfile,
      deepInsights
    };

    return successResponse(responseBody);
  } catch (error: any) {
    logger.error('Unexpected server error', { error: error.message });
    return errorResponse(500, 'Internal server error');
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

function successResponse(body: GetAnimalProfileResponse): HandlerResponse {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}

function errorResponse(statusCode: 400 | 401 | 404 | 500, message: string): HandlerResponse {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  };
}

async function getUserProfileByIdentity(identityId: string): Promise<any | null> {
  try {
    const result = await docClient.query({
      TableName: USER_PROFILE_TABLE_NAME,
      IndexName: 'identityId-index',
      KeyConditionExpression: 'identityId = :identityId',
      ExpressionAttributeValues: {
        ':identityId': identityId
      }
    }).promise();

    return result.Items && result.Items.length > 0 ? result.Items[0] : null;
  } catch (err) {
    logger.error('Error querying user profile by identity', { error: err });
    throw err;
  }
}

function parseSurveyAnswers(userProfile: any): SurveyAnswers | null {
  try {
    const raw = typeof userProfile.surveyAnswers === 'string'
      ? userProfile.surveyAnswers
      : unwrapString(userProfile.surveyAnswers);
    return JSON.parse(raw);
  } catch (err) {
    logger.error('Failed to parse survey answers', { error: err });
    return null;
  }
}