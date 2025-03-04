export type QuestionType = 'multiple-choice' | 'multiple-select' | 'true-false' | 'fill-in' | 'sliding-scale';

export interface SurveyQuestion {
  id: number;
  category: string;
  question: string;
  type: QuestionType;
  options?: string[];
  scale?: { min: number; max: number };
}

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: 1,
    category: 'Friendship Preferences',
    question: 'What is your age?',
    type: 'multiple-choice',
    options: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
  },
  {
    id: 2,
    category: 'Friendship Preferences',
    question: 'What age group are you looking to make friends with?',
    type: 'multiple-select',
    options: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
  },
  {
    id: 3,
    category: 'Friendship Preferences',
    question: 'What is your gender?',
    type: 'multiple-choice',
    options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
  },
//   {
//     id: 4,
//     category: 'Friendship Preferences',
//     question: 'Do you have a preference for the gender of your friends?',
//     type: 'multiple-choice',
//     options: ['No preference', 'Male', 'Female', 'Non-binary'],
//   },
//   {
//     id: 5,
//     category: 'Friendship Preferences',
//     question: 'Do you have kids?',
//     type: 'multiple-choice',
//     options: ['Yes', 'No', 'Expecting', 'Prefer not to say'],
//   },
//   {
//     id: 6,
//     category: 'Friendship Preferences',
//     question: 'Would you like to make friends who also have kids?',
//     type: 'multiple-choice',
//     options: ['Yes', 'No preference', 'No'],
//   },
//   {
//     id: 7,
//     category: 'Friendship Preferences',
//     question: 'What age group are your children in (if applicable)?',
//     type: 'multiple-select',
//     options: ['Infant (0-1)', 'Toddler (2-4)', 'Young Child (5-9)', 'Pre-Teen (10-12)', 'Teen (13-18)', 'Adult (18+)', 'N/A'],
//   },
//   {
//     id: 8,
//     category: 'Friendship Preferences',
//     question: 'Would you like to meet friends with kids of a similar age?',
//     type: 'true-false',
//   },
//   {
//     id: 9,
//     category: 'Friendship Preferences',
//     question: 'How important is it for you to have kid-friendly meetups?',
//     type: 'multiple-choice',
//     options: ['Very important', 'Somewhat important', 'Not important'],
//   },
//   {
//     id: 10,
//     category: 'Friendship Preferences',
//     question: 'Are you looking for friends who are parents or non-parents?',
//     type: 'multiple-choice',
//     options: ['Only parents', 'Only non-parents', 'No preference'],
//   },
//   {
//     id: 11,
//     category: 'Friendship Preferences',
//     question: 'How often do you want to meet new friends?',
//     type: 'multiple-choice',
//     options: ['Multiple times a week', 'Once a week', 'A few times a month', 'Rarely'],
//   },
//   {
//     id: 12,
//     category: 'Friendship Preferences',
//     question: 'What’s the main reason you’re looking for new friends?',
//     type: 'multiple-choice',
//     options: ['Moved to a new area', 'Looking for more social connections', 'Want friends with similar hobbies', 'Other'],
//   },
//   {
//     id: 13,
//     category: 'Friendship Preferences',
//     question: 'Would you be open to long-distance friendships, or are you looking for local friends?',
//     type: 'multiple-choice',
//     options: ['Only local', 'Open to both', 'Only online friendships'],
//   },
//   {
//     id: 14,
//     category: 'Friendship Preferences',
//     question: 'Are you interested in making friends for specific activities?',
//     type: 'multiple-select',
//     options: ['Casual hangouts', 'Outdoor activities', 'Game nights', 'Travel buddies', 'Co-working/study groups'],
//   },
//   {
//     id: 15,
//     category: 'Friendship Preferences',
//     question: 'How far are you willing to travel for social meetups?',
//     type: 'multiple-choice',
//     options: ['Within 5 miles', '10-20 miles', 'More than 20 miles', 'Depends on the event'],
//   },
//  {
//     id: 16,
//     category: 'Interests & Activities',
//     question: 'How do you prefer to spend your free time?',
//     type: 'multiple-select',
//     options: [
//       'Outdoors (hiking, camping, fishing, biking)',
//       'Socializing (bars, game nights, clubbing)',
//       'Creative hobbies (art, writing, music, crafts)',
//       'Fitness (gym, yoga, running, sports)',
//       'Parenting-focused activities',
//       'Gaming (board games, video games, D&D)',
//       'Cooking or trying new restaurants',
//       'Traveling and exploring new places',
//       'Other'
//     ]
//   },
//   {
//     id: 17,
//     category: 'Interests & Activities',
//     question: 'What type of events would you be most excited to join?',
//     type: 'multiple-select',
//     options: [
//       'Casual coffee meetups',
//       'Group game nights',
//       'Outdoor adventures',
//       'Skill-sharing workshops',
//       'Family-friendly gatherings',
//       'Bar crawls or nightlife events'
//     ]
//   },
//   {
//     id: 18,
//     category: 'Interests & Activities',
//     question: 'Would you rather spend a weekend:',
//     type: 'multiple-choice',
//     options: [
//       'Exploring a new city',
//       'Staying home and relaxing',
//       'Doing an outdoor activity',
//       'Hosting or attending a party'
//     ]
//   },
//   {
//     id: 19,
//     category: 'Interests & Activities',
//     question: 'Are you interested in joining hobby-based groups?',
//     type: 'true-false'
//   },
//   {
//     id: 20,
//     category: 'Interests & Activities',
//     question: 'Do you enjoy spontaneous plans, or do you prefer scheduling things in advance?',
//     type: 'multiple-choice',
//     options: ['Spontaneous plans', 'Scheduled in advance']
//   },
//   {
//     id: 21,
//     category: 'Interests & Activities',
//     question: 'What’s your ideal way to meet new people?',
//     type: 'multiple-choice',
//     options: [
//       'Through shared activities',
//       'One-on-one conversations',
//       'Group outings'
//     ]
//   },
//   {
//     id: 22,
//     category: 'Interests & Activities',
//     question: 'Are you more into active or relaxed activities?',
//     type: 'multiple-choice',
//     options: ['Active', 'Relaxed']
//   },
//   {
//     id: 23,
//     category: 'Interests & Activities',
//     question: 'Would you be interested in co-working/study groups?',
//     type: 'true-false'
//   },
//   {
//     id: 24,
//     category: 'Interests & Activities',
//     question: 'Do you prefer indoor or outdoor activities?',
//     type: 'multiple-choice',
//     options: ['Indoor', 'Outdoor']
//   },

//   // Section 2: Social Energy (Questions 11–20)
//   {
//     id: 25,
//     category: 'Social Energy',
//     question: 'How do you feel about large social gatherings?',
//     type: 'multiple-choice',
//     options: [
//       'Love them! The more, the merrier.',
//       'Enjoy them occasionally.',
//       'Prefer small groups or one-on-one.',
//       'Avoid them at all costs.'
//     ]
//   },
//   {
//     id: 26,
//     category: 'Social Energy',
//     question: 'How quickly do you warm up to new people?',
//     type: 'multiple-choice',
//     options: ['Instantly', 'After a couple of interactions', 'Takes me a while']
//   },
//   {
//     id: 27,
//     category: 'Social Energy',
//     question: 'How often do you like to meet up with friends?',
//     type: 'multiple-choice',
//     options: [
//       'Daily',
//       'Weekly',
//       'A couple of times a month',
//       'Rarely, but I like staying in touch online'
//     ]
//   },
//   {
//     id: 28,
//     category: 'Social Energy',
//     question: 'Would you be open to meeting friends through group trips or weekend getaways?',
//     type: 'true-false'
//   },
//   {
//     id: 29,
//     category: 'Social Energy',
//     question: 'What’s your ideal friend hangout size?',
//     type: 'multiple-choice',
//     options: [
//       '1-on-1',
//       'Small group (2-3 other people)',
//       'Medium group (4-6 other people)',
//       'Big group (7+)'
//     ]
//   },
//   {
//     id: 30,
//     category: 'Social Energy',
//     question: 'How do you recharge after socializing?',
//     type: 'multiple-choice',
//     options: [
//       'Spending time alone',
//       'Hanging out with a small, close-knit group',
//       'More socializing!'
//     ]
//   },
//   {
//     id: 31,
//     category: 'Social Energy',
//     question: 'Do you like hosting gatherings, or do you prefer being invited?',
//     type: 'multiple-select',
//     options: ['Hosting', 'Being invited']
//   },
//   {
//     id: 32,
//     category: 'Social Energy',
//     question: 'What’s your energy level like when meeting new people? (1 being low, 5 being high)',
//     type: 'sliding-scale',
//     scale: { min: 1, max: 5 }
//   },
//   {
//     id: 33,
//     category: 'Social Energy',
//     question: 'Are you comfortable making the first move in a friendship?',
//     type: 'multiple-choice',
//     options: ['Yes, I make the first move', 'I wait for others']
//   },
//   {
//     id: 34,
//     category: 'Social Energy',
//     question: 'Do you enjoy deep, meaningful conversations or casual, lighthearted chats?',
//     type: 'multiple-choice',
//     options: ['Deep, meaningful', 'Casual, lighthearted']
//   },

//   // Section 3: Communication Style (Questions 21–30)
//   {
//     id: 35,
//     category: 'Communication Style',
//     question: 'How do you usually communicate with friends?',
//     type: 'multiple-choice',
//     options: ['Text', 'Call', 'In-person', 'Video chat']
//   },
//   {
//     id: 36,
//     category: 'Communication Style',
//     question: 'How often do you check in with friends?',
//     type: 'multiple-choice',
//     options: ['Daily', 'Weekly', 'Monthly', 'Rarely']
//   },
//   {
//     id: 37, //TODO
//     category: 'Communication Style',
//     question: 'Do you like talking about feelings and emotions with friends?',
//     type: 'true-false'
//   },
//   {
//     id: 38,
//     category: 'Communication Style',
//     question: 'Are you more of a listener or a talker in conversations?',
//     type: 'multiple-choice',
//     options: ['Listener', 'Talker']
//   },
//   {
//     id: 39,
//     category: 'Communication Style',
//     question: 'When making plans, do you prefer:',
//     type: 'multiple-choice',
//     options: ['Last-minute planning', 'Planning in advance']
//   },

//   // Section 4: Money & Spending Habits (Questions 31–40)
//   {
//     id: 40,
//     category: 'Money & Spending Habits',
//     question: 'How much are you comfortable spending on a typical night out with friends?',
//     type: 'multiple-choice',
//     options: ['$0-$20', '$21-$50', '$51-$100', '$101+']
//   },
//   {
//     id: 41,
//     category: 'Money & Spending Habits',
//     question: 'When dining out, do you prefer:',
//     type: 'multiple-choice',
//     options: [
//       'Fast Food', 
//       'Casual dining', 
//       'Pub', 'Buffet',
//       'Food Truck',
//       'Fine Dining',
//       'Diner',
//       'Pizzeria',
//       'BBQ Restaurant',
//       'Other'
//     ]
//   },
//   {
//     id: 42,
//     category: 'Money & Spending Habits',
//     question: 'Do you prefer free social activities (e.g., hikes, potlucks) over paid ones?',
//     type: 'true-false'
//   },
//   {
//     id: 43,
//     category: 'Money & Spending Habits',
//     question: 'Are you comfortable discussing money with friends?',
//     type: 'true-false'
//   },
//   {
//     id: 44,
//     category: 'Money & Spending Habits',
//     question: 'Are you interested in friends who are financially like-minded?',
//     type: 'true-false'
//   },
//   {
//     id: 45,
//     category: 'Money & Spending Habits',
//     question: 'How do you feel about group vacations with friends?',
//     type: 'multiple-choice',
//     options: ['Love them', 'They’re okay', 'Not a fan']
//   },
//   {
//     id: 56,
//     category: 'Money & Spending Habits',
//     question: 'Would you join a group gift for a friend’s birthday, or do you prefer giving individual gifts?',
//     type: 'multiple-choice',
//     options: ['Group gift', 'Individual gifts']
//   },
//   {
//     id: 47,
//     category: 'Money & Spending Habits',
//     question: 'Do you think friends should talk about their salaries?',
//     type: 'true-false'
//   },

//   // Section 5: Work & Career (Questions 41–50)
//   {
//     id: 48,
//     category: 'Work & Career',
//     question: 'What do you do for work?',
//     type: 'multiple-choice',
//     options: [      
//       'Technology',
//       'Education',
//       'Healthcare',
//       'Finance',
//       'Retail',
//       'Hospitality',
//       'Manufacturing',
//       'Other'
//     ]
//   },
//   {
//     id: 49,
//     category: 'Work & Career',
//     question: 'How do you feel about discussing work with friends?',
//     type: 'multiple-choice',
//     options: ['Comfortable', 'Uncomfortable']
//   },
//   {
//     id: 50,
//     category: 'Work & Career',
//     question: 'Do you prefer friends who work in the same industry?',
//     type: 'true-false'
//   },
//   {
//     id: 51,
//     category: 'Work & Career',
//     question: 'What’s your work schedule like?',
//     type: 'multiple-choice',
//     options: ['9-5', 'Part time', 'Mornings', 'Nights', 'N/A']
//   },
//   {
//     id: 52,
//     category: 'Work & Career',
//     question: 'How much does your job impact your availability for socializing?',
//     type: 'multiple-choice',
//     options: ['A little', 'A lot', 'Not at all']
//   },
//   {
//     id: 53,
//     category: 'Work & Career',
//     question: 'Do you want friends who understand your work struggles?',
//     type: 'true-false'
//   },
//   {
//     id: 54,
//     category: 'Work & Career',
//     question: 'Would you like to connect with people in similar career paths for networking or mentorship?',
//     type: 'true-false'
//   },
//   {
//     id: 55,
//     category: 'Work & Career',
//     question: 'How do you feel about friends who earn significantly more or less than you?',
//     type: 'multiple-choice',
//     options: ['No issue', 'It matters']
//   },
//   {
//     id: 56,
//     category: 'Work & Career',
//     question: 'Would you prefer friends who have a similar work-life balance as you?',
//     type: 'multiple-choice',
//     options: ['Yes', 'No', 'No preference']
//   },

//   // Section 6: Entertainment (Questions 51–56)
//   {
//     id: 57,
//     category: 'Entertainment',
//     question: 'What type of movies do you enjoy the most?',
//     type: 'multiple-select',
//     options: ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-fi', 'Romance', 'Documentary']
//   },
//   {
//     id: 58,
//     category: 'Entertainment',
//     question: 'Do you enjoy binge-watching entire seasons, or do you prefer watching episodes over time?',
//     type: 'multiple-choice',
//     options: ['Binge-watching entire season', 'Watching 1-2 episodes at a time']
//   },
//   {
//     id: 59,
//     category: 'Entertainment',
//     question: 'Do you enjoy live music events like concerts or festivals?',
//     type: 'true-false'
//   },
//   {
//     id: 60,
//     category: 'Entertainment',
//     question: 'What’s your go-to music genre?',
//     type: 'multiple-select',
//     options: ['Pop', 'Rock', 'Hip-hop', 'Country', 'Classical', 'Electronic', 'Jazz', 'Other']
//   },
//   {
//     id: 61,
//     category: 'Entertainment',
//     question: 'Do you play any musical instruments or sing?',
//     type: 'true-false'
//   },
//   {
//     id: 62,
//     category: 'Entertainment',
//     question: 'Would you be interested in music-themed friend activities (concert meetups, jam sessions, playlist swaps)?',
//     type: 'multiple-choice',
//     options: ['Yes', 'Maybe', 'No']
//   },

//   // Section 7: Lifestyle & Habits (Questions 57–63)
//   {
//     id: 63,
//     category: 'Lifestyle & Habits',
//     question: 'Do you drink alcohol socially?',
//     type: 'true-false'
//   },
//   {
//     id: 64,
//     category: 'Lifestyle & Habits',
//     question: 'What’s your ideal social drinking environment?',
//     type: 'multiple-choice',
//     options: ['Casual bar', 'Lively club', 'Cozy pub', 'No preference']
//   },
//   {
//     id: 65,
//     category: 'Lifestyle & Habits',
//     question: 'How do you feel about being around people who drink?',
//     type: 'multiple-choice',
//     options: ['Comfortable', 'Neutral', 'Uncomfortable']
//   },
//   {
//     id: 66,
//     category: 'Lifestyle & Habits',
//     question: 'Do you smoke cigarettes or vape?',
//     type: 'true-false'
//   },
//   {
//     id: 67,
//     category: 'Lifestyle & Habits',
//     question: 'Do you use cannabis?',
//     type: 'multiple-choice',
//     options: ['Yes', 'No', 'Prefer not to answer']
//   },
//   {
//     id: 68,
//     category: 'Lifestyle & Habits',
//     question: 'Are you comfortable being around cannabis use?',
//     type: 'multiple-choice',
//     options: ['Yes', 'Depends', 'No']
//   },

//   // Section 8: Physical Activity & Fitness (Questions 64–70)
//   {
//     id: 69,
//     category: 'Physical Activity & Fitness',
//     question: 'How physically active are you?',
//     type: 'multiple-choice',
//     options: ['Not active', 'Somewhat active', 'Very active']
//   },
//   {
//     id: 70,
//     category: 'Physical Activity & Fitness',
//     question: 'What types of physical activities do you enjoy?',
//     type: 'multiple-select',
//     options: ['Running', 'Cycling', 'Gym workouts', 'Yoga', 'Team sports', 'None']
//   },
//   {
//     id: 71,
//     category: 'Physical Activity & Fitness',
//     question: 'Would you be interested in a fitness buddy to stay active with?',
//     type: 'true-false'
//   },
//   {
//     id: 72,
//     category: 'Physical Activity & Fitness',
//     question: 'Do you prefer exercising alone or with others?',
//     type: 'multiple-choice',
//     options: ['Alone', 'With others']
//   },
//   {
//     id: 73,
//     category: 'Physical Activity & Fitness',
//     question: 'Do you enjoy outdoor adventure activities?',
//     type: 'true-false'
//   },
//   {
//     id: 74,
//     category: 'Physical Activity & Fitness',
//     question: 'Would you be interested in joining a recreational sports league?',
//     type: 'true-false'
//   },
//   {
//     id: 75,
//     category: 'Physical Activity & Fitness',
//     question: 'Do you think fitness level affects friendships?',
//     type: 'multiple-choice',
//     options: ['Not at all', 'Somewhat', 'Significantly']
//   },

//   // Section 9: Personal Preferences & Dealbreakers (Questions 71–100)
//   {
//     id: 76,
//     category: 'Personal Preferences & Dealbreakers',
//     question: 'Do you have any pets?',
//     type: 'multiple-choice',
//     options: ['Yes', 'No']
//   },
//   {
//     id: 77,
//     category: 'Personal Preferences & Dealbreakers',
//     question: 'If yes, what type of pet do you have?',
//     type: 'multiple-select',
//     options: ['Dog(s)', 'Cat(s)', 'Fish', 'Bird(s)', 'Rabbit(s)', 'Reptile(s)', 'Horse(s)']
//   },
//   {
//     id: 78,
//     category: 'Personal Preferences & Dealbreakers',
//     question: 'How important is it that your friends are pet lovers?',
//     type: 'multiple-choice',
//     options: ['Important', 'Somewhat Important', 'Not Important']
//   },
//   {
//     id: 79,
//     category: 'Personal Preferences & Dealbreakers',
//     question: 'What is your political leaning?',
//     type: 'multiple-choice',
//     options: ['Liberal', 'Moderate', 'Conservative', 'Other']
//   },
//   {
//     id: 80,
//     category: 'Personal Preferences & Dealbreakers',
//     question: 'How important are shared social values in your friendships?',
//     type: 'multiple-choice',
//     options: ['Important', 'Somewhat Important', 'Not Important']
//   },
//   {
//     id: 81,
//     category: 'Personal Preferences & Dealbreakers',
//     question: 'Do you enjoy discussing politics with friends?',
//     type: 'true-false'
//   },
//   {
//     id: 82,
//     category: 'Personal Preferences & Dealbreakers',
//     question: 'What is your stance on environmental issues?',
//     type: 'multiple-choice',
//     options: ['Active', 'Concerned', 'Neutral', 'Not interested']
//   },
//   {
//     id: 83,
//     category: 'Personal Preferences & Dealbreakers',
//     question: 'How often do you like to travel?',
//     type: 'multiple-choice',
//     options: ['Frequently', 'Occasionally', 'Rarely', 'Never']
//   },
//   {
//     id: 84,
//     category: 'Personal Preferences & Dealbreakers',
//     question: 'Are you open to trying new cuisines?',
//     type: 'true-false'
//   },
//   {
//     id: 85,
//     category: 'Personal Preferences & Dealbreakers',
//     question: 'Do you enjoy attending cultural events (museums, theater, etc.)?',
//     type: 'true-false'
//   },
//   {
//     id: 86,
//     category: 'Personal Preferences & Dealbreakers',
//     question: 'How important is humor in your friendships?',
//     type: 'multiple-choice',
//     options: ['Important', 'Somewhat Important', 'Not Important']
//   },
//   {
//     id: 87,
//     category: 'Personal Preferences & Dealbreakers',
//     question: 'Do you enjoy outdoor activities like picnics or beach days?',
//     type: 'true-false'
//   },
//   {
//     id: 88,
//     category: 'Personal Preferences & Dealbreakers',
//     question: 'How do you feel about sharing personal information with friends?',
//     type: 'multiple-choice',
//     options: ['Open', 'Reserved', 'Depends on the friend']
//   },
//   {
//     id: 89,
//     category: 'Personal Preferences & Dealbreakers',
//     question: 'Do you prefer friends who are more introverted or extroverted?',
//     type: 'multiple-choice',
//     options: ['Introverted', 'Extroverted', 'No preference']
//   },
//   {
//     id: 90,
//     category: 'Personal Preferences & Dealbreakers',
//     question: 'How important is it to you to have friends with similar hobbies?',
//     type: 'multiple-choice',
//     options: ['Important', 'Somewhat Important', 'Not Important']
//   },
];