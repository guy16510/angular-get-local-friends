import type { Schema } from '../../data/resource';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { sanitizeBigInts } from '../../shared/utils/sanitize';
import { getIdentityId } from '../../shared/utils/identity';

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
  totalMatches: number;
  totalQuestions: number;
  overallPercentage: number;
  categoryMatches: CategoryMatch[];
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

/**
 * Parse the JSON string of survey answers into an object map.
 * Keys are numbers (question IDs) for O(1) lookups.
 */
function parseSurveyAnswers(answersString: string): SurveyAnswersMap {
  try {
    const parsed = JSON.parse(answersString);
    const result: SurveyAnswersMap = {};
    for (const [questionId, answer] of Object.entries(parsed)) {
      result[parseInt(questionId)] = answer as SurveyAnswerValue;
    }
    return result;
  } catch (err) {
    console.error('Failed to parse survey answers:', err);
    return {};
  }
}

/**
 * Compare two users' survey answers by iterating over pre-defined question ranges.
 * Directly looks up answers from the maps (O(1) per question).
 */
function compareAnswers(
  user1Answers: SurveyAnswersMap,
  user2Answers: SurveyAnswersMap
): CompatibilityInsights {
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

    categoryMatches.push({
      category: category.name,
      matches,
      total,
      percentage: total > 0 ? (matches / total) * 100 : 0
    });

    totalMatches += matches;
    totalQuestions += total;
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

export const handler = async (event: GenerateCompatibilityInsightsEvent) => {
  const { targetUserId } = event.arguments;
  if (!targetUserId) {
    throw new Error("Missing required parameter: targetUserId");
  }

  try {
    // Get the caller's identity from the event signature
    const identityId = getIdentityId(event.identity);
    if (!identityId) {
      throw new Error("Unauthorized: No identity found in event signature");
    }

    // Get both user profiles in parallel
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

    if (!userProfile.Items?.[0] || !targetProfile.Items?.[0]) {
      throw new Error("One or both user profiles not found");
    }

    // Check if the requesting user has premium access
    const userData = sanitizeBigInts(userProfile.Items[0]);
    if (!userData.premiumEnrolledAt) {
      throw new Error("Premium subscription required for compatibility insights");
    }

    // Parse survey answers using our efficient map approach
    const userAnswers = parseSurveyAnswers(userData.surveyAnswers);
    const targetAnswers = parseSurveyAnswers(targetProfile.Items[0]['surveyAnswers']);

    // Generate compatibility insights
    const insights = compareAnswers(userAnswers, targetAnswers);

    return {
      success: true,
      data: insights
    };
  } catch (err) {
    console.error('Error generating compatibility insights:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred'
    };
  }
};