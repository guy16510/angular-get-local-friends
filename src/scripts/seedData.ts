import 'dotenv/config'; // Load environment variables
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { SURVEY_QUESTIONS } from '../app/data/surveyQuestions'; // TypeScript import

// AWS Config
AWS.config.update({ region: process.env['AWS_REGION'] });

const cognito = new AWS.CognitoIdentityServiceProvider();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const USER_POOL_ID = process.env['USER_POOL_ID'] as string;
const CLIENT_ID = process.env['CLIENT_ID'] as string;
const TABLE_NAME = process.env['TABLE_NAME'] as string;

async function createCognitoUser(email: string, password: string) {
    const params = {
        UserPoolId: USER_POOL_ID,
        Username: email,
        UserAttributes: [{ Name: 'email', Value: email }, { Name: 'email_verified', Value: 'true' }],
        TemporaryPassword: password,
    };
    await cognito.adminCreateUser(params).promise();
}

function generateRandomAnswers() {
    return SURVEY_QUESTIONS.map(question => ({
        questionId: question.id,
        answer: Array.isArray(question.options)
            ? faker.helpers.arrayElement(question.options)
            : faker.lorem.sentence(),
    }));
}

async function insertIntoDynamoDB(userId: string, answers: any) {
    const params = {
        TableName: TABLE_NAME,
        Item: {
            userId,
            responses: answers,
            createdAt: new Date().toISOString(),
        },
    };
    await dynamoDB.put(params).promise();
}

async function seedUsersAndData() {
    for (let i = 0; i < 25; i++) {
        const email = `user${i}@example.com`;
        const password = `TempPass!123`;
        try {
            await createCognitoUser(email, password);
            const userId = uuidv4();
            const answers = generateRandomAnswers();
            await insertIntoDynamoDB(userId, answers);
            console.log(`Created and seeded user: ${email}`);
        } catch (err) {
            console.error(`Error creating user ${email}:`, err);
        }
    }
}

seedUsersAndData();