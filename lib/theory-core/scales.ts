/**
 * Scale Enhancements Module
 *
 * PURPOSE:
 * Provides comprehensive scale analysis, exotic scale support, and
 * compatibility detection for building sophisticated harmonic tools.
 *
 * CAPABILITIES:
 * - Export scale note arrays and interval structures
 * - Support for exotic and world scales
 * - Compatible scale detection for keys and chords
 * - Scale analysis (symmetry, patterns, characteristics)
 *
 * USAGE:
 * This module extends Tonal.js Scale functionality with additional
 * analysis tools and exotic scale definitions.
 *
 * @example
 * ```typescript
 * import { getScaleInfo, getCompatibleScales, getExoticScales } from '@/lib/theory-core/scales';
 *
 * const info = getScaleInfo('C', 'major');
 * // => { notes: ['C', 'D', 'E', ...], intervals: ['1P', '2M', '3M', ...], ... }
 *
 * const compatible = getCompatibleScales('C', 'major');
 * // => ['C major pentatonic', 'C blues', 'C mixolydian', ...]
 * ```
 */

import { Scale, Note, Interval } from 'tonal';

// ============================================================
// CONSTANTS
// ============================================================

/**
 * Exotic and world scales not commonly found in Western music.
 * Each entry includes the scale name and its interval pattern.
 */
export const EXOTIC_SCALES = Object.freeze({
  // Pentatonic variations
  'major pentatonic': ['1P', '2M', '3M', '5P', '6M'],
  'minor pentatonic': ['1P', '3m', '4P', '5P', '7m'],
  'egyptian': ['1P', '2M', '4P', '5P', '7m'],
  'hirajoshi': ['1P', '2M', '3m', '5P', '6m'],

  // Blues scales
  'blues': ['1P', '3m', '4P', '5d', '5P', '7m'],
  'blues major': ['1P', '2M', '3m', '3M', '5P', '6M'],

  // Symmetrical scales
  'whole tone': ['1P', '2M', '3M', '4A', '5A', '7m'],
  'diminished': ['1P', '2M', '3m', '4P', '5d', '6m', '6M', '7M'], // Half-whole
  'augmented': ['1P', '3m', '3M', '5P', '5A', '7M'],

  // Middle Eastern
  'harmonic minor': ['1P', '2M', '3m', '4P', '5P', '6m', '7M'],
  'phrygian dominant': ['1P', '2m', '3M', '4P', '5P', '6m', '7m'],
  'double harmonic': ['1P', '2m', '3M', '4P', '5P', '6m', '7M'],

  // Japanese
  'in sen': ['1P', '2m', '4P', '5P', '7m'],
  'iwato': ['1P', '2m', '4P', '5d', '7m'],
  'yo': ['1P', '2M', '4P', '5P', '6M'],

  // Indian
  'raga bhairav': ['1P', '2m', '3M', '4P', '5P', '6m', '7M'],
  'raga todi': ['1P', '2m', '3m', '4A', '5P', '6m', '7M'],

  // Other exotic
  'spanish': ['1P', '2m', '3M', '4P', '5P', '6m', '7m'], // Phrygian dominant
  'gypsy': ['1P', '2M', '3m', '4A', '5P', '6m', '7M'],
  'enigmatic': ['1P', '2m', '3M', '4A', '5A', '6A', '7M'],
  'prometheus': ['1P', '2M', '3M', '4A', '6M', '7m'],
});

/**
 * Scale characteristics for analysis and classification.
 */
interface ScaleCharacteristics {
  isSymmetrical: boolean;
  isPentatonic: boolean;
  isHeptatonic: boolean;
  hasAugmentedIntervals: boolean;
  hasDiminishedIntervals: boolean;
  pattern?: string; // e.g., "1-2-1-2" for diminished
}

/**
 * Complete scale information including notes, intervals, and analysis.
 */
export interface ScaleInfo {
  /** Scale name */
  name: string;

  /** Root/tonic note */
  tonic: string;

  /** Array of note names in the scale */
  notes: string[];

  /** Array of intervals from root */
  intervals: string[];

  /** Number of notes in scale */
  noteCount: number;

  /** Scale characteristics */
  characteristics: ScaleCharacteristics;

  /** Aliases for this scale */
  aliases: string[];
}

/**
 * Compatible scale suggestion with reasoning.
 */
export interface CompatibleScale {
  /** Full scale name (e.g., "C major pentatonic") */
  name: string;

  /** Scale type (e.g., "major pentatonic") */
  type: string;

  /** Reason for compatibility */
  reason: string;

  /** Common notes count */
  commonNotesCount: number;
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Get comprehensive information about a scale.
 *
 * Returns notes, intervals, and analytical characteristics for any scale.
 * Supports both standard and exotic scales.
 *
 * @param tonic - Root note of the scale
 * @param scaleName - Name of the scale (e.g., 'major', 'blues', 'phrygian dominant')
 * @returns Complete scale information
 *
 * @example
 * getScaleInfo('C', 'major')
 * // => { notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'], intervals: [...], ... }
 *
 * getScaleInfo('D', 'blues')
 * // => { notes: ['D', 'F', 'G', 'Ab', 'A', 'C'], ... }
 */
export function getScaleInfo(tonic: string, scaleName: string): ScaleInfo {
  // Input validation
  if (!tonic || typeof tonic !== 'string') {
    throw new Error('Tonic must be a non-empty string');
  }

  if (!scaleName || typeof scaleName !== 'string') {
    throw new Error('Scale name must be a non-empty string');
  }

  // Try Tonal first
  let scale = Scale.get(`${tonic} ${scaleName}`);

  // If not found, try exotic scales
  if (!scale.notes || scale.notes.length === 0) {
    const intervals = EXOTIC_SCALES[scaleName as keyof typeof EXOTIC_SCALES];
    if (intervals) {
      const notes = intervals.map(interval => Note.transpose(tonic, interval));
      scale = {
        ...scale,
        name: scaleName,
        tonic,
        notes,
        intervals,
      };
    }
  }

  if (!scale.notes || scale.notes.length === 0) {
    throw new Error(`Unknown scale: ${scaleName}`);
  }

  // Analyze characteristics
  const characteristics = analyzeScaleCharacteristics(scale.intervals || []);

  return {
    name: scale.name || scaleName,
    tonic: scale.tonic || tonic,
    notes: scale.notes,
    intervals: scale.intervals || [],
    noteCount: scale.notes.length,
    characteristics,
    aliases: scale.aliases || [],
  };
}

/**
 * Get all notes in a scale as an array.
 *
 * Convenience function for quickly getting scale notes.
 *
 * @param tonic - Root note
 * @param scaleName - Scale type
 * @returns Array of note names
 *
 * @example
 * getScaleNotes('C', 'major')
 * // => ['C', 'D', 'E', 'F', 'G', 'A', 'B']
 */
export function getScaleNotes(tonic: string, scaleName: string): string[] {
  return getScaleInfo(tonic, scaleName).notes;
}

/**
 * Get interval structure of a scale.
 *
 * Returns the intervals from the root that define the scale.
 *
 * @param tonic - Root note
 * @param scaleName - Scale type
 * @returns Array of interval notations (e.g., ['1P', '2M', '3M', ...])
 *
 * @example
 * getScaleIntervals('C', 'major')
 * // => ['1P', '2M', '3M', '4P', '5P', '6M', '7M']
 */
export function getScaleIntervals(tonic: string, scaleName: string): string[] {
  return getScaleInfo(tonic, scaleName).intervals;
}

/**
 * Get list of all available exotic scales.
 *
 * Returns an array of exotic scale names that can be used with getScaleInfo.
 *
 * @returns Array of exotic scale names
 *
 * @example
 * getExoticScales()
 * // => ['major pentatonic', 'blues', 'whole tone', 'hirajoshi', ...]
 */
export function getExoticScales(): string[] {
  return Object.keys(EXOTIC_SCALES);
}

/**
 * Find scales compatible with a given key.
 *
 * Analyzes the notes in the key and suggests scales that share
 * similar note collections, useful for improvisation and composition.
 *
 * @param tonic - Root note
 * @param mode - Mode or scale type
 * @returns Array of compatible scales with reasoning
 *
 * @example
 * getCompatibleScales('C', 'major')
 * // => [
 * //   { name: 'C major pentatonic', reason: 'Subset of C major', ... },
 * //   { name: 'C mixolydian', reason: 'Parallel mode', ... },
 * //   ...
 * // ]
 */
export function getCompatibleScales(tonic: string, mode: string): CompatibleScale[] {
  const sourceScale = getScaleInfo(tonic, mode);
  const sourceNotes = new Set(sourceScale.notes.map(n => Note.chroma(n)));
  const compatible: CompatibleScale[] = [];

  // Get all standard modes
  const standardModes = ['major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian'];

  // Get all exotic scales
  const exoticScales = getExoticScales();

  // Combine all scales to check
  const allScales = [...standardModes, ...exoticScales];

  for (const scaleName of allScales) {
    try {
      const testScale = getScaleInfo(tonic, scaleName);
      const testNotes = new Set(testScale.notes.map(n => Note.chroma(n)));

      // Calculate common notes
      const commonNotes = [...testNotes].filter(n => sourceNotes.has(n)).length;

      // Determine if compatible (at least 4 common notes for heptatonic, 3 for pentatonic)
      const threshold = testScale.noteCount <= 5 ? 3 : 4;

      if (commonNotes >= threshold && scaleName !== mode) {
        let reason = '';

        if (testScale.noteCount < sourceScale.noteCount) {
          reason = `Subset scale with ${commonNotes} common notes`;
        } else if (testScale.noteCount === sourceScale.noteCount) {
          reason = `Parallel mode with ${commonNotes} common notes`;
        } else {
          reason = `Extended scale with ${commonNotes} common notes`;
        }

        compatible.push({
          name: `${tonic} ${scaleName}`,
          type: scaleName,
          reason,
          commonNotesCount: commonNotes,
        });
      }
    } catch (e) {
      // Skip scales that can't be constructed
      continue;
    }
  }

  // Sort by common notes count (descending)
  compatible.sort((a, b) => b.commonNotesCount - a.commonNotesCount);

  return compatible;
}

/**
 * Analyze scale for patterns and characteristics.
 *
 * Examines a scale's interval structure to determine its properties
 * such as symmetry, interval patterns, and theoretical classification.
 *
 * @param tonic - Root note
 * @param scaleName - Scale type
 * @returns Scale characteristics object
 *
 * @example
 * analyzeScale('C', 'whole tone')
 * // => { isSymmetrical: true, isPentatonic: false, ... }
 */
export function analyzeScale(tonic: string, scaleName: string): ScaleCharacteristics {
  const scale = getScaleInfo(tonic, scaleName);
  return scale.characteristics;
}

/**
 * Get scales that contain a specific set of notes.
 *
 * Useful for chord-scale relationships and finding scales that work
 * over specific chord voicings.
 *
 * @param notes - Array of note names to match
 * @returns Array of matching scales
 *
 * @example
 * getScalesContainingNotes(['C', 'E', 'G', 'B'])
 * // => ['C major', 'C lydian', 'G major', ...]
 */
export function getScalesContainingNotes(notes: string[]): string[] {
  if (!notes || notes.length === 0) {
    throw new Error('Notes array cannot be empty');
  }

  const targetChromas = new Set(notes.map(n => Note.chroma(n)));
  const matchingScales: string[] = [];

  // Check all chromatic notes as potential tonics
  const chromaticNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

  // Check standard modes
  const standardModes = ['major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian'];

  // Check exotic scales
  const exoticScales = getExoticScales();

  const allScales = [...standardModes, ...exoticScales];

  for (const root of chromaticNotes) {
    for (const scaleName of allScales) {
      try {
        const scale = getScaleInfo(root, scaleName);
        const scaleChromas = new Set(scale.notes.map(n => Note.chroma(n)));

        // Check if all target notes are in this scale
        const allNotesIncluded = [...targetChromas].every(chroma => scaleChromas.has(chroma));

        if (allNotesIncluded) {
          matchingScales.push(`${root} ${scaleName}`);
        }
      } catch (e) {
        // Skip invalid scales
        continue;
      }
    }
  }

  return matchingScales;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Analyze scale characteristics from interval array.
 */
function analyzeScaleCharacteristics(intervals: string[]): ScaleCharacteristics {
  const noteCount = intervals.length;

  // Check for symmetry (e.g., whole tone, diminished)
  const isSymmetrical = checkSymmetry(intervals);

  // Check note count categories
  const isPentatonic = noteCount === 5;
  const isHeptatonic = noteCount === 7;

  // Check for augmented intervals (A4, A5, etc.)
  const hasAugmentedIntervals = intervals.some(i => i.includes('A'));

  // Check for diminished intervals (d5, etc.)
  const hasDiminishedIntervals = intervals.some(i => i.includes('d'));

  // Detect interval pattern for symmetrical scales
  let pattern: string | undefined;
  if (isSymmetrical) {
    pattern = detectIntervalPattern(intervals);
  }

  return {
    isSymmetrical,
    isPentatonic,
    isHeptatonic,
    hasAugmentedIntervals,
    hasDiminishedIntervals,
    pattern,
  };
}

/**
 * Check if scale intervals form a symmetrical pattern.
 */
function checkSymmetry(intervals: string[]): boolean {
  if (intervals.length < 2) return false;

  // Convert intervals to semitone steps
  const semitones: number[] = [];
  for (let i = 1; i < intervals.length; i++) {
    const prev = Interval.semitones(intervals[i - 1]) || 0;
    const curr = Interval.semitones(intervals[i]) || 0;
    semitones.push(curr - prev);
  }

  // Check if pattern repeats evenly
  if (semitones.length === 0) return false;

  const firstStep = semitones[0];
  const allSame = semitones.every(s => s === firstStep);

  if (allSame) return true; // Whole tone scale

  // Check for alternating pattern (diminished)
  if (semitones.length >= 4) {
    const pattern = semitones.slice(0, 2);
    let isAlternating = true;
    for (let i = 0; i < semitones.length; i++) {
      if (semitones[i] !== pattern[i % 2]) {
        isAlternating = false;
        break;
      }
    }
    if (isAlternating) return true;
  }

  return false;
}

/**
 * Detect repeating interval pattern in scale.
 */
function detectIntervalPattern(intervals: string[]): string {
  const semitones: number[] = [];
  for (let i = 1; i < intervals.length; i++) {
    const prev = Interval.semitones(intervals[i - 1]) || 0;
    const curr = Interval.semitones(intervals[i]) || 0;
    semitones.push(curr - prev);
  }

  return semitones.join('-');
}
