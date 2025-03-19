// traits-calculator.ts

import { SurveyAnswers, Traits, TRAITS, TRAIT_THRESHOLDS, TraitName } from './types';
import { traitCache } from './utils/cache';
import { logger } from './utils/logger';

/**
 * Calculate personality traits from survey answers
 * 
 * @param answers Survey answers provided by the user
 * @returns Object containing calculated personality traits
 */
export function calculatePersonalityTraits(answers: SurveyAnswers): Traits {
    const cacheKey = Object.entries(answers)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([k, v]) => `${k}:${Array.isArray(v) ? v.join(',') : v}`)
        .join('|');
    
    // Check cache first
    const cachedTraits = traitCache.get(cacheKey);
    if (cachedTraits) {
        logger.info('Using cached traits', { cacheKey });
        return cachedTraits;
    }
    
    // Initialize traits with default middle values
    const traits: Traits = {
        [TRAITS.ENERGY]: 50,
        [TRAITS.SOCIABILITY]: 50,
        [TRAITS.ADVENTUROUSNESS]: 50,
        [TRAITS.PLAYFULNESS]: 50,
        [TRAITS.INDEPENDENCE]: 50,
        [TRAITS.NURTURANCE]: 50
    };

    try {
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
        if (answers[18] === "Relaxing on the couch with a good book/show") {
            traits.energy -= 10;
            traits.adventurousness -= 10;
        }
        
        if (answers[20] === "Often - I love trying new things!") traits.adventurousness += 20;
        if (answers[20] === "Rarely - I prefer my familiar favorites") traits.adventurousness -= 15;
        
        // Independence & Nurturance questions
        if (answers[22] === "Take charge and lead") {
            traits.independence += 15;
            traits.energy += 10;
        }
        if (answers[22] === "Support from behind the scenes") {
            traits.nurturance += 15;
            traits.independence -= 10;
        }
        
        // Additional personality indicators
        if (answers[35] === "Spontaneous and flexible") {
            traits.adventurousness += 10;
            traits.playfulness += 10;
        }
        if (answers[35] === "Planned and structured") {
            traits.independence += 10;
            traits.adventurousness -= 5;
        }
        
        if (answers[40] === "I'm usually the one helping others") traits.nurturance += 20;
        if (answers[40] === "I prefer to solve my own problems") traits.independence += 15;
        
        // Cap traits at min/max values (0-100)
        Object.keys(traits).forEach(key => {
            const traitKey = key as TraitName;
            traits[traitKey] = Math.max(0, Math.min(100, traits[traitKey]));
        });
        
        // Store in cache
        logger.info('Calculated traits', { traits });
        traitCache.set(cacheKey, traits);
        
        return traits;
    } catch (error) {
        logger.error('Error calculating traits', error);
        return traits; // Return default traits in case of error
    }
}
