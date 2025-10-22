/**
 * Guitar Chords - Voicing Engine
 *
 * PURPOSE:
 * Find, filter, and rank alternative guitar chord voicings.
 * Calculate playability scores and optimize for smooth chord transitions.
 *
 * FEATURES:
 * - Filter voicings by position, difficulty, and technique
 * - Calculate playability/difficulty scores
 * - Optimize chord progressions for smooth transitions
 * - Support for various playing styles
 *
 * @module guitar-chords/voicing-engine
 */

import { Fingering, VoicingFilters } from './types';
import { mapChordToFingerings } from './chord-mapper';
import { calculateStretch } from './fingering-db';

// ============================================================
// CONSTANTS
// ============================================================

/**
 * Difficulty scoring weights for various factors.
 */
const DIFFICULTY_WEIGHTS = Object.freeze({
  STRETCH: 10, // Penalty per fret of stretch
  BARRE: 15, // Penalty for barre chords
  HIGH_POSITION: 5, // Penalty per fret above 5th
  MUTED_STRINGS: 3, // Small penalty for muted strings
  FINGER_COUNT: 5, // Penalty per finger used
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Calculate comprehensive difficulty score for a fingering.
 * Lower scores indicate easier fingerings.
 *
 * @param fingering - Fingering to score
 * @returns Difficulty score (0-100, lower is easier)
 */
function calculateDifficultyScore(fingering: Fingering): number {
  let score = fingering.difficulty || 50; // Base score from database

  // Add stretch penalty
  const stretch = calculateStretch(fingering);
  score += stretch * DIFFICULTY_WEIGHTS.STRETCH;

  // Add barre penalty
  if (fingering.isBarre) {
    score += DIFFICULTY_WEIGHTS.BARRE;
  }

  // Add high position penalty
  const position = fingering.position || 0;
  if (position > 5) {
    score += (position - 5) * DIFFICULTY_WEIGHTS.HIGH_POSITION;
  }

  // Add muted string penalty
  const mutedCount = fingering.frets.filter(f => f === 'x').length;
  score += mutedCount * DIFFICULTY_WEIGHTS.MUTED_STRINGS;

  // Add finger count penalty
  const activeFingers = new Set(fingering.fingers.filter(f => f > 0)).size;
  score += activeFingers * DIFFICULTY_WEIGHTS.FINGER_COUNT;

  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, score));
}

/**
 * Check if a fingering is an open position voicing.
 * Open position means it contains at least one open string (fret 0).
 */
function isOpenVoicing(fingering: Fingering): boolean {
  return fingering.frets.some(f => f === 0);
}

/**
 * Check if a fingering is a barre chord.
 */
function isBarreChord(fingering: Fingering): boolean {
  return fingering.isBarre === true;
}

/**
 * Get the position range of a fingering (lowest to highest fret).
 */
function getPositionRange(fingering: Fingering): { min: number; max: number } {
  const activeFrets = fingering.frets.filter((f): f is number => typeof f === 'number' && f > 0);

  if (activeFrets.length === 0) {
    return { min: 0, max: 0 };
  }

  return {
    min: Math.min(...activeFrets),
    max: Math.max(...activeFrets),
  };
}

/**
 * Check if fingering matches the provided filters.
 */
function matchesFilters(fingering: Fingering, filters?: VoicingFilters): boolean {
  if (!filters) return true;

  const range = getPositionRange(fingering);

  // Check fret range
  if (filters.maxFret !== undefined && range.max > filters.maxFret) {
    return false;
  }

  if (filters.minFret !== undefined && range.min < filters.minFret) {
    return false;
  }

  // Check open only
  if (filters.openOnly && !isOpenVoicing(fingering)) {
    return false;
  }

  // Check barre only
  if (filters.barreOnly && !isBarreChord(fingering)) {
    return false;
  }

  // Check stretch
  if (filters.maxStretch !== undefined) {
    const stretch = calculateStretch(fingering);
    if (stretch > filters.maxStretch) {
      return false;
    }
  }

  // Check difficulty level
  if (filters.difficulty) {
    const score = calculateDifficultyScore(fingering);
    switch (filters.difficulty) {
      case 'easy':
        if (score > 60) return false;
        break;
      case 'medium':
        if (score < 40 || score > 75) return false;
        break;
      case 'hard':
        if (score < 60) return false;
        break;
    }
  }

  // Check string set preference
  if (filters.stringSet) {
    const hasLowE = fingering.frets[0] !== 'x';
    const hasHighE = fingering.frets[5] !== 'x';

    switch (filters.stringSet) {
      case 'bass':
        if (!hasLowE) return false;
        break;
      case 'treble':
        if (!hasHighE) return false;
        break;
      case 'middle':
        if (hasLowE || hasHighE) return false;
        break;
    }
  }

  return true;
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Find alternative voicings for a chord symbol with optional filters.
 *
 * Returns all matching voicings sorted by difficulty (easiest first).
 *
 * @param chordSymbol - Chord symbol (e.g., "Cmaj7", "Am")
 * @param filters - Optional filters for voicing selection
 * @returns Array of matching fingerings, sorted by difficulty
 *
 * @example
 * findAlternativeVoicings('Cmaj7', { maxFret: 5, openOnly: false })
 * // => [{ root: 'C', type: 'M7', frets: [...], difficulty: 45 }, ...]
 *
 * findAlternativeVoicings('G', { openOnly: true })
 * // => [{ root: 'G', type: 'maj', frets: [3, 2, 0, 0, 0, 3], difficulty: 50 }]
 */
export function findAlternativeVoicings(
  chordSymbol: string,
  filters?: VoicingFilters
): Fingering[] {
  const guitarChord = mapChordToFingerings(chordSymbol);

  if (!guitarChord || guitarChord.voicings.length === 0) {
    return [];
  }

  // Filter and score voicings
  const scoredVoicings = guitarChord.voicings
    .filter(v => matchesFilters(v, filters))
    .map(v => ({
      ...v,
      calculatedDifficulty: calculateDifficultyScore(v),
    }));

  // Sort by difficulty (easiest first)
  scoredVoicings.sort((a, b) => a.calculatedDifficulty - b.calculatedDifficulty);

  // Remove calculated difficulty field and return
  return scoredVoicings.map(({ calculatedDifficulty, ...fingering }) => fingering);
}

/**
 * Get only open position voicings for a chord.
 *
 * Convenience function for common use case.
 *
 * @param chordSymbol - Chord symbol
 * @returns Array of open position fingerings
 *
 * @example
 * getOpenVoicings('C') // => [...open C major voicings...]
 */
export function getOpenVoicings(chordSymbol: string): Fingering[] {
  return findAlternativeVoicings(chordSymbol, { openOnly: true });
}

/**
 * Get only barre chord voicings for a chord.
 *
 * @param chordSymbol - Chord symbol
 * @returns Array of barre chord fingerings
 *
 * @example
 * getBarreVoicings('F') // => [...barre F major voicings...]
 */
export function getBarreVoicings(chordSymbol: string): Fingering[] {
  return findAlternativeVoicings(chordSymbol, { barreOnly: true });
}

/**
 * Get easiest voicings for a chord (top 3).
 *
 * @param chordSymbol - Chord symbol
 * @returns Array of up to 3 easiest fingerings
 *
 * @example
 * getEasiestVoicings('Cmaj7') // => [easiest, 2nd easiest, 3rd easiest]
 */
export function getEasiestVoicings(chordSymbol: string): Fingering[] {
  const voicings = findAlternativeVoicings(chordSymbol);
  return voicings.slice(0, 3);
}

/**
 * Calculate transition difficulty between two fingerings.
 *
 * Analyzes finger movement, position changes, and common tones.
 * Lower scores indicate smoother transitions.
 *
 * @param from - Starting fingering
 * @param to - Target fingering
 * @returns Transition difficulty score (0-100)
 *
 * @example
 * const cmaj = { frets: ['x', 3, 2, 0, 1, 0], ... };
 * const gmaj = { frets: [3, 2, 0, 0, 0, 3], ... };
 * calculateTransitionDifficulty(cmaj, gmaj) // => 35
 */
export function calculateTransitionDifficulty(from: Fingering, to: Fingering): number {
  let score = 0;

  // Calculate position change
  const fromRange = getPositionRange(from);
  const toRange = getPositionRange(to);
  const positionChange = Math.abs(fromRange.min - toRange.min);
  score += positionChange * 5;

  // Calculate finger movement
  let totalMovement = 0;
  for (let i = 0; i < 6; i++) {
    const fromFret = typeof from.frets[i] === 'number' ? from.frets[i] : 0;
    const toFret = typeof to.frets[i] === 'number' ? to.frets[i] : 0;
    totalMovement += Math.abs((fromFret as number) - (toFret as number));
  }
  score += totalMovement * 2;

  // Penalize barre changes
  if (from.isBarre !== to.isBarre) {
    score += 20;
  }

  // Reward common strings
  let commonStrings = 0;
  for (let i = 0; i < 6; i++) {
    if (from.frets[i] === to.frets[i] && from.frets[i] !== 'x') {
      commonStrings++;
    }
  }
  score -= commonStrings * 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Optimize voicing selection for a chord progression.
 *
 * Selects voicings that minimize transition difficulty across the progression.
 *
 * @param chordSymbols - Array of chord symbols in order
 * @param filters - Optional filters for voicing selection
 * @returns Array of optimized fingerings
 *
 * @example
 * optimizeProgression(['C', 'Am', 'F', 'G'])
 * // => [cMajFingering, aMinFingering, fMajFingering, gMajFingering]
 * // Selected to minimize transition difficulty
 */
export function optimizeProgression(
  chordSymbols: string[],
  filters?: VoicingFilters
): Fingering[] {
  if (chordSymbols.length === 0) return [];

  const result: Fingering[] = [];

  // Get voicing options for each chord
  const allOptions = chordSymbols.map(symbol => findAlternativeVoicings(symbol, filters));

  // Handle empty results
  if (allOptions.some(opts => opts.length === 0)) {
    // Fall back to best available for each chord
    return chordSymbols.map(symbol => findAlternativeVoicings(symbol)[0]).filter(Boolean);
  }

  // Start with easiest voicing for first chord
  result.push(allOptions[0][0]);

  // For each subsequent chord, pick voicing with smoothest transition
  for (let i = 1; i < chordSymbols.length; i++) {
    const previousFingering = result[i - 1];
    const options = allOptions[i];

    // Score each option by transition difficulty
    const scored = options.map(fingering => ({
      fingering,
      transitionScore: calculateTransitionDifficulty(previousFingering, fingering),
    }));

    // Sort by transition score and pick best
    scored.sort((a, b) => a.transitionScore - b.transitionScore);
    result.push(scored[0].fingering);
  }

  return result;
}
