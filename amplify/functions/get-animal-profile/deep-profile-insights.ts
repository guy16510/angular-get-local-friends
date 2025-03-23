// deep-profile-insights.ts

import { Traits, SurveyAnswers, TraitName, TRAITS } from './types';

export interface DeepProfileInsights {
  personalityNarrative: string;
  socialRole: string;
  friendshipNeeds: string;
  potentialGrowthPath: string;
  compatibilityTip: string;
}

export function generateDeepProfileInsights(traits: Traits, answers: SurveyAnswers): DeepProfileInsights {
  const insights: DeepProfileInsights = {
    personalityNarrative: '',
    socialRole: '',
    friendshipNeeds: '',
    potentialGrowthPath: '',
    compatibilityTip: ''
  };

  // Personality Narrative
  if (traits.playfulness > 60 && traits.sociability > 60) {
    insights.personalityNarrative =
      "You bring light, humor, and spontaneity into your friendships. You're the spark that gets people laughing and trying new things.";
  } else if (traits.nurturance > 70) {
    insights.personalityNarrative =
      "You're a deeply caring soul — the kind of person others turn to for comfort, empathy, and genuine support.";
  } else if (traits.independence > 70) {
    insights.personalityNarrative =
      "You are self-reliant and composed. You value meaningful relationships, but you also need space to recharge and be yourself.";
  } else {
    insights.personalityNarrative =
      "You strike a balance across your personality dimensions — adaptable, approachable, and able to connect in many ways.";
  }

  // Social Role
  if (traits.energy > 65 && traits.playfulness > 60) {
    insights.socialRole =
      "In social settings, you often play the role of the energizer — sparking activity, laughter, and movement.";
  } else if (traits.nurturance > 65 && traits.sociability > 50) {
    insights.socialRole =
      "You're the emotional anchor in your circles — someone who brings stability, empathy, and connection.";
  } else if (traits.independence > 65 && traits.sociability < 40) {
    insights.socialRole =
      "You're a thoughtful observer — you bring depth and introspection into friendships, often preferring 1:1 depth over group buzz.";
  } else {
    insights.socialRole =
      "You're a flexible social companion who can adapt to many environments and roles in a group.";
  }

  // Friendship Needs
  if (traits.independence > 70) {
    insights.friendshipNeeds =
      "You need friendships that respect your autonomy — people who won’t crowd you but will show up when it matters.";
  } else if (traits.nurturance > 70) {
    insights.friendshipNeeds =
      "You seek emotionally safe spaces — friends who care deeply, communicate openly, and reciprocate your warmth.";
  } else if (traits.adventurousness > 65) {
    insights.friendshipNeeds =
      "You thrive with friends who are curious, spontaneous, and eager to explore the world alongside you.";
  } else {
    insights.friendshipNeeds =
      "You value trust, authenticity, and shared moments over anything flashy or forced.";
  }

  // Growth Path
  if (traits.sociability < 40) {
    insights.potentialGrowthPath =
      "Challenge yourself to initiate more social opportunities — even small steps can deepen your network and emotional support.";
  } else if (traits.independence > 75) {
    insights.potentialGrowthPath =
      "Remember that allowing others to support you doesn’t reduce your strength — it deepens your relationships.";
  } else if (traits.energy < 40 && traits.playfulness < 40) {
    insights.potentialGrowthPath =
      "Life doesn’t always need structure. Inviting more spontaneity could unlock new joy and connection.";
  } else {
    insights.potentialGrowthPath =
      "Keep investing in your emotional awareness and communication — you’re well-balanced, and growth lies in deeper expression.";
  }

  // Compatibility Tip
  const delta = traits.independence - traits.nurturance;
  if (delta > 20) {
    insights.compatibilityTip =
      "You're most compatible with people who are nurturing and emotionally expressive — they balance your self-reliance.";
  } else if (delta < -20) {
    insights.compatibilityTip =
      "Seek companions who value independence — it creates a healthy equilibrium for your caring energy.";
  } else {
    insights.compatibilityTip =
      "You’ll mesh best with people who share your emotional tempo — balanced, present, and mutually respectful.";
  }

  return insights;
}
