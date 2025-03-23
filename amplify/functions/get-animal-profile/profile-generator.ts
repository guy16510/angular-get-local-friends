// profile-generator.ts

import { Traits, SurveyAnswers, AnimalProfile, TraitName, TRAITS } from './types';
import { animals, adjectives, getAnimalCharacteristics } from './animals-data';
import { logger } from './utils/logger';
import { profileCache } from './utils/cache';

function findMatchingAnimal(traits: Traits): { name: string; score: number } {
    let bestMatch = { name: '', score: 0 };
    let highestScore = -Infinity;
    animals.forEach(animal => {
        const traitVector = [
            traits[TRAITS.ENERGY],
            traits[TRAITS.SOCIABILITY],
            traits[TRAITS.ADVENTUROUSNESS],
            traits[TRAITS.PLAYFULNESS],
            traits[TRAITS.INDEPENDENCE],
            traits[TRAITS.NURTURANCE]
        ];
        const animalVector = [
            animal.energy,
            animal.sociability,
            animal.adventurousness,
            animal.playfulness,
            animal.independence,
            animal.nurturance
        ];
        let sumSquaredDiff = 0;
        for (let i = 0; i < traitVector.length; i++) {
            sumSquaredDiff += Math.pow(traitVector[i] - animalVector[i], 2);
        }
        const distance = Math.sqrt(sumSquaredDiff);
        const similarityScore = 100 - distance;
        if (similarityScore > highestScore) {
            highestScore = similarityScore;
            bestMatch = { name: animal.name, score: similarityScore };
        }
    });
    logger.info('Found matching animal', { animalName: bestMatch.name, score: bestMatch.score.toFixed(2) });
    return bestMatch;
}

function findSuitableAdjectives(traits: Traits): string[] {
    const suitableAdjectives: string[] = [];
    adjectives.forEach(adjDef => {
        const traitValue = traits[adjDef.trait];
        if ((adjDef.min === undefined || traitValue >= adjDef.min) && (adjDef.max === undefined || traitValue <= adjDef.max)) {
            suitableAdjectives.push(adjDef.adjective);
        }
    });
    if (suitableAdjectives.length > 0) {
        return shuffleArray(suitableAdjectives);
    }
    return ["Balanced"];
}

function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function generateAdditionalDetails(answers: SurveyAnswers): string {
    const details: string[] = [];

    if (answers[5]) {
        const age = Array.isArray(answers[5]) ? answers[5].join(', ') : typeof answers[5] === 'object' ? JSON.stringify(answers[5]) : String(answers[5]);
        details.push(`Age range: ${age}`);
    }
    if (Array.isArray(answers[16])) {
        details.push(`Interests: ${answers[16].join(', ')}`);
    } else if (answers[16]) {
        details.push(`Interests: ${typeof answers[16] === 'object' ? JSON.stringify(answers[16]) : String(answers[16])}`);
    }
    if (answers[18]) {
        details.push(`Enjoys: ${typeof answers[18] === 'object' ? JSON.stringify(answers[18]) : String(answers[18])}`);
    }
    return details.join('\n');
}

export function generateSelfProfile(traits: Traits, answers: SurveyAnswers): AnimalProfile {
    const cacheKey = `self_${JSON.stringify(traits)}_${JSON.stringify(answers)}`;
    const cachedProfile = profileCache.get(cacheKey);
    if (cachedProfile) {
        logger.info('Using cached self profile');
        return cachedProfile;
    }
    const matchingAnimal = findMatchingAnimal(traits);
    const suitableAdjectives = findSuitableAdjectives(traits);
    const adjective = suitableAdjectives[0];
    const animalCharacteristic = getAnimalCharacteristics(matchingAnimal.name);
    const additionalDetails = generateAdditionalDetails(answers);
    const fullDescription = `You are a ${adjective} ${matchingAnimal.name}!\n\n${animalCharacteristic}\n\n${additionalDetails}`;
    const profile: AnimalProfile = {
        animal: matchingAnimal.name,
        adjective,
        fullDescription,
        traits
    };
    profileCache.set(cacheKey, profile);
    return profile;
}

export function generateSeekingProfile(traits: Traits, answers: SurveyAnswers): AnimalProfile {
    const cacheKey = `seeking_${JSON.stringify(traits)}_${JSON.stringify(answers)}`;
    const cachedProfile = profileCache.get(cacheKey);
    if (cachedProfile) {
        logger.info('Using cached seeking profile');
        return cachedProfile;
    }
    const seekingTraits: Traits = {
        [TRAITS.ENERGY]: Math.min(100, Math.max(0, traits[TRAITS.ENERGY] + randomAdjustment(10))),
        [TRAITS.SOCIABILITY]: Math.min(100, Math.max(0, traits[TRAITS.SOCIABILITY] + randomAdjustment(15))),
        [TRAITS.ADVENTUROUSNESS]: traits[TRAITS.ADVENTUROUSNESS] < 50
            ? Math.min(100, traits[TRAITS.ADVENTUROUSNESS] + 10 + randomAdjustment(10))
            : Math.max(0, traits[TRAITS.ADVENTUROUSNESS] - 10 + randomAdjustment(10)),
        [TRAITS.PLAYFULNESS]: Math.min(100, traits[TRAITS.PLAYFULNESS] + randomAdjustment(20)),
        [TRAITS.INDEPENDENCE]: traits[TRAITS.INDEPENDENCE] > 70
            ? Math.max(0, traits[TRAITS.INDEPENDENCE] - 15 + randomAdjustment(10))
            : traits[TRAITS.INDEPENDENCE] < 30
                ? Math.min(100, traits[TRAITS.INDEPENDENCE] + 15 + randomAdjustment(10))
                : traits[TRAITS.INDEPENDENCE] + randomAdjustment(20),
        [TRAITS.NURTURANCE]: traits[TRAITS.NURTURANCE] < 50
            ? Math.min(100, traits[TRAITS.NURTURANCE] + 20 + randomAdjustment(10))
            : Math.max(0, traits[TRAITS.NURTURANCE] - 10 + randomAdjustment(15))
    };
    const matchingAnimal = findMatchingAnimal(seekingTraits);
    const suitableAdjectives = findSuitableAdjectives(seekingTraits);
    const adjective = suitableAdjectives[0];
    const baseDescription = `You're looking for a ${adjective} ${matchingAnimal.name}!\n\n`;
    let lookingForDetails = "You're hoping to connect with friends who ";
    if (seekingTraits[TRAITS.ENERGY] > 70) lookingForDetails += "have high energy and enthusiasm for activities. ";
    else if (seekingTraits[TRAITS.ENERGY] < 30) lookingForDetails += "appreciate quiet, low-key social interactions. ";
    if (seekingTraits[TRAITS.SOCIABILITY] > 70) lookingForDetails += "are outgoing and enjoy regular social gatherings. ";
    else if (seekingTraits[TRAITS.SOCIABILITY] < 30) lookingForDetails += "respect your personal space and understand the value of alone time. ";
    if (seekingTraits[TRAITS.ADVENTUROUSNESS] > 70) lookingForDetails += "love trying new things and exploring new places. ";
    if (seekingTraits[TRAITS.PLAYFULNESS] > 70) lookingForDetails += "bring fun and spontaneity to your friendship. ";
    if (seekingTraits[TRAITS.INDEPENDENCE] > 70) lookingForDetails += "are self-sufficient and have their own interests. ";
    if (seekingTraits[TRAITS.NURTURANCE] > 70) lookingForDetails += "are caring and supportive in times of need. ";
    if (lookingForDetails.trim() === "You're hoping to connect with friends who") {
        lookingForDetails += " share your values and bring positive energy to your life.";
    }
    const fullDescription = baseDescription + lookingForDetails;
    const profile: AnimalProfile = {
        animal: matchingAnimal.name,
        adjective,
        fullDescription,
        traits: seekingTraits
    };
    profileCache.set(cacheKey, profile);
    return profile;
}

function randomAdjustment(range: number): number {
    return Math.floor(Math.random() * (range * 2 + 1)) - range;
}
