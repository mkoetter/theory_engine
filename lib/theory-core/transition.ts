import { Interval } from 'tonal';
import type { BlockKey, TransitionPlan } from '@/state/theory.types';

/**
 * Plan a transition between two keys.
 * Suggests pivot chords or secondary dominants for smooth modulation.
 */
export function planTransition(
  fromKey: BlockKey,
  toKey: BlockKey
): TransitionPlan {
  const fromTonic = fromKey.tonic;
  const toTonic = toKey.tonic;

  // Same key = no transition needed
  if (fromTonic === toTonic && fromKey.mode === toKey.mode) {
    return {
      type: 'direct',
      chords: [],
      notes: 'Already in the same key - no transition needed.',
    };
  }

  // Calculate interval between keys
  const interval = Interval.distance(fromTonic, toTonic);

  // Find pivot chords (chords that exist in both keys)
  const pivotChords = findPivotChords(fromKey, toKey);

  if (pivotChords.length > 0) {
    return {
      type: 'pivot',
      chords: pivotChords.slice(0, 2), // Suggest up to 2 pivot chords
      notes: `Pivot chord modulation via ${pivotChords[0]}. This chord exists in both ${fromTonic} ${fromKey.mode} and ${toTonic} ${toKey.mode}.`,
    };
  }

  // If no pivot chords, suggest secondary dominant approach
  const secondaryDominant = `V/${getRelativeRoman(toTonic, fromTonic)}`;

  return {
    type: 'secondary',
    chords: [secondaryDominant],
    notes: `Use secondary dominant ${secondaryDominant} to tonicize ${toTonic}. This creates a temporary dominant-tonic relationship.`,
  };
}

/**
 * Find pivot chords that exist in both keys.
 * These are diatonic chords shared between the two keys.
 */
function findPivotChords(fromKey: BlockKey, toKey: BlockKey): string[] {
  const pivots: string[] = [];

  // Common pivot chords for related keys
  const fromTonic = fromKey.tonic;
  const toTonic = toKey.tonic;

  // Relative keys (e.g., C major and A minor)
  if (isRelativeKey(fromKey, toKey)) {
    pivots.push('vi', 'IV', 'ii'); // Common pivots for relative modulation
    return pivots;
  }

  // Parallel keys (e.g., C major and C minor)
  if (fromTonic === toTonic && fromKey.mode !== toKey.mode) {
    pivots.push('I/i', 'iv/IV'); // Shared tonic and subdominant
    return pivots;
  }

  // Closely related keys (one accidental difference)
  const interval = Interval.distance(fromTonic, toTonic);

  switch (interval) {
    case '5P': // Perfect fifth (e.g., C to G)
      pivots.push('V', 'I', 'vi');
      break;
    case '4P': // Perfect fourth (e.g., C to F)
      pivots.push('IV', 'I', 'ii');
      break;
    case '2M': // Major second (e.g., C to D)
      pivots.push('V', 'ii');
      break;
    case '3m': // Minor third
      pivots.push('vi', 'iii');
      break;
    default:
      // Distant keys - no obvious pivot
      break;
  }

  return pivots;
}

/**
 * Check if two keys are relative (e.g., C major and A minor).
 */
function isRelativeKey(key1: BlockKey, key2: BlockKey): boolean {
  if (key1.mode === 'major' && key2.mode === 'minor') {
    const interval = Interval.distance(key1.tonic, key2.tonic);
    return interval === '6M' || interval === '3m'; // Down a minor third
  }

  if (key1.mode === 'minor' && key2.mode === 'major') {
    const interval = Interval.distance(key1.tonic, key2.tonic);
    return interval === '3m' || interval === '6M'; // Up a minor third
  }

  return false;
}

/**
 * Get the roman numeral of a target note relative to a source note.
 * Simplified helper for secondary dominant notation.
 */
function getRelativeRoman(targetNote: string, sourceNote: string): string {
  const interval = Interval.distance(sourceNote, targetNote);

  const romanMap: Record<string, string> = {
    '1P': 'I',
    '2M': 'II',
    '3M': 'III',
    '4P': 'IV',
    '5P': 'V',
    '6M': 'VI',
    '7M': 'VII',
  };

  return romanMap[interval] || 'I';
}
