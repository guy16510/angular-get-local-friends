// profile-generator.ts

import { Traits, SurveyAnswers, AnimalProfile, TraitName, TRAITS } from './types';
import { animals, adjectives, getAnimalCharacteristics } from './animals-data';
import { logger } from './utils/logger';
import { profileCache } from './utils/cache';

/**
 * Find the best matching animal based on personality traits
 * 
 * @param traits Personality traits calculated from survey answers
 * @returns Best matching animal name and calculated similarity score
 */
function findMatchingAnimal(traits: Traits): { name: string; score: number } {
    let bestMatch = { name: '', score: 0 };
    let highestScore = -Infinity;
    
    // Calculate Euclidean distance between trait vectors
    animals.forEach(animal => {
        // Convert traits to array format for easier calculation
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
        
        // Calculate inverse Euclidean distance (higher is better match)
        let sumSquaredDiff = 0;
        for (let i = 0; i < traitVector.length; i++) {
            sumSquaredDiff += Math.pow(traitVector[i] - animalVector[i], 2);
        }
        const distance = Math.sqrt(sumSquaredDiff);
        const similarityScore = 100 - distance; // Convert to similarity score
        
        if (similarityScore > highestScore) {
            highestScore = similarityScore;
            bestMatch = { name: animal.name, score: similarityScore };
        }
    });
    
    logger.info('Found matching animal', { 
        animalName: bestMatch.name, 
        score: bestMatch.score.toFixed(2) 
    });
    
    return bestMatch;
}

/**
 * Find suitable adjectives for the profile based on trait values
 * 
 * @param traits Personality traits
 * @returns Array of suitable adjectives
 */
function findSuitableAdjectives(traits: Traits): string[] {
    const suitableAdjectives: string[] = [];
    
    // Check each adjective definition against traits
    adjectives.forEach(adjDef => {
        const traitValue = traits[adjDef.trait];
        
        // Check if trait value meets min/max criteria
        if (
            (adjDef.min === undefined || traitValue >= adjDef.min) &&
            (adjDef.max === undefined || traitValue <= adjDef.max)
        ) {
            suitableAdjectives.push(adjDef.adjective);
        }
    });
    
    // Get a random adjective if we have multiple options
    if (suitableAdjectives.length > 0) {
        // Shuffle array to get random ordering
        return shuffleArray(suitableAdjectives);
    }
    
    return ["Balanced"]; // Default if no suitable adjectives found
}

/**
 * Shuffle array elements (Fisher-Yates algorithm)
 */
function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/**
 * Generate additional profile details based on survey answers
 */
function generateAdditionalDetails(answers: SurveyAnswers): string {
    const details: string[] = [];
  
    if (answers[5]) {
      details.push(`Age range: ${answers[5]}`);
    }
  
    if (Array.isArray(answers[16])) {
      details.push(`Interests: ${answers[16].join(', ')}`);
    }
  
    if (answers[18]) {
      details.push(`Enjoys: ${answers[18]}`);
    }
  
    return details.join('\n');
  }

/**
 * Generate self profile based on calculated traits and survey answers
 */
export function generateSelfProfile(traits: Traits, answers: SurveyAnswers): AnimalProfile {
    const cacheKey = `self_${JSON.stringify(traits)}_${JSON.stringify(answers)}`;
    const cachedProfile = profileCache.get(cacheKey);
    
    if (cachedProfile) {
        logger.info('Using cached self profile');
        return cachedProfile;
    }
    
    const matchingAnimal = findMatchingAnimal(traits);
    const suitableAdjectives = findSuitableAdjectives(traits);
    const adjective = suitableAdjectives[0]; // Use first adjective
    
    // Get animal characteristics
    const animalCharacteristic = getAnimalCharacteristics(matchingAnimal.name);
    
    // Create full description
    const additionalDetails = generateAdditionalDetails(answers);
    const fullDescription = `You are a ${adjective} ${matchingAnimal.name}!\n\n${animalCharacteristic}\n\n${additionalDetails}`;
    
    const profile: AnimalProfile = {
        animal: matchingAnimal.name,
        adjective,
        fullDescription,
        traits
    };
    
    // Cache the profile
    profileCache.set(cacheKey, profile);
    
    return profile;
}

/**
 * Generate seeking profile based on calculated traits and survey answers
 */
export function generateSeekingProfile(traits: Traits, answers: SurveyAnswers): AnimalProfile {
    const cacheKey = `seeking_${JSON.stringify(traits)}_${JSON.stringify(answers)}`;
    const cachedProfile = profileCache.get(cacheKey);
    
    if (cachedProfile) {
        logger.info('Using cached seeking profile');
        return cachedProfile;
    }
    
    // Create complementary traits for friend profile
    // This implements a "birds of a feather" approach with some complementary aspects
    const seekingTraits: Traits = {
        // Keep energy level somewhat similar
        [TRAITS.ENERGY]: Math.min(100, Math.max(0, traits[TRAITS.ENERGY] + randomAdjustment(10))),
        
        // For sociability, look for somewhat similar (±15)
        [TRAITS.SOCIABILITY]: Math.min(100, Math.max(0, traits[TRAITS.SOCIABILITY] + randomAdjustment(15))),
        
        // For adventurousness, look for slightly higher if low, slightly lower if high
        [TRAITS.ADVENTUROUSNESS]: traits[TRAITS.ADVENTUROUSNESS] < 50 
            ? Math.min(100, traits[TRAITS.ADVENTUROUSNESS] + 10 + randomAdjustment(10))
            : Math.max(0, traits[TRAITS.ADVENTUROUSNESS] - 10 + randomAdjustment(10)),
        
        // For playfulness, look for similar or higher
        [TRAITS.PLAYFULNESS]: Math.min(100, traits[TRAITS.PLAYFULNESS] + randomAdjustment(20)),
        
        // For independence, balance with your own
        [TRAITS.INDEPENDENCE]: traits[TRAITS.INDEPENDENCE] > 70
            ? Math.max(0, traits[TRAITS.INDEPENDENCE] - 15 + randomAdjustment(10)) // If very independent, look for less independent
            : traits[TRAITS.INDEPENDENCE] < 30
              ? Math.min(100, traits[TRAITS.INDEPENDENCE] + 15 + randomAdjustment(10)) // If not independent, look for more independent
              : traits[TRAITS.INDEPENDENCE] + randomAdjustment(20), // Otherwise, similar level
        
        // For nurturance, complement your own
        [TRAITS.NURTURANCE]: traits[TRAITS.NURTURANCE] < 50
            ? Math.min(100, traits[TRAITS.NURTURANCE] + 20 + randomAdjustment(10)) // If low nurturance, look for higher
            : Math.max(0, traits[TRAITS.NURTURANCE] - 10 + randomAdjustment(15)) // If high nurturance, look for slightly less
    };
    
    const matchingAnimal = findMatchingAnimal(seekingTraits);
    const suitableAdjectives = findSuitableAdjectives(seekingTraits);
    const adjective = suitableAdjectives[0]; // Use first adjective
    
    // Create full description
    const baseDescription = `You're looking for a ${adjective} ${matchingAnimal.name}!\n\n`;
    
    // Create a description of what you're looking for based on the complementary traits
    let lookingForDetails = "You're hoping to connect with friends who ";
    
    // Add specific friendship qualities based on seeking traits
    if (seekingTraits[TRAITS.ENERGY] > 70) {
        lookingForDetails += "have high energy and enthusiasm for activities. ";
    } else if (seekingTraits[TRAITS.ENERGY] < 30) {
        lookingForDetails += "appreciate quiet, low-key social interactions. ";
    }
    
    if (seekingTraits[TRAITS.SOCIABILITY] > 70) {
        lookingForDetails += "are outgoing and enjoy regular social gatherings. ";
    } else if (seekingTraits[TRAITS.SOCIABILITY] < 30) {
        lookingForDetails += "respect your personal space and understand the value of alone time. ";
    }
    
    if (seekingTraits[TRAITS.ADVENTUROUSNESS] > 70) {
        lookingForDetails += "love trying new things and exploring new places. ";
    }
    
    if (seekingTraits[TRAITS.PLAYFULNESS] > 70) {
        lookingForDetails += "bring fun and spontaneity to your friendship. ";
    }
    
    if (seekingTraits[TRAITS.INDEPENDENCE] > 70) {
        lookingForDetails += "are self-sufficient and have their own interests. ";
    }
    
    if (seekingTraits[TRAITS.NURTURANCE] > 70) {
        lookingForDetails += "are caring and supportive in times of need. ";
    }
    
    const fullDescription = baseDescription + lookingForDetails;
    
    const profile: AnimalProfile = {
        animal: matchingAnimal.name,
        adjective,
        fullDescription,
        traits: seekingTraits
    };
    
    // Cache the profile
    profileCache.set(cacheKey, profile);
    
    return profile;
}

/**
 * Generate a random adjustment within a range (-range to +range)
 */
function randomAdjustment(range: number): number {
    return Math.floor(Math.random() * (range * 2 + 1)) - range;
}
