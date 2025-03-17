export interface SurveyAnswers {
    [questionId: number]: string | string[] | boolean | number;
}

// Profile type for both self and desired friends
export interface AnimalProfile {
    animal: string;
    adjective: string;
    fullDescription: string;
    traits: {
        energy: number;
        sociability: number;
        adventurousness: number;
        playfulness: number;
        independence: number;
        nurturance: number;
    };
}

// Main profile generator function
export function generateAnimalProfiles(answers: SurveyAnswers): {
    selfProfile: AnimalProfile;
    seekingProfile: AnimalProfile;
} {
    // Calculate personality traits based on answers
    const traits = calculatePersonalityTraits(answers);

    // Generate profiles
    const selfProfile = generateSelfProfile(traits, answers);
    const seekingProfile = generateSeekingProfile(traits, answers);

    return {
        selfProfile,
        seekingProfile
    };
}

// Calculate personality traits from answers
function calculatePersonalityTraits(answers: SurveyAnswers): {
    energy: number;        // 0-100 (low to high energy)
    sociability: number;   // 0-100 (introverted to extroverted)
    adventurousness: number; // 0-100 (cautious to adventurous)
    playfulness: number;   // 0-100 (serious to playful)
    independence: number;  // 0-100 (dependent to independent)
    nurturance: number;    // 0-100 (self-focused to nurturing)
} {
    // Initialize traits with default middle values
    const traits = {
        energy: 50,
        sociability: 50,
        adventurousness: 50,
        playfulness: 50,
        independence: 50,
        nurturance: 50
    };

    // Social Energy questions
    if (answers[25] === "Love them! The more, the merrier.") traits.sociability += 20;
    if (answers[25] === "Avoid them at all costs.") traits.sociability -= 20;

    if (answers[26] === "Instantly") traits.sociability += 15;
    if (answers[26] === "Takes me a while") traits.sociability -= 15;

    if (answers[27] === "Daily") traits.sociability += 15;
    if (answers[27] === "Rarely, but I like staying in touch online") traits.sociability -= 15;

    if (answers[29] === "Big group (7+)") traits.sociability += 15;
    if (answers[29] === "1-on-1") traits.sociability -= 10;

    if (answers[30] === "More socializing!") traits.energy += 15;
    if (answers[30] === "Spending time alone") traits.energy -= 10;

    // Activity & Interest questions
    if (answers[16] && Array.isArray(answers[16])) {
        if (answers[16].includes("Outdoors (hiking, camping, fishing, biking)")) {
            traits.adventurousness += 15;
            traits.energy += 10;
        }
        if (answers[16].includes("Fitness (gym, yoga, running, sports)")) {
            traits.energy += 15;
        }
        if (answers[16].includes("Creative hobbies (art, writing, music, crafts)")) {
            traits.playfulness += 10;
        }
        if (answers[16].includes("Gaming (board games, video games, D&D)")) {
            traits.playfulness += 10;
        }
        if (answers[16].includes("Parenting-focused activities")) {
            traits.nurturance += 15;
        }
    }

    if (answers[18] === "Exploring a new city") traits.adventurousness += 15;
    if (answers[18] === "Staying home and relaxing") {
        traits.adventurousness -= 10;
        traits.energy -= 10;
    }

    if (answers[20] === "Spontaneous plans") traits.adventurousness += 15;
    if (answers[22] === "Active") traits.energy += 15;
    if (answers[22] === "Relaxed") traits.energy -= 15;

    // Lifestyle questions
    if (answers[63] === true) traits.sociability += 5;

    if (answers[69] === "Very active") traits.energy += 15;
    if (answers[69] === "Not active") traits.energy -= 15;

    if (answers[71] === true) traits.sociability += 10;

    // Parenting questions
    if (answers[5] === "Yes") traits.nurturance += 15;
    if (answers[6] === "Yes") traits.nurturance += 10;
    if (answers[9] === "Very important") traits.nurturance += 10;

    // Independence indicators
    if (answers[13] === "Only online friendships") traits.independence += 10;
    if (answers[33] === "Yes, I make the first move") traits.independence += 10;
    if (answers[33] === "I wait for others") traits.independence -= 10;

    // Playfulness indicators
    if (answers[34] === "Casual, lighthearted") traits.playfulness += 15;
    if (answers[34] === "Deep, meaningful") traits.playfulness -= 10;

    if (answers[58] === "Binge-watching entire season") traits.playfulness += 5;

    // Entertainment preferences
    if (answers[59] === true) {
        traits.energy += 10;
        traits.sociability += 5;
    }

    // Physical activity
    if (answers[70] && Array.isArray(answers[70])) {
        if (answers[70].includes("Team sports")) {
            traits.sociability += 10;
            traits.energy += 5;
        }
        if (answers[70].includes("Running") || answers[70].includes("Cycling")) {
            traits.energy += 10;
        }
        if (answers[70].includes("None")) {
            traits.energy -= 10;
        }
    }

    // Personal preferences
    if (answers[88] === "Open") traits.sociability += 10;
    if (answers[88] === "Reserved") traits.sociability -= 10;

    // Normalize traits to 0-100 range
    for (const trait in traits) {
        traits[trait as keyof typeof traits] = Math.max(0, Math.min(100, traits[trait as keyof typeof traits]));
    }

    return traits;
}

// Database of animals with personality traits
const animals = [
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

// Adjectives based on trait combinations
const adjectives = [
    // Energy adjectives
    { trait: "energy", min: 80, adjective: "Energetic" },
    { trait: "energy", min: 80, adjective: "Lively" },
    { trait: "energy", min: 80, adjective: "Vibrant" },
    { trait: "energy", min: 80, adjective: "Dynamic" },
    { trait: "energy", max: 30, adjective: "Relaxed" },
    { trait: "energy", max: 30, adjective: "Laid-back" },
    { trait: "energy", max: 30, adjective: "Mellow" },
    { trait: "energy", max: 30, adjective: "Chill" },

    // Sociability adjectives
    { trait: "sociability", min: 80, adjective: "Social" },
    { trait: "sociability", min: 80, adjective: "Outgoing" },
    { trait: "sociability", min: 80, adjective: "Gregarious" },
    { trait: "sociability", min: 80, adjective: "Friendly" },
    { trait: "sociability", max: 30, adjective: "Reserved" },
    { trait: "sociability", max: 30, adjective: "Introverted" },
    { trait: "sociability", max: 30, adjective: "Selective" },
    { trait: "sociability", max: 30, adjective: "Private" },
    // Adventurousness adjectives
    { trait: "adventurousness", min: 80, adjective: "Adventurous" },
    { trait: "adventurousness", min: 80, adjective: "Daring" },
    { trait: "adventurousness", min: 80, adjective: "Bold" },
    { trait: "adventurousness", min: 80, adjective: "Intrepid" },
    { trait: "adventurousness", max: 30, adjective: "Cautious" },
    { trait: "adventurousness", max: 30, adjective: "Careful" },
    { trait: "adventurousness", max: 30, adjective: "Contemplative" },
    { trait: "adventurousness", max: 30, adjective: "Methodical" },

    // Playfulness adjectives
    { trait: "playfulness", min: 80, adjective: "Playful" },
    { trait: "playfulness", min: 80, adjective: "Fun-loving" },
    { trait: "playfulness", min: 80, adjective: "Spirited" },
    { trait: "playfulness", min: 80, adjective: "Mischievous" },
    { trait: "playfulness", max: 30, adjective: "Serious" },
    { trait: "playfulness", max: 30, adjective: "Thoughtful" },
    { trait: "playfulness", max: 30, adjective: "Steady" },
    { trait: "playfulness", max: 30, adjective: "Composed" },

    // Independence adjectives
    { trait: "independence", min: 80, adjective: "Independent" },
    { trait: "independence", min: 80, adjective: "Self-reliant" },
    { trait: "independence", min: 80, adjective: "Autonomous" },
    { trait: "independence", min: 80, adjective: "Free-spirited" },
    { trait: "independence", max: 30, adjective: "Cooperative" },
    { trait: "independence", max: 30, adjective: "Team-oriented" },
    { trait: "independence", max: 30, adjective: "Supportive" },
    { trait: "independence", max: 30, adjective: "Communal" },

    // Nurturance adjectives
    { trait: "nurturance", min: 80, adjective: "Nurturing" },
    { trait: "nurturance", min: 80, adjective: "Caring" },
    { trait: "nurturance", min: 80, adjective: "Supportive" },
    { trait: "nurturance", min: 80, adjective: "Protective" },
    { trait: "nurturance", max: 30, adjective: "Self-focused" },
    { trait: "nurturance", max: 30, adjective: "Independent" },
    { trait: "nurturance", max: 30, adjective: "Pragmatic" },
    { trait: "nurturance", max: 30, adjective: "Objective" }
];

// Build animal profile helper function
function buildAnimalProfile(
    traits: {
        energy: number;
        sociability: number;
        adventurousness: number;
        playfulness: number;
        independence: number;
        nurturance: number;
    },
    answers: SurveyAnswers,
    isSelf: boolean
): AnimalProfile {
    const animal = findBestAnimalMatch(traits);
    const adjective = selectProfileAdjective(traits);
    const fullDescription = generateProfileDescription(animal, adjective, traits, isSelf);

    return {
        animal: animal.name,
        adjective,
        fullDescription,
        traits
    };
}

function generateSelfProfile(traits: {
    energy: number;
    sociability: number;
    adventurousness: number;
    playfulness: number;
    independence: number;
    nurturance: number;
}, answers: SurveyAnswers): AnimalProfile {
    return buildAnimalProfile(traits, answers, true);
}

function generateSeekingProfile(traits: {
    energy: number;
    sociability: number;
    adventurousness: number;
    playfulness: number;
    independence: number;
    nurturance: number;
}, answers: SurveyAnswers): AnimalProfile {
    const seekingTraits = calculateComplementaryTraits(traits, answers);
    return buildAnimalProfile(seekingTraits, answers, false);
}

// Find the animal that best matches the given traits
function findBestAnimalMatch(traits: {
    energy: number;
    sociability: number;
    adventurousness: number;
    playfulness: number;
    independence: number;
    nurturance: number;
}): {
    name: string;
    energy: number;
    sociability: number;
    adventurousness: number;
    playfulness: number;
    independence: number;
    nurturance: number;
} {
    let bestMatch: any = { name: "", score: Number.MAX_VALUE };

    for (const animal of animals) {
        // Calculate Euclidean distance between traits
        const score = Math.sqrt(
            Math.pow(animal.energy - traits.energy, 2) +
            Math.pow(animal.sociability - traits.sociability, 2) +
            Math.pow(animal.adventurousness - traits.adventurousness, 2) +
            Math.pow(animal.playfulness - traits.playfulness, 2) +
            Math.pow(animal.independence - traits.independence, 2) +
            Math.pow(animal.nurturance - traits.nurturance, 2)
        );

        if (score < bestMatch.score) {
            bestMatch = { ...animal, score };
        }
    }

    return bestMatch;
}

// Select an appropriate adjective based on the most prominent traits
function selectProfileAdjective(traits: {
    energy: number;
    sociability: number;
    adventurousness: number;
    playfulness: number;
    independence: number;
    nurturance: number;
}): string {
    // Find the highest and lowest traits
    const traitEntries = Object.entries(traits);
    traitEntries.sort((a, b) => b[1] - a[1]);

    const highestTrait = traitEntries[0][0];
    const highestValue = traitEntries[0][1];

    const lowestTrait = traitEntries[traitEntries.length - 1][0];
    const lowestValue = traitEntries[traitEntries.length - 1][1];

    // Choose suitable adjectives based on the highest or lowest trait
    let matchingAdjectives: string[] = [];

    if (highestValue >= 80) {
        // Find adjectives for high values of the highest trait
        matchingAdjectives = adjectives
            .filter(adj => adj.trait === highestTrait && adj.min && adj.min <= highestValue)
            .map(adj => adj.adjective);
    } else if (lowestValue <= 30) {
        // Find adjectives for low values of the lowest trait
        matchingAdjectives = adjectives
            .filter(adj => adj.trait === lowestTrait && adj.max && adj.max >= lowestValue)
            .map(adj => adj.adjective);
    }

    // If no strong traits found, pick a random middle-range adjective
    if (matchingAdjectives.length === 0) {
        const middleAdjectives = [
            "Balanced", "Versatile", "Adaptable", "Flexible",
            "Well-rounded", "Moderate", "Harmonious"
        ];
        return middleAdjectives[Math.floor(Math.random() * middleAdjectives.length)];
    }

    // Return a random adjective from the matching ones
    return matchingAdjectives[Math.floor(Math.random() * matchingAdjectives.length)];
}

// Generate a description based on the animal and traits
function generateProfileDescription(animal: { name: string }, adjective: string, traits: {
    energy: number;
    sociability: number;
    adventurousness: number;
    playfulness: number;
    independence: number;
    nurturance: number;
}, isSelf: boolean): string {
    const highTraits = [];
    const lowTraits = [];

    // Determine high and low traits
    if (traits.energy >= 70) highTraits.push("energetic");
    if (traits.energy <= 30) lowTraits.push("relaxed");

    if (traits.sociability >= 70) highTraits.push("social");
    if (traits.sociability <= 30) lowTraits.push("independent-minded");

    if (traits.adventurousness >= 70) highTraits.push("adventurous");
    if (traits.adventurousness <= 30) lowTraits.push("cautious");

    if (traits.playfulness >= 70) highTraits.push("playful");
    if (traits.playfulness <= 30) lowTraits.push("serious");

    if (traits.independence >= 70) highTraits.push("independent");
    if (traits.independence <= 30) lowTraits.push("supportive");

    if (traits.nurturance >= 70) highTraits.push("nurturing");
    if (traits.nurturance <= 30) lowTraits.push("self-focused");

    // Create description based on whether this is self profile or friend profile
    const prefix = isSelf ?
        `You are a ${adjective} ${animal.name}! You tend to be ` :
        `You're looking for a ${adjective} ${animal.name} friend who tends to be `;

    let description = prefix;

    // Add high traits
    if (highTraits.length > 0) {
        if (highTraits.length === 1) {
            description += `${highTraits[0]}`;
        } else if (highTraits.length === 2) {
            description += `${highTraits[0]} and ${highTraits[1]}`;
        } else {
            const lastTrait = highTraits.pop();
            description += `${highTraits.join(', ')}, and ${lastTrait}`;
        }
    }

    // Add connector if both high and low traits exist
    if (highTraits.length > 0 && lowTraits.length > 0) {
        description += `, while being less `;
    }

    // Add low traits
    if (lowTraits.length > 0) {
        if (highTraits.length === 0) {
            description += `less `;
        }

        if (lowTraits.length === 1) {
            description += `${lowTraits[0]}`;
        } else if (lowTraits.length === 2) {
            description += `${lowTraits[0]} or ${lowTraits[1]}`;
        } else {
            const lastTrait = lowTraits.pop();
            description += `${lowTraits.join(', ')}, or ${lastTrait}`;
        }
    }

    description += `.`;

    // Add animal characteristics
    const animalCharacteristics = getAnimalCharacteristics(animal.name);
    description += ` ${animalCharacteristics}`;

    // Add friendship style
    const friendshipStyle = getFriendshipStyle(traits, isSelf);
    description += ` ${friendshipStyle}`;

    return description;
}

// Calculate complementary traits based on user's preferences
function calculateComplementaryTraits(selfTraits: {
    energy: number;
    sociability: number;
    adventurousness: number;
    playfulness: number;
    independence: number;
    nurturance: number;
}, answers: SurveyAnswers): {
    energy: number;
    sociability: number;
    adventurousness: number;
    playfulness: number;
    independence: number;
    nurturance: number;
} {
    // Start with user's traits
    const complementaryTraits = { ...selfTraits };

    // Adjust based on specific preference questions

    // Prefer friends who are similar or different in sociability?
    if (answers[89] === "Introverted") {
        complementaryTraits.sociability = Math.max(20, complementaryTraits.sociability - 30);
    } else if (answers[89] === "Extroverted") {
        complementaryTraits.sociability = Math.min(90, complementaryTraits.sociability + 30);
    }

    // Prefer friends with similar hobbies? 
    // If not important, allow for more diversity in traits
    if (answers[90] === "Not Important") {
        // Add some randomness to traits while keeping within bounds
        complementaryTraits.adventurousness = Math.max(10, Math.min(90, complementaryTraits.adventurousness + (Math.random() * 60 - 30)));
        complementaryTraits.playfulness = Math.max(10, Math.min(90, complementaryTraits.playfulness + (Math.random() * 60 - 30)));
    }

    // Free-form text gives potential hints on desired friends
    if (answers[91] && typeof answers[91] === 'string') {
        const text = answers[91].toLowerCase();

        // Simple text analysis for hints
        if (text.includes('active') || text.includes('energetic') || text.includes('outdoor')) {
            complementaryTraits.energy = Math.min(95, complementaryTraits.energy + 15);
        }

        if (text.includes('quiet') || text.includes('relax') || text.includes('chill')) {
            complementaryTraits.energy = Math.max(15, complementaryTraits.energy - 15);
        }

        if (text.includes('social') || text.includes('group') || text.includes('party')) {
            complementaryTraits.sociability = Math.min(95, complementaryTraits.sociability + 15);
        }

        if (text.includes('adventure') || text.includes('travel') || text.includes('explore')) {
            complementaryTraits.adventurousness = Math.min(95, complementaryTraits.adventurousness + 15);
        }
    }

    // Normalize all values to 0-100 range
    for (const trait in complementaryTraits) {
        complementaryTraits[trait as keyof typeof complementaryTraits] =
            Math.max(0, Math.min(100, complementaryTraits[trait as keyof typeof complementaryTraits]));
    }

    return complementaryTraits;
}

// Get animal-specific characteristics
function getAnimalCharacteristics(animalName: string): string {
    const characteristics: { [key: string]: string } = {
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

    // Add more animal characteristics as needed
    return characteristics[animalName] || `As a ${animalName}, you have a unique blend of qualities that make you a valuable friend.`;
}

// Get friendship style based on traits
function getFriendshipStyle(traits: {
    energy: number;
    sociability: number;
    adventurousness: number;
    playfulness: number;
    independence: number;
    nurturance: number;
}, isSelf: boolean): string {
    const highestTraits = Object.entries(traits)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([trait]) => trait);

    const pronouns = isSelf ? "You value" : "They value";

    if (highestTraits.includes('sociability') && highestTraits.includes('playfulness')) {
        return `${pronouns} friendship that's full of fun activities and social gatherings. Making new connections comes naturally, and friendships tend to be lively and engaging.`;
    }

    if (highestTraits.includes('sociability') && highestTraits.includes('nurturance')) {
        return `${pronouns} being there for friends and creating a supportive community. These friendships often involve emotional support and meaningful conversations.`;
    }

    if (highestTraits.includes('independence') && highestTraits.includes('adventurousness')) {
        return `${pronouns} friends who respect personal space while being up for occasional adventures. These friendships thrive with a balance of solo time and shared experiences.`;
    }

    if (highestTraits.includes('energy') && highestTraits.includes('adventurousness')) {
        return `${pronouns} active, dynamic friendships with plenty of new experiences. These relationships thrive on shared adventures and spontaneous outings.`;
    }

    if (highestTraits.includes('nurturance') && highestTraits.includes('playfulness')) {
        return `${pronouns} supportive friendships with a playful side. These relationships balance fun activities with being there for each other during challenging times.`;
    }

    if (highestTraits.includes('independence') && highestTraits.includes('sociability')) {
        return `${pronouns} a diverse social network with room for personal space. These friendships are adaptable, respecting both social needs and individual autonomy.`;
    }

    // Default friendship style
    return `${pronouns} balanced friendships that adapt to different situations and needs.`;
}