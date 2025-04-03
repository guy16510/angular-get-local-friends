import type { Schema } from '../../data/resource';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { sanitizeBigInts } from '../../shared/utils/sanitize';
import { getIdentityId } from '../../shared/utils/identity';
import crypto from 'crypto';

const TABLE_NAME = process.env['USER_PROFILE_TABLE_NAME']!;
if (!TABLE_NAME) throw new Error("Missing environment variable: USER_PROFILE_TABLE_NAME");

const ddbClient = new DynamoDB({});
const docClient = DynamoDBDocument.from(ddbClient);

interface CategoryMatch {
  category: string;
  matches: number;
  total: number;
  percentage: number;
}

interface CompatibilityInsights {
  id: string;
  totalMatches: number;
  totalQuestions: number;
  overallPercentage: number;
  categoryMatches: CategoryMatch[];
  createdAt: string;
  updatedAt: string;
}

const QUESTION_CATEGORIES = [
  { start: 1, end: 15, name: "Friendship preferences" },
  { start: 16, end: 24, name: "Interests and activities" },
  { start: 25, end: 34, name: "Social Energy" },
  { start: 35, end: 39, name: "Communication style" },
  { start: 40, end: 47, name: "Spending habits" },
  { start: 48, end: 56, name: "Work & Career" },
  { start: 57, end: 62, name: "Entertainment" },
  { start: 63, end: 68, name: "Lifestyle and Habits" },
  { start: 69, end: 75, name: "Physical Activity & Fitness" },
  { start: 76, end: 90, name: "Personal Preferences & Dealbreakers" }
];

type SurveyAnswerValue = string | string[] | boolean;
type SurveyAnswersMap = Record<number, SurveyAnswerValue>;

function parseSurveyAnswers(answersString: string): SurveyAnswersMap {
  try {
    console.log('Parsing survey answers string length:', answersString?.length || 0);
    
    if (!answersString) {
      console.warn('Empty survey answers string provided');
      return {};
    }
    
    const parsed = JSON.parse(answersString);
    console.log('Parsed survey answers summary:', {
      keys: Object.keys(parsed).length,
      sampleKeys: Object.keys(parsed).slice(0, 5)
    });
    
    const result: SurveyAnswersMap = {};
    for (const [questionId, answer] of Object.entries(parsed)) {
      result[parseInt(questionId)] = answer as SurveyAnswerValue;
    }
    
    console.log('Processed survey answers map with keys:', Object.keys(result).length);
    return result;
  } catch (err) {
    console.error('Failed to parse survey answers:', err);
    return {};
  }
}

function compareAnswers(
  user1Answers: SurveyAnswersMap,
  user2Answers: SurveyAnswersMap
): Omit<CompatibilityInsights, 'id' | 'createdAt' | 'updatedAt'> {
  const categoryMatches: CategoryMatch[] = [];
  let totalMatches = 0;
  let totalQuestions = 0;

  for (const category of QUESTION_CATEGORIES) {
    let matches = 0;
    let total = 0;

    for (let questionId = category.start; questionId <= category.end; questionId++) {
      const answer1 = user1Answers[questionId];
      const answer2 = user2Answers[questionId];

      if (answer1 !== undefined && answer2 !== undefined) {
        total++;
        if (Array.isArray(answer1) && Array.isArray(answer2)) {
          const commonAnswers = answer1.filter(a => answer2.includes(a));
          if (commonAnswers.length > 0) {
            matches++;
          }
        } else if (answer1 === answer2) {
          matches++;
        }
      }
    }

    if (total > 0) {
      categoryMatches.push({
        category: category.name,
        matches,
        total,
        percentage: (matches / total) * 100
      });
    }

    totalMatches += matches;
    totalQuestions += total;
  }

  if (categoryMatches.length === 0) {
    categoryMatches.push({
      category: "No matching categories",
      matches: 0,
      total: 0,
      percentage: 0
    });
  }

  return {
    totalMatches,
    totalQuestions,
    overallPercentage: totalQuestions > 0 ? (totalMatches / totalQuestions) * 100 : 0,
    categoryMatches
  };
}

interface GenerateCompatibilityInsightsEvent {
  arguments: {
    targetUserId: string;
  };
  identity: {
    sub: string;
  };
}

export const handler = async (event: GenerateCompatibilityInsightsEvent): Promise<CompatibilityInsights> => {
  console.log('Handler triggered with event:', JSON.stringify(event, null, 2));
  
  const { targetUserId } = event.arguments;
  if (!targetUserId) {
    console.error('Missing required parameter: targetUserId');
    throw new Error("Missing required parameter: targetUserId");
  }

  const identityId = getIdentityId(event.identity);
  console.log('[getIdentityId] Using Cognito User Pool unique identifier (sub):', identityId);
  
  if (!identityId) {
    console.error('Unauthorized: No identity found in event signature');
    throw new Error("Unauthorized: No identity found in event signature");
  }

  console.log('Fetching user profiles for:', { identityId, targetUserId });
  
  const [userProfile, targetProfile] = await Promise.all([
    docClient.query({
      TableName: TABLE_NAME,
      IndexName: 'identityId-index',
      KeyConditionExpression: 'identityId = :identityId',
      ExpressionAttributeValues: {
        ':identityId': identityId
      }
    }),
    docClient.query({
      TableName: TABLE_NAME,
      IndexName: 'identityId-index',
      KeyConditionExpression: 'identityId = :identityId',
      ExpressionAttributeValues: {
        ':identityId': targetUserId
      }
    })
  ]);

  console.log('User profile query result count:', userProfile.Items?.length || 0);
  console.log('Target profile query result count:', targetProfile.Items?.length || 0);

  if (!userProfile.Items?.[0] || !targetProfile.Items?.[0]) {
    console.error('One or both user profiles not found:', { 
      userProfileFound: !!userProfile.Items?.[0], 
      targetProfileFound: !!targetProfile.Items?.[0] 
    });
    throw new Error("One or both user profiles not found");
  }

  const userData = sanitizeBigInts(userProfile.Items[0]);
  console.log('User data premium status:', !!userData.premiumEnrolledAt);
  
  if (!userData.premiumEnrolledAt) {
    console.error('Premium subscription required for compatibility insights');
    throw new Error("Premium subscription required for compatibility insights");
  }

  if (!userData.surveyAnswers) {
    console.error('User has no survey answers');
    throw new Error("User has not completed the survey");
  }
  
  if (!targetProfile.Items[0]['surveyAnswers']) {
    console.error('Target user has no survey answers');
    throw new Error("Target user has not completed the survey");
  }
  
  console.log('Parsing survey answers');
  const userAnswers = parseSurveyAnswers(userData.surveyAnswers);
  const targetAnswers = parseSurveyAnswers(targetProfile.Items[0]['surveyAnswers']);
  
  console.log('User answers count:', Object.keys(userAnswers).length);
  console.log('Target answers count:', Object.keys(targetAnswers).length);
  
  if (Object.keys(userAnswers).length === 0 || Object.keys(targetAnswers).length === 0) {
    console.error('Not enough survey answers to generate insights');
    throw new Error("Not enough survey answers to generate insights");
  }

  console.log('Generating compatibility insights');
  const insights = compareAnswers(userAnswers, targetAnswers);
  console.log('Generated insights summary:', {
    totalMatches: insights.totalMatches,
    totalQuestions: insights.totalQuestions,
    overallPercentage: insights.overallPercentage,
    categoryCount: insights.categoryMatches.length
  });

  const now = new Date().toISOString();
  const result: CompatibilityInsights = {
    id: crypto.randomUUID(),
    ...insights,
    createdAt: now,
    updatedAt: now
  };

  console.log('Returning result with id:', result.id);
  return result;
};