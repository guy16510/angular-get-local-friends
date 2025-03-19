// animals-data.ts

import { AnimalDefinition, AdjectiveDefinition, TRAITS } from './types';

/**
 * Database of animals with personality traits
 */
export const animals: AnimalDefinition[] = [
    { name: "Cheetah", energy: 90, sociability: 50, adventurousness: 85, playfulness: 60, independence: 80, nurturance: 40 },
    { name: "Lion", energy: 70, sociability: 85, adventurousness: 70, playfulness: 60, independence: 50, nurturance: 80 },
    { name: "Wolf", energy: 80, sociability: 90, adventurousness: 75, playfulness: 65, independence: 40, nurturance: 70 },
    { name: "Fox", energy: 75, sociability: 40, adventurousness: 80, playfulness: 90, independence: 85, nurturance: 30 },
    { name: "Koala", energy: 20, sociability: 30, adventurousness: 10, playfulness: 40, independence: 60, nurturance: 70 },
    { name: "Sloth", energy: 10, sociability: 20, adventurousness: 5, playfulness: 30, independence: 40, nurturance: 30 },
    { name: "Dolphin", energy: 85, sociability: 95, adventurousness: 80, playfulness: 95, independence: 60, nurturance: 85 },
    { name: "Elephant", energy: 60, sociability: 80, adventurousness: 50, playfulness: 60, independence: 40, nurturance: 95 },
    { name: "Owl", energy: 50, sociability: 30, adventurousness: 60, playfulness: 40, independence: 90, nurturance: 60 },
    { name: "Eagle", energy: 75, sociability: 30, adventurousness: 80, playfulness: 30, independence: 95, nurturance: 70 },
    { name: "Bear", energy: 65, sociability: 40, adventurousness: 70, playfulness: 60, independence: 80, nurturance: 85 },
    { name: "Penguin", energy: 70, sociability: 90, adventurousness: 60, playfulness: 80, independence: 30, nurturance: 75 },
    { name: "Tiger", energy: 80, sociability: 30, adventurousness: 75, playfulness: 60, independence: 90, nurturance: 60 },
    { name: "Otter", energy: 85, sociability: 80, adventurousness: 85, playfulness: 95, independence: 50, nurturance: 60 },
    { name: "Rabbit", energy: 75, sociability: 60, adventurousness: 40, playfulness: 80, independence: 40, nurturance: 50 },
    { name: "Squirrel", energy: 90, sociability: 60, adventurousness: 70, playfulness: 85, independence: 70, nurturance: 40 },
    { name: "Octopus", energy: 60, sociability: 20, adventurousness: 80, playfulness: 85, independence: 95, nurturance: 70 },
    { name: "Parrot", energy: 80, sociability: 90, adventurousness: 50, playfulness: 90, independence: 50, nurturance: 40 },
    { name: "Deer", energy: 70, sociability: 70, adventurousness: 40, playfulness: 50, independence: 60, nurturance: 80 },
    { name: "Honey Badger", energy: 95, sociability: 20, adventurousness: 100, playfulness: 40, independence: 100, nurturance: 20 },
    { name: "Panda", energy: 30, sociability: 40, adventurousness: 20, playfulness: 70, independence: 50, nurturance: 60 },
    { name: "Turtle", energy: 20, sociability: 40, adventurousness: 40, playfulness: 30, independence: 70, nurturance: 60 },
    { name: "Hummingbird", energy: 100, sociability: 30, adventurousness: 70, playfulness: 80, independence: 90, nurturance: 40 },
    { name: "Beaver", energy: 80, sociability: 70, adventurousness: 60, playfulness: 50, independence: 40, nurturance: 80 },
    { name: "Meerkat", energy: 85, sociability: 95, adventurousness: 70, playfulness: 80, independence: 30, nurturance: 85 },
    { name: "Peacock", energy: 60, sociability: 70, adventurousness: 40, playfulness: 50, independence: 60, nurturance: 30 },
    { name: "Gorilla", energy: 70, sociability: 80, adventurousness: 50, playfulness: 60, independence: 50, nurturance: 90 },
    { name: "Flamingo", energy: 60, sociability: 90, adventurousness: 50, playfulness: 70, independence: 40, nurturance: 60 },
    { name: "Hedgehog", energy: 60, sociability: 30, adventurousness: 40, playfulness: 70, independence: 75, nurturance: 40 },
    { name: "Chameleon", energy: 40, sociability: 20, adventurousness: 60, playfulness: 40, independence: 90, nurturance: 30 },
    { name: "Raccoon", energy: 75, sociability: 60, adventurousness: 85, playfulness: 90, independence: 80, nurturance: 50 },
    { name: "Honeybee", energy: 90, sociability: 100, adventurousness: 70, playfulness: 40, independence: 20, nurturance: 90 },
    { name: "Swan", energy: 60, sociability: 70, adventurousness: 50, playfulness: 40, independence: 60, nurturance: 90 },
    { name: "Capybara", energy: 50, sociability: 100, adventurousness: 60, playfulness: 70, independence: 40, nurturance: 80 },
    { name: "Horse", energy: 80, sociability: 70, adventurousness: 70, playfulness: 60, independence: 50, nurturance: 60 },
    { name: "Kangaroo", energy: 85, sociability: 70, adventurousness: 80, playfulness: 75, independence: 60, nurturance: 90 },
    { name: "Orangutan", energy: 60, sociability: 60, adventurousness: 70, playfulness: 80, independence: 70, nurturance: 85 },
    { name: "Hamster", energy: 80, sociability: 50, adventurousness: 40, playfulness: 90, independence: 40, nurturance: 30 },
    { name: "Seal", energy: 70, sociability: 80, adventurousness: 70, playfulness: 90, independence: 50, nurturance: 60 },
    { name: "Giraffe", energy: 60, sociability: 70, adventurousness: 50, playfulness: 60, independence: 60, nurturance: 70 }
];

/**
 * Adjectives based on trait combinations
 */
export const adjectives: AdjectiveDefinition[] = [
    // Energy adjectives
    { trait: TRAITS.ENERGY, min: 80, adjective: "Energetic" },
    { trait: TRAITS.ENERGY, min: 80, adjective: "Lively" },
    { trait: TRAITS.ENERGY, min: 80, adjective: "Vibrant" },
    { trait: TRAITS.ENERGY, min: 80, adjective: "Dynamic" },
    { trait: TRAITS.ENERGY, max: 30, adjective: "Relaxed" },
    { trait: TRAITS.ENERGY, max: 30, adjective: "Laid-back" },
    { trait: TRAITS.ENERGY, max: 30, adjective: "Mellow" },
    { trait: TRAITS.ENERGY, max: 30, adjective: "Chill" },

    // Sociability adjectives
    { trait: TRAITS.SOCIABILITY, min: 80, adjective: "Social" },
    { trait: TRAITS.SOCIABILITY, min: 80, adjective: "Outgoing" },
    { trait: TRAITS.SOCIABILITY, min: 80, adjective: "Gregarious" },
    { trait: TRAITS.SOCIABILITY, min: 80, adjective: "Friendly" },
    { trait: TRAITS.SOCIABILITY, max: 30, adjective: "Reserved" },
    { trait: TRAITS.SOCIABILITY, max: 30, adjective: "Introverted" },
    { trait: TRAITS.SOCIABILITY, max: 30, adjective: "Selective" },
    { trait: TRAITS.SOCIABILITY, max: 30, adjective: "Private" },
    
    // Adventurousness adjectives
    { trait: TRAITS.ADVENTUROUSNESS, min: 80, adjective: "Adventurous" },
    { trait: TRAITS.ADVENTUROUSNESS, min: 80, adjective: "Daring" },
    { trait: TRAITS.ADVENTUROUSNESS, min: 80, adjective: "Bold" },
    { trait: TRAITS.ADVENTUROUSNESS, min: 80, adjective: "Intrepid" },
    { trait: TRAITS.ADVENTUROUSNESS, max: 30, adjective: "Cautious" },
    { trait: TRAITS.ADVENTUROUSNESS, max: 30, adjective: "Careful" },
    { trait: TRAITS.ADVENTUROUSNESS, max: 30, adjective: "Contemplative" },
    { trait: TRAITS.ADVENTUROUSNESS, max: 30, adjective: "Methodical" },

    // Playfulness adjectives
    { trait: TRAITS.PLAYFULNESS, min: 80, adjective: "Playful" },
    { trait: TRAITS.PLAYFULNESS, min: 80, adjective: "Fun-loving" },
    { trait: TRAITS.PLAYFULNESS, min: 80, adjective: "Spirited" },
    { trait: TRAITS.PLAYFULNESS, min: 80, adjective: "Mischievous" },
    { trait: TRAITS.PLAYFULNESS, max: 30, adjective: "Serious" },
    { trait: TRAITS.PLAYFULNESS, max: 30, adjective: "Thoughtful" },
    { trait: TRAITS.PLAYFULNESS, max: 30, adjective: "Steady" },
    { trait: TRAITS.PLAYFULNESS, max: 30, adjective: "Composed" },

    // Independence adjectives
    { trait: TRAITS.INDEPENDENCE, min: 80, adjective: "Independent" },
    { trait: TRAITS.INDEPENDENCE, min: 80, adjective: "Self-reliant" },
    { trait: TRAITS.INDEPENDENCE, min: 80, adjective: "Autonomous" },
    { trait: TRAITS.INDEPENDENCE, min: 80, adjective: "Free-spirited" },
    { trait: TRAITS.INDEPENDENCE, max: 30, adjective: "Cooperative" },
    { trait: TRAITS.INDEPENDENCE, max: 30, adjective: "Team-oriented" },
    { trait: TRAITS.INDEPENDENCE, max: 30, adjective: "Supportive" },
    { trait: TRAITS.INDEPENDENCE, max: 30, adjective: "Communal" },

    // Nurturance adjectives
    { trait: TRAITS.NURTURANCE, min: 80, adjective: "Nurturing" },
    { trait: TRAITS.NURTURANCE, min: 80, adjective: "Caring" },
    { trait: TRAITS.NURTURANCE, min: 80, adjective: "Supportive" },
    { trait: TRAITS.NURTURANCE, min: 80, adjective: "Protective" },
    { trait: TRAITS.NURTURANCE, max: 30, adjective: "Self-focused" },
    { trait: TRAITS.NURTURANCE, max: 30, adjective: "Independent" },
    { trait: TRAITS.NURTURANCE, max: 30, adjective: "Pragmatic" },
    { trait: TRAITS.NURTURANCE, max: 30, adjective: "Objective" }
];

/**
 * Animal characteristics for profile descriptions
 */
export const animalCharacteristics: Record<string, string> = {
    "Lion": "Like lions, you value loyalty and forming strong bonds with your pride. You enjoy taking the lead but also appreciate moments of rest and reflection.",
    "Wolf": "Like wolves, you thrive in community settings and value deep bonds with your pack. You're loyal and protective of those you care about.",
    "Fox": "Like foxes, you're clever and adaptable, approaching life with curiosity and resourcefulness. You enjoy solving problems and finding creative solutions.",
    "Dolphin": "Like dolphins, you're naturally playful and social, with high emotional intelligence. You enjoy helping others and building connections through shared activities.",
    "Owl": "Like owls, you're thoughtful and observant, often preferring quality over quantity in your interactions. You value wisdom and depth in your relationships.",
    "Eagle": "Like eagles, you enjoy your independence and freedom. You have a broad perspective on life and aren't afraid to soar above the ordinary.",
    "Otter": "Like otters, you approach life with playfulness and joy. You find fun in everyday situations and enjoy bringing people together for social activities.",
    "Bear": "Like bears, you're protective and nurturing. You value deep connections and are willing to stand up for those you care about. You enjoy your personal space but also appreciate meaningful social connections.",
    "Tiger": "Like tigers, you're independent and value your autonomy. You're selective about your social circle but fiercely loyal to those you let in. You prefer quality over quantity in relationships.",
    "Elephant": "Like elephants, you're nurturing and compassionate with a strong memory for relationships. You value deep, long-lasting friendships and are often the emotional center of your social group.",
    "Penguin": "Like penguins, you thrive in community and enjoy structured social activities. You're loyal to your group and find comfort in familiar routines with trusted friends.",
    "Koala": "Like koalas, you appreciate relaxation and low-key social activities. You prefer quality time with a few close friends over large gatherings and value comfortable, familiar environments.",
    "Raccoon": "Like raccoons, you're adaptable and resourceful. You approach friendships with curiosity and playfulness, and you're quick to find creative solutions to problems. You enjoy novel experiences with friends.",
    "Honeybee": "Like honeybees, you thrive in structured social environments and contribute actively to your community. You're hardworking and find fulfillment in collaborative efforts that benefit the whole group.",
    "Capybara": "Like capybaras, you're exceptionally social and get along with nearly everyone. You have a calming presence and often serve as the peaceful mediator in your friend groups. You genuinely enjoy bringing diverse people together.",
    "Chameleon": "Like chameleons, you're adaptable and observant. You adjust well to different social environments and have an intuitive understanding of social dynamics. You value independence while still maintaining connections.",
    "Octopus": "Like octopuses, you're highly intelligent and creative. You value your independence and privacy but can be remarkably social when you choose to be. You have a unique perspective that enriches your friendships.",
    "Meerkat": "Like meerkats, you thrive in tight-knit communities and value looking out for one another. You're vigilant about the wellbeing of your friends and enjoy collaborative activities that strengthen bonds.",
    "Hummingbird": "Like hummingbirds, you're energetic and always on the move. You bring enthusiasm to your friendships and enjoy brief but meaningful interactions. You're independent but appreciate reliable social connections."
};

/**
 * Get animal characteristics with fallback for unknown animals
 */
export function getAnimalCharacteristics(animalName: string): string {
    return animalCharacteristics[animalName] || 
        `As a ${animalName}, you have a unique blend of qualities that make you a valuable friend.`;
}
