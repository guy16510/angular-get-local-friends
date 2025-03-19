// config.ts

import { TRAITS } from '../types';

export const CONFIG = {
  traits: {
    thresholds: {
      high: 70,
      veryHigh: 80,
      low: 30,
      veryLow: 20
    },
    adjustments: {
      // Specifies how much to adjust traits based on answers
      socialEvents: {
        love: 20,
        avoid: -20
      },
      connectionSpeed: {
        instantly: 15,
        slowly: -15
      }
    }
  },
  matching: {
    // Weight different traits in the matching algorithm
    weights: {
      [TRAITS.ENERGY]: 1,
      [TRAITS.SOCIABILITY]: 1,
      [TRAITS.ADVENTUROUSNESS]: 1,
      [TRAITS.PLAYFULNESS]: 1,
      [TRAITS.INDEPENDENCE]: 1,
      [TRAITS.NURTURANCE]: 1
    }
  },
  cache: {
    maxSize: 1000, // Maximum number of cached items
    ttl: 3600000 // Time-to-live in milliseconds (1 hour)
  }
};
