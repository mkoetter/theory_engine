import { parseRoman } from './convert';
import { analyzeFunctionalLabel } from './analysis';
import type { BlockKey, TensionPoint } from '@/state/theory.types';

/**
 * Calculate tension curve for a progression.
 * Tension is based on:
 * - Distance from tonic (scale degree distance)
 * - Dominant weight (V chords add tension)
 * - Proximity to cadence (tension increases before resolution)
 * - Borrowed/chromatic chords add tension
 */
export function calculateTensionCurve(
  romans: string[],
  key: BlockKey
): TensionPoint[] {
  const tensionPoints: TensionPoint[] = [];
  let currentBar = 0;

  romans.forEach((roman, idx) => {
    const tension = calculateChordTension(roman, idx, romans, key);

    tensionPoints.push({
      bar: currentBar,
      value: tension,
    });

    currentBar += 1; // Simplified: assuming 1 bar per chord
  });

  return tensionPoints;
}

/**
 * Calculate the tension value for a single chord.
 * Returns a value between 0 (stable/resolved) and 1 (maximum tension).
 */
function calculateChordTension(
  roman: string,
  index: number,
  allRomans: string[],
  key: BlockKey
): number {
  let tension = 0;

  // Base tension from functional role
  const func = analyzeFunctionalLabel(roman, key);
  switch (func) {
    case 'T':
      tension += 0.1; // Tonic is most stable
      break;
    case 'SD':
      tension += 0.4; // Subdominant has moderate tension
      break;
    case 'D':
      tension += 0.7; // Dominant has high tension
      break;
  }

  // Add tension for dominant chords specifically
  if (roman.includes('V') || roman.includes('v')) {
    tension += 0.2;
  }

  // Add tension for secondary dominants
  if (roman.includes('/')) {
    tension += 0.3;
  }

  // Add tension for borrowed chords
  if (roman.includes('b') || roman.includes('#')) {
    tension += 0.2;
  }

  // Add tension for diminished/augmented qualities
  if (roman.includes('°') || roman.includes('ø') || roman.includes('+')) {
    tension += 0.15;
  }

  // Cadence proximity: increase tension before resolution
  if (index < allRomans.length - 1) {
    const nextChord = allRomans[index + 1];
    const nextFunc = analyzeFunctionalLabel(nextChord, key);

    // If current is dominant and next is tonic, we're at peak tension
    if (func === 'D' && nextFunc === 'T') {
      tension += 0.15;
    }
  }

  // Distance from tonic (scale degree)
  const parsed = parseRoman(roman);
  if (parsed) {
    const degree = parsed.degree;
    // Tritone is maximum distance
    const distanceFromTonic = Math.abs(degree - 1);
    const normalizedDistance = Math.min(distanceFromTonic / 6, 0.3);
    tension += normalizedDistance;
  }

  // Normalize to 0-1 range
  return Math.min(tension, 1.0);
}

/**
 * Get a human-readable description of the tension level.
 */
export function describeTension(value: number): string {
  if (value < 0.3) return 'Stable/Resolved';
  if (value < 0.5) return 'Moderate Tension';
  if (value < 0.7) return 'Building Tension';
  return 'High Tension';
}
