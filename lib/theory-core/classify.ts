import { parseRoman } from './convert';
import type { BlockKey, OriginTag, ChordClassification } from '@/state/theory.types';

/**
 * Classify a chord by its origin (diatonic, borrowed, secondary, etc.).
 * This is a simplified initial implementation - full classification
 * logic will be added in Milestone 2.
 */
export function classifyChord(
  roman: string,
  key: BlockKey
): ChordClassification {
  const parsed = parseRoman(roman);

  if (!parsed) {
    return {
      origin: 'custom',
      quality: 'unknown',
    };
  }

  const { degree, quality, accidentals } = parsed;

  // Simplified classification logic
  // Full implementation will handle borrowed chords, secondary dominants, etc.

  // If there are accidentals, it's likely borrowed or chromatic
  if (accidentals) {
    // Simple heuristic: flat accidentals often indicate borrowed chords
    if (accidentals.includes('b')) {
      return {
        origin: 'borrowed',
        quality,
      };
    }
    // Sharp accidentals might indicate secondary dominants
    if (accidentals.includes('#')) {
      return {
        origin: 'secondary',
        quality,
      };
    }
  }

  // Check for secondary dominants (e.g., V/V, V/ii)
  if (roman.includes('/')) {
    return {
      origin: 'secondary',
      quality,
    };
  }

  // Default to diatonic if no special characteristics
  return {
    origin: 'diatonic',
    quality,
  };
}
