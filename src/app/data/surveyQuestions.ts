// survey-questions.ts

export interface Question {
  id: number;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'fill-in-the-blank';
  component: string;      // 'radio', 'checkbox', 'button-toggle', or 'input'
  multiSelect?: boolean;  // true if more than one option can be selected
  options?: string[];
}

export const surveyQuestions: Question[] = [
  // {
  //   id: 1,
  //   question: "What are your habits regarding drinking or smoking?",
  //   type: "multiple-choice",
  //   component: "radio",
  //   // multiSelect: true,
  //   options: [
  //     "I don't drink or smoke",
  //     "I drink socially",
  //     "I smoke",
  //     "I drink and smoke",
  //     "Prefer not to say"
  //   ]
  // },
  {
    id: 1,
    question: "What kind of friends are you looking to connect with?",
    type: "multiple-choice",
    component: "radio",
    options: [
      "Local families",
      "Single parents",
      "Seniors/Retirees",
      "Mixed-age groups",
      "Other (please specify)"
    ]
  },
  {
    id: 2,
    question: "How do you usually spend a Saturday afternoon?",
    type: "multiple-choice",
    component: "radio",
    options: [
      "Outdoor adventures",
      "Home projects or crafts",
      "Hanging out with friends/family",
      "Exploring local spots",
      "Other (fill in the blank)"
    ]
  },
  {
    id: 3,
    question: "Do you enjoy a good pun or dad joke?",
    type: "true-false",
    component: "button-toggle"
  },
  {
    id: 4,
    question: "When you’re having a rough day, do you prefer to:",
    type: "multiple-choice",
    component: "radio",
    options: [
      "Talk it out with someone",
      "Get lost in a hobby",
      "Enjoy some quiet time",
      "Do something silly to cheer up",
      "Other"
    ]
  },
  {
    id: 5,
    question: "If you could describe your ideal friend in three words, what would they be?",
    type: "fill-in-the-blank",
    component: "input"
  },
  {
    id: 6,
    question: "How important is it that your new friends live close by?",
    type: "multiple-choice",
    component: "radio",
    options: [
      "Must be in the same neighborhood",
      "Within a 5–10 mile radius",
      "Open to a wider local area",
      "Distance doesn’t matter"
    ]
  },
  {
    id: 7,
    question: "Which best describes your social vibe?",
    type: "multiple-choice",
    component: "radio",
    options: [
      "Outgoing and spontaneous",
      "Laid-back and thoughtful",
      "A mix of both",
      "Prefer intimate gatherings over big parties"
    ]
  },
  {
    id: 8,
    question: "What’s one conversation topic you can talk about for hours?",
    type: "fill-in-the-blank",
    component: "input"
  },
  {
    id: 9,
    question: "If you were a superhero with a quirky power, what would it be?",
    type: "fill-in-the-blank",
    component: "input"
  },
  {
    id: 10,
    question: "True or False: I believe friendships can be as vital as family.",
    type: "true-false",
    component: "button-toggle"
  },
  {
    id: 11,
    question: "Which pet best represents your personality?",
    type: "multiple-choice",
    component: "radio",
    options: [
      "Loyal dog",
      "Independent cat",
      "Curious parrot",
      "No pet, but I love animals",
      "Other"
    ]
  },
  {
    id: 12,
    question: "Are you open to meeting friends with children?",
    type: "multiple-choice",
    component: "radio",
    options: [
      "Yes, the more the merrier",
      "Only if it’s clearly communicated",
      "No, I prefer adults-only friendships"
    ]
  },
  {
    id: 13,
    question: "What’s something new you’d love to try with a friend?",
    type: "fill-in-the-blank",
    component: "input"
  },
  {
    id: 14,
    question: "Which local event are you most excited about?",
    type: "fill-in-the-blank",
    component: "input"
  },
  {
    id: 15,
    question: "Do you enjoy reading?",
    type: "true-false",
    component: "button-toggle"
  },
  {
    id: 16,
    question: "Are you a foodie who loves exploring new restaurants or recipes?",
    type: "true-false",
    component: "button-toggle"
  },
  {
    id: 17,
    question: "When hanging out, how much do you value “unplugged” time?",
    type: "multiple-choice",
    component: "radio",
    options: [
      "I’m all about disconnecting",
      "I like a mix of digital and real-life interactions",
      "I rarely disconnect from my devices"
    ]
  },
  {
    id: 18,
    question: "How much do you enjoy sharing travel stories?",
    type: "multiple-choice",
    component: "radio",
    options: [
      "Love it!",
      "It’s okay sometimes",
      "Not really my thing"
    ]
  },
  {
    id: 19,
    question: "Do you consider yourself a creative person?",
    type: "true-false",
    component: "button-toggle"
  },
  {
    id: 20,
    question: "What’s one personal goal you’re working on right now?",
    type: "fill-in-the-blank",
    component: "input"
  },
  {
    id: 21,
    question: "How often do you get outside for fresh air or exercise?",
    type: "multiple-choice",
    component: "radio",
    options: [
      "Daily",
      "A few times a week",
      "Rarely"
    ]
  },
  {
    id: 22,
    question: "Which music genre best represents your personality?",
    type: "multiple-choice",
    component: "radio",
    options: [
      "Rock",
      "Pop",
      "Jazz/Blues",
      "Country",
      "Classical",
      "Other"
    ]
  },
  {
    id: 23,
    question: "What’s your favorite local hangout spot?",
    type: "fill-in-the-blank",
    component: "input"
  },
  {
    id: 24,
    question: "True or False: I believe real friends can challenge me to grow.",
    type: "true-false",
    component: "button-toggle"
  },
  {
    id: 25,
    question: "Are you up for game nights—board games, trivia, or video games?",
    type: "multiple-choice",
    component: "radio",
    options: [
      "Absolutely",
      "Sometimes",
      "Not my scene"
    ]
  },
  {
    id: 26,
    question: "If your personality were a flavor of ice cream, what would it be and why?",
    type: "fill-in-the-blank",
    component: "input"
  },
  {
    id: 27,
    question: "How do you strike a balance between work and social time?",
    type: "fill-in-the-blank",
    component: "input"
  },
  {
    id: 28,
    question: "What do you love most about your community?",
    type: "fill-in-the-blank",
    component: "input"
  },
  {
    id: 29,
    question: "True or False: I’m always on top of the latest local apps and events.",
    type: "true-false",
    component: "button-toggle"
  },
  {
    id: 30,
    question: "What’s your ideal way to relax after a long week?",
    type: "multiple-choice",
    component: "radio",
    options: [
      "A quiet night in",
      "Catching up with friends",
      "A fun local event",
      "Something else"
    ]
  },
  {
    id: 31,
    question: "Are you looking to connect with people who have similar family dynamics (e.g., single parents, blended families)?",
    type: "multiple-choice",
    component: "radio",
    options: [
      "Yes, absolutely",
      "It doesn’t matter to me",
      "I’m flexible"
    ]
  },
  {
    id: 32,
    question: "What’s one quirky talent or hobby you have?",
    type: "fill-in-the-blank",
    component: "input"
  },
  {
    id: 33,
    question: "True or False: I enjoy sharing local happenings on social media.",
    type: "true-false",
    component: "button-toggle"
  },
  {
    id: 34,
    question: "How open are you to trying cultural events (festivals, art shows, etc.) in your area?",
    type: "multiple-choice",
    component: "radio",
    options: [
      "Very open",
      "Somewhat open",
      "Not interested"
    ]
  },
  {
    id: 35,
    question: "Are you an early bird, a night owl, or somewhere in between?",
    type: "multiple-choice",
    component: "radio",
    options: [
      "Early bird",
      "Night owl",
      "Flexible"
    ]
  },
  {
    id: 36,
    question: "Would you be interested in connecting with others through community service or volunteer work?",
    type: "true-false",
    component: "button-toggle"
  },
  {
    id: 37,
    question: "What’s one interesting fact about your town or neighborhood?",
    type: "fill-in-the-blank",
    component: "input"
  },
  {
    id: 38,
    question: "How would you rate your “laid-back” quotient?",
    type: "multiple-choice",
    component: "radio",
    options: [
      "Super chill",
      "Moderately relaxed",
      "I’m always on the go"
    ]
  },
  {
    id: 39,
    question: "True or False: I regularly attend local events and community meet-ups.",
    type: "true-false",
    component: "button-toggle"
  },
  {
    id: 40,
    question: "What’s your go-to comfort food?",
    type: "fill-in-the-blank",
    component: "input"
  },
  {
    id: 41,
    question: "Do you enjoy taking classes or workshops on topics outside your usual interests?",
    type: "true-false",
    component: "button-toggle"
  },
  {
    id: 42,
    question: "On a scale of “couch potato” to “adrenaline junkie,” where do you land?",
    type: "multiple-choice",
    component: "radio",
    options: [
      "Couch potato",
      "Somewhere in the middle",
      "Adrenaline junkie"
    ]
  },
  {
    id: 43,
    question: "What’s one activity that always puts you in a good mood?",
    type: "fill-in-the-blank",
    component: "input"
  },
  {
    id: 44,
    question: "True or False: I love trying something new, even if it’s a bit out of my comfort zone.",
    type: "true-false",
    component: "button-toggle"
  },
  {
    id: 45,
    question: "How do you like to incorporate your family into your social life?",
    type: "multiple-choice",
    component: "radio",
    options: [
      "Family is at the center",
      "I keep family and friends separate",
      "I’m flexible"
    ]
  },
  {
    id: 46,
    question: "Which of the following best describes your sense of humor?",
    type: "multiple-choice",
    component: "radio",
    options: [
      "Silly and light-hearted",
      "Witty and sarcastic",
      "Dry and observational",
      "Other"
    ]
  },
  {
    id: 47,
    question: "What’s a random fact or tidbit you learned recently that blew your mind?",
    type: "fill-in-the-blank",
    component: "input"
  },
  {
    id: 48,
    question: "Who is someone in your community that inspires you?",
    type: "fill-in-the-blank",
    component: "input"
  },
  {
    id: 49,
    question: "Would you rather have a friend who’s always up for spontaneous adventures or planned hangouts?",
    type: "multiple-choice",
    component: "radio",
    options: [
      "Spontaneous adventures",
      "Planned hangouts",
      "A mix of both"
    ]
  },
  {
    id: 50,
    question: "In one sentence, describe what friendship means to you.",
    type: "fill-in-the-blank",
    component: "input"
  },
  {
    id: 51,
    question: "What do you do for work?",
    type: "fill-in-the-blank",
    component: "input"
  },
  // {
  //   id: 52,
  //   question: "What are your habits regarding drinking or smoking?",
  //   type: "multiple-choice",
  //   component: "checkbox",
  //   multiSelect: true,
  //   options: [
  //     "I don't drink or smoke",
  //     "I drink socially",
  //     "I smoke",
  //     "I drink and smoke",
  //     "Prefer not to say"
  //   ]
  // }
];