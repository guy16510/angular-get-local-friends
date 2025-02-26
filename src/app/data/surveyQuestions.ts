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
  // Section 1: Interests & Activities (Questions 1–10)
  {
    id: 1,
    category: 'Interests & Activities',
    question: 'How do you prefer to spend your free time?',
    type: 'multiple-select',
    options: [
      'Outdoors (hiking, camping, fishing, biking)',
      'Socializing (bars, game nights, clubbing)',
      'Creative hobbies (art, writing, music, crafts)',
      'Fitness (gym, yoga, running, sports)',
      'Parenting-focused activities',
      'Gaming (board games, video games, D&D)',
      'Cooking or trying new restaurants',
      'Traveling and exploring new places',
      'Other'
    ]
  },
  {
    id: 2,
    category: 'Interests & Activities',
    question: 'What type of events would you be most excited to join?',
    type: 'multiple-select',
    options: [
      'Casual coffee meetups',
      'Group game nights',
      'Outdoor adventures',
      'Skill-sharing workshops',
      'Family-friendly gatherings',
      'Bar crawls or nightlife events'
    ]
  },
  {
    id: 3,
    category: 'Interests & Activities',
    question: 'Would you rather spend a weekend:',
    type: 'multiple-choice',
    options: [
      'Exploring a new city',
      'Staying home and relaxing',
      'Doing an outdoor activity',
      'Hosting or attending a party'
    ]
  },
  {
    id: 4,
    category: 'Interests & Activities',
    question: 'Are you interested in joining hobby-based groups?',
    type: 'true-false'
  },
  {
    id: 5,
    category: 'Interests & Activities',
    question: 'Do you enjoy spontaneous plans, or do you prefer scheduling things in advance?',
    type: 'multiple-choice',
    options: ['Spontaneous plans', 'Scheduled in advance']
  },
  {
    id: 6,
    category: 'Interests & Activities',
    question: 'What’s your ideal way to meet new people?',
    type: 'multiple-choice',
    options: [
      'Through shared activities',
      'One-on-one conversations',
      'Group outings'
    ]
  },
  {
    id: 7,
    category: 'Interests & Activities',
    question: 'Are you more into active or relaxed activities?',
    type: 'multiple-choice',
    options: ['Active', 'Relaxed']
  },
  // {
  //   id: 8,
  //   category: 'Interests & Activities',
  //   question: 'What’s a dealbreaker activity for you?',
  //   type: 'fill-in'
  // },
  {
    id: 9,
    category: 'Interests & Activities',
    question: 'Would you be interested in co-working/study groups?',
    type: 'true-false'
  },
  {
    id: 10,
    category: 'Interests & Activities',
    question: 'Do you prefer indoor or outdoor activities?',
    type: 'multiple-choice',
    options: ['Indoor', 'Outdoor']
  },

  // Section 2: Social Energy (Questions 11–20)
  {
    id: 11,
    category: 'Social Energy',
    question: 'How do you feel about large social gatherings?',
    type: 'multiple-choice',
    options: [
      'Love them! The more, the merrier.',
      'Enjoy them occasionally.',
      'Prefer small groups or one-on-one.',
      'Avoid them at all costs.'
    ]
  },
  {
    id: 12,
    category: 'Social Energy',
    question: 'How quickly do you warm up to new people?',
    type: 'multiple-choice',
    options: ['Instantly', 'After a couple of interactions', 'Takes me a while']
  },
  {
    id: 13,
    category: 'Social Energy',
    question: 'How often do you like to meet up with friends?',
    type: 'multiple-choice',
    options: [
      'Daily',
      'Weekly',
      'A couple of times a month',
      'Rarely, but I like staying in touch online'
    ]
  },
  {
    id: 14,
    category: 'Social Energy',
    question: 'Would you be open to meeting friends through group trips or weekend getaways?',
    type: 'true-false'
  },
  {
    id: 15,
    category: 'Social Energy',
    question: 'What’s your ideal friend hangout size?',
    type: 'multiple-choice',
    options: [
      '1-on-1',
      'Small group (2-3 other people)',
      'Medium group (4-6 other people)',
      'Big group (7+)'
    ]
  },
  {
    id: 16,
    category: 'Social Energy',
    question: 'How do you recharge after socializing?',
    type: 'multiple-choice',
    options: [
      'Spending time alone',
      'Hanging out with a small, close-knit group',
      'More socializing!'
    ]
  },
  {
    id: 17,
    category: 'Social Energy',
    question: 'Do you like hosting gatherings, or do you prefer being invited?',
    type: 'multiple-choice',
    options: ['Hosting', 'Being invited']
  },
  {
    id: 18,
    category: 'Social Energy',
    question: 'What’s your energy level like when meeting new people?',
    type: 'sliding-scale',
    scale: { min: 1, max: 10 }
  },
  {
    id: 19,
    category: 'Social Energy',
    question: 'Are you comfortable making the first move in a friendship?',
    type: 'multiple-choice',
    options: ['Yes, I make the first move', 'I wait for others']
  },
  {
    id: 20,
    category: 'Social Energy',
    question: 'Do you enjoy deep, meaningful conversations or casual, lighthearted chats?',
    type: 'multiple-choice',
    options: ['Deep, meaningful', 'Casual, lighthearted']
  },

  // Section 3: Communication Style (Questions 21–30)
  {
    id: 21,
    category: 'Communication Style',
    question: 'How do you usually communicate with friends?',
    type: 'multiple-choice',
    options: ['Text', 'Call', 'In-person', 'Video chat']
  },
  {
    id: 22,
    category: 'Communication Style',
    question: 'How often do you check in with friends?',
    type: 'multiple-choice',
    options: ['Daily', 'Weekly', 'Monthly', 'Rarely']
  },
  {
    id: 23,
    category: 'Communication Style',
    question: 'Do you like talking about feelings and emotions with friends?',
    type: 'true-false'
  },
  {
    id: 24,
    category: 'Communication Style',
    question: 'Are you more of a listener or a talker in conversations?',
    type: 'multiple-choice',
    options: ['Listener', 'Talker']
  },
  {
    id: 25,
    category: 'Communication Style',
    question: 'When making plans, do you prefer:',
    type: 'multiple-choice',
    options: ['Last-minute planning', 'Planning in advance']
  },
  {
    id: 26,
    category: 'Communication Style',
    question: 'How do you handle conflict in friendships?',
    type: 'fill-in'
  },
  {
    id: 27,
    category: 'Communication Style',
    question: 'Do you prefer messaging or voice notes?',
    type: 'multiple-choice',
    options: ['Messaging', 'Voice notes']
  },
  {
    id: 28,
    category: 'Communication Style',
    question: 'Do you like group chats, or do you prefer one-on-one convos?',
    type: 'multiple-choice',
    options: ['Group chats', 'One-on-one']
  },
  {
    id: 29,
    category: 'Communication Style',
    question: 'Would you be open to making long-distance friendships that primarily stay online?',
    type: 'true-false'
  },
  {
    id: 30,
    category: 'Communication Style',
    question: 'Are you okay with friends who respond slowly to texts/calls?',
    type: 'true-false'
  },

  // Section 4: Money & Spending Habits (Questions 31–40)
  {
    id: 31,
    category: 'Money & Spending Habits',
    question: 'How much are you comfortable spending on a typical night out with friends?',
    type: 'multiple-choice',
    options: ['$0-$20', '$21-$50', '$51-$100', '$101+']
  },
  {
    id: 32,
    category: 'Money & Spending Habits',
    question: 'When dining out, do you prefer:',
    type: 'multiple-choice',
    options: ['Budget-friendly places', 'Upscale dining']
  },
  {
    id: 33,
    category: 'Money & Spending Habits',
    question: 'Do you prefer free social activities (e.g., hikes, potlucks) over paid ones?',
    type: 'true-false'
  },
  {
    id: 34,
    category: 'Money & Spending Habits',
    question: 'Are you comfortable discussing money with friends?',
    type: 'true-false'
  },
  {
    id: 35,
    category: 'Money & Spending Habits',
    question: 'Are you interested in friends who are financially like-minded?',
    type: 'true-false'
  },
  {
    id: 36,
    category: 'Money & Spending Habits',
    question: 'Are you comfortable lending or borrowing money among friends?',
    type: 'true-false'
  },
  {
    id: 37,
    category: 'Money & Spending Habits',
    question: 'How do you feel about group vacations with friends?',
    type: 'multiple-choice',
    options: ['Love them', 'They’re okay', 'Not a fan']
  },
  {
    id: 38,
    category: 'Money & Spending Habits',
    question: 'Would you join a group gift for a friend’s birthday, or do you prefer giving individual gifts?',
    type: 'multiple-choice',
    options: ['Group gift', 'Individual gifts']
  },
  {
    id: 39,
    category: 'Money & Spending Habits',
    question: 'How important is financial independence in a friendship?',
    type: 'sliding-scale',
    scale: { min: 1, max: 10 }
  },
  {
    id: 40,
    category: 'Money & Spending Habits',
    question: 'Do you think friends should talk about their salaries?',
    type: 'true-false'
  },

  // Section 5: Work & Career (Questions 41–50)
  {
    id: 41,
    category: 'Work & Career',
    question: 'What do you do for work?',
    type: 'fill-in'
  },
  {
    id: 42,
    category: 'Work & Career',
    question: 'How do you feel about discussing work with friends?',
    type: 'multiple-choice',
    options: ['Comfortable', 'Uncomfortable']
  },
  {
    id: 43,
    category: 'Work & Career',
    question: 'Do you prefer friends who work in the same industry?',
    type: 'true-false'
  },
  {
    id: 44,
    category: 'Work & Career',
    question: 'What’s your work schedule like?',
    type: 'multiple-choice',
    options: ['9-5', 'Shift work', 'Freelance', 'Other']
  },
  {
    id: 45,
    category: 'Work & Career',
    question: 'How much does your job impact your availability for socializing?',
    type: 'sliding-scale',
    scale: { min: 1, max: 10 }
  },
  {
    id: 46,
    category: 'Work & Career',
    question: 'Do you want friends who understand your work struggles?',
    type: 'true-false'
  },
  {
    id: 47,
    category: 'Work & Career',
    question: 'Would you like to connect with people in similar career paths for networking or mentorship?',
    type: 'true-false'
  },
  {
    id: 48,
    category: 'Work & Career',
    question: 'Are you interested in co-working or study sessions with friends?',
    type: 'true-false'
  },
  {
    id: 49,
    category: 'Work & Career',
    question: 'How do you feel about friends who earn significantly more or less than you?',
    type: 'multiple-choice',
    options: ['No issue', 'It matters']
  },
  {
    id: 50,
    category: 'Work & Career',
    question: 'Would you prefer friends who have a similar work-life balance as you?',
    type: 'multiple-choice',
    options: ['Yes', 'No', 'No preference']
  },

  // Section 6: Entertainment (Questions 51–56)
  {
    id: 51,
    category: 'Entertainment',
    question: 'What type of movies do you enjoy the most?',
    type: 'multiple-choice',
    options: ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-fi', 'Romance', 'Documentary']
  },
  {
    id: 52,
    category: 'Entertainment',
    question: 'Do you enjoy binge-watching entire seasons, or do you prefer watching episodes over time?',
    type: 'multiple-choice',
    options: ['Binge-watching', 'Watching episodically']
  },
  {
    id: 53,
    category: 'Entertainment',
    question: 'Do you enjoy live music events like concerts or festivals?',
    type: 'true-false'
  },
  {
    id: 54,
    category: 'Entertainment',
    question: 'What’s your go-to music genre?',
    type: 'multiple-choice',
    options: ['Pop', 'Rock', 'Hip-hop', 'Country', 'Classical', 'Electronic', 'Jazz', 'Other']
  },
  {
    id: 55,
    category: 'Entertainment',
    question: 'Do you play any musical instruments or sing?',
    type: 'true-false'
  },
  {
    id: 56,
    category: 'Entertainment',
    question: 'Would you be interested in music-themed friend activities (concert meetups, jam sessions, playlist swaps)?',
    type: 'multiple-choice',
    options: ['Yes', 'Maybe', 'No']
  },

  // Section 7: Lifestyle & Habits (Questions 57–63)
  {
    id: 57,
    category: 'Lifestyle & Habits',
    question: 'Do you drink alcohol socially?',
    type: 'true-false'
  },
  {
    id: 58,
    category: 'Lifestyle & Habits',
    question: 'What’s your ideal social drinking environment?',
    type: 'multiple-choice',
    options: ['Casual bar', 'Lively club', 'Cozy pub', 'No preference']
  },
  {
    id: 59,
    category: 'Lifestyle & Habits',
    question: 'How do you feel about being around people who drink?',
    type: 'multiple-choice',
    options: ['Comfortable', 'Neutral', 'Uncomfortable']
  },
  {
    id: 60,
    category: 'Lifestyle & Habits',
    question: 'Do you smoke cigarettes or vape?',
    type: 'true-false'
  },
  {
    id: 61,
    category: 'Lifestyle & Habits',
    question: 'Do you use cannabis?',
    type: 'true-false'
  },
  {
    id: 62,
    category: 'Lifestyle & Habits',
    question: 'Are you comfortable being around cannabis use?',
    type: 'multiple-choice',
    options: ['Yes', 'Depends', 'No']
  },
  {
    id: 63,
    category: 'Lifestyle & Habits',
    question: 'How important is it that your friends have similar lifestyle habits?',
    type: 'sliding-scale',
    scale: { min: 1, max: 10 }
  },

  // Section 8: Physical Activity & Fitness (Questions 64–70)
  {
    id: 64,
    category: 'Physical Activity & Fitness',
    question: 'How physically active are you?',
    type: 'multiple-choice',
    options: ['Not active', 'Somewhat active', 'Very active']
  },
  {
    id: 65,
    category: 'Physical Activity & Fitness',
    question: 'What types of physical activities do you enjoy?',
    type: 'multiple-select',
    options: ['Running', 'Cycling', 'Gym workouts', 'Yoga', 'Team sports', 'Other']
  },
  {
    id: 66,
    category: 'Physical Activity & Fitness',
    question: 'Would you be interested in a fitness buddy to stay active with?',
    type: 'true-false'
  },
  {
    id: 67,
    category: 'Physical Activity & Fitness',
    question: 'Do you prefer exercising alone or with others?',
    type: 'multiple-choice',
    options: ['Alone', 'With others']
  },
  {
    id: 68,
    category: 'Physical Activity & Fitness',
    question: 'Do you enjoy outdoor adventure activities?',
    type: 'true-false'
  },
  {
    id: 69,
    category: 'Physical Activity & Fitness',
    question: 'Would you be interested in joining a recreational sports league?',
    type: 'true-false'
  },
  {
    id: 70,
    category: 'Physical Activity & Fitness',
    question: 'Do you think fitness level affects friendships?',
    type: 'multiple-choice',
    options: ['Not at all', 'Somewhat', 'Significantly']
  },

  // Section 9: Personal Preferences & Dealbreakers (Questions 71–100)
  {
    id: 71,
    category: 'Personal Preferences & Dealbreakers',
    question: 'Do you have any pets?',
    type: 'multiple-choice',
    options: ['Yes', 'No']
  },
  {
    id: 72,
    category: 'Personal Preferences & Dealbreakers',
    question: 'If yes, what type of pet do you have?',
    type: 'fill-in'
  },
  {
    id: 73,
    category: 'Personal Preferences & Dealbreakers',
    question: 'How important is it that your friends are pet lovers?',
    type: 'sliding-scale',
    scale: { min: 1, max: 10 }
  },
  {
    id: 74,
    category: 'Personal Preferences & Dealbreakers',
    question: 'What is your political leaning?',
    type: 'multiple-choice',
    options: ['Liberal', 'Moderate', 'Conservative', 'Other']
  },
  {
    id: 75,
    category: 'Personal Preferences & Dealbreakers',
    question: 'How important are shared social values in your friendships?',
    type: 'sliding-scale',
    scale: { min: 1, max: 10 }
  },
  {
    id: 76,
    category: 'Personal Preferences & Dealbreakers',
    question: 'Do you enjoy discussing politics with friends?',
    type: 'true-false'
  },
  {
    id: 77,
    category: 'Personal Preferences & Dealbreakers',
    question: 'What is your stance on environmental issues?',
    type: 'multiple-choice',
    options: ['Active', 'Concerned', 'Neutral', 'Not interested']
  },
  {
    id: 78,
    category: 'Personal Preferences & Dealbreakers',
    question: 'How important is work-life balance to you?',
    type: 'sliding-scale',
    scale: { min: 1, max: 10 }
  },
  {
    id: 79,
    category: 'Personal Preferences & Dealbreakers',
    question: 'Do you prefer friends who have similar sleep schedules?',
    type: 'true-false'
  },
  {
    id: 80,
    category: 'Personal Preferences & Dealbreakers',
    question: 'How often do you like to travel?',
    type: 'multiple-choice',
    options: ['Frequently', 'Occasionally', 'Rarely', 'Never']
  },
  {
    id: 81,
    category: 'Personal Preferences & Dealbreakers',
    question: 'Are you open to trying new cuisines?',
    type: 'true-false'
  },
  {
    id: 82,
    category: 'Personal Preferences & Dealbreakers',
    question: 'Do you enjoy attending cultural events (museums, theater, etc.)?',
    type: 'true-false'
  },
  {
    id: 83,
    category: 'Personal Preferences & Dealbreakers',
    question: 'How much does your cultural background influence your friendships?',
    type: 'sliding-scale',
    scale: { min: 1, max: 10 }
  },
  {
    id: 84,
    category: 'Personal Preferences & Dealbreakers',
    question: 'Do you prefer friends from a similar age group?',
    type: 'true-false'
  },
  {
    id: 85,
    category: 'Personal Preferences & Dealbreakers',
    question: 'How important is humor in your friendships?',
    type: 'sliding-scale',
    scale: { min: 1, max: 10 }
  },
  {
    id: 86,
    category: 'Personal Preferences & Dealbreakers',
    question: 'Do you enjoy outdoor activities like picnics or beach days?',
    type: 'true-false'
  },
  {
    id: 87,
    category: 'Personal Preferences & Dealbreakers',
    question: 'How do you feel about sharing personal information with friends?',
    type: 'multiple-choice',
    options: ['Open', 'Reserved', 'Depends on the friend']
  },
  {
    id: 88,
    category: 'Personal Preferences & Dealbreakers',
    question: 'Do you like to plan activities or be spontaneous?',
    type: 'multiple-choice',
    options: ['Plan', 'Spontaneous', 'A mix of both']
  },
  {
    id: 89,
    category: 'Personal Preferences & Dealbreakers',
    question: 'How often do you like to catch up with friends?',
    type: 'multiple-choice',
    options: ['Daily', 'Weekly', 'Monthly', 'Rarely']
  },
  {
    id: 90,
    category: 'Personal Preferences & Dealbreakers',
    question: 'What is your preferred method of communication for catching up?',
    type: 'multiple-choice',
    options: ['In-person', 'Phone call', 'Text', 'Video chat']
  },
  {
    id: 91,
    category: 'Personal Preferences & Dealbreakers',
    question: 'How do you handle disagreements in friendships?',
    type: 'fill-in'
  },
  {
    id: 92,
    category: 'Personal Preferences & Dealbreakers',
    question: 'Do you value loyalty above all in friendships?',
    type: 'true-false'
  },
  {
    id: 93,
    category: 'Personal Preferences & Dealbreakers',
    question: 'How important is honesty in your friendships?',
    type: 'sliding-scale',
    scale: { min: 1, max: 10 }
  },
  {
    id: 94,
    category: 'Personal Preferences & Dealbreakers',
    question: 'Do you enjoy group activities more than one-on-one interactions?',
    type: 'multiple-choice',
    options: ['Group activities', 'One-on-one', 'Both equally']
  },
  {
    id: 95,
    category: 'Personal Preferences & Dealbreakers',
    question: 'How do you feel about long-distance friendships?',
    type: 'multiple-choice',
    options: ['Open', 'Prefer local', 'Depends']
  },
  {
    id: 96,
    category: 'Personal Preferences & Dealbreakers',
    question: 'Do you prefer friends who are more introverted or extroverted?',
    type: 'multiple-choice',
    options: ['Introverted', 'Extroverted', 'No preference']
  },
  {
    id: 97,
    category: 'Personal Preferences & Dealbreakers',
    question: 'How do you deal with stress in your social life?',
    type: 'fill-in'
  },
  {
    id: 98,
    category: 'Personal Preferences & Dealbreakers',
    question: 'Do you value having a diverse friend group?',
    type: 'true-false'
  },
  {
    id: 99,
    category: 'Personal Preferences & Dealbreakers',
    question: 'How important is it to you to have friends with similar hobbies?',
    type: 'sliding-scale',
    scale: { min: 1, max: 10 }
  },
  {
    id: 100,
    category: 'Personal Preferences & Dealbreakers',
    question: 'Do you believe that opposites attract in friendships?',
    type: 'multiple-choice',
    options: ['Yes', 'No', 'Sometimes']
  }
];