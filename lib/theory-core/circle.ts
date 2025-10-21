/**
 * Circle of Fifths Module
 *
 * PURPOSE:
 * Provides all logic for Circle of Fifths visualization and analysis.
 * Handles note positioning, diatonic detection, chord quality calculation,
 * and enharmonic spelling for any key/mode combination.
 *
 * KEY CONCEPTS:
 * - Circle positions: 0-11 indices mapping to notes in fifths order
 * - Diatonic vs chromatic: Whether a note belongs to the key's scale
 * - Chord quality: Major/minor/diminished/augmented triads on each degree
 * - Mode rotation: Different modes rotate the circle relative to major
 * - Enharmonic equivalents: G# and Ab represent the same pitch (chroma)
 *
 * COORDINATE SYSTEM:
 * - Position 0 = F (starts at 7 o'clock on visual circle)
 * - Position 1 = C (8 o'clock)
 * - Positions increase clockwise around the circle
 * - Position 11 = A# (6 o'clock)
 *
 * USAGE:
 * This module is primarily used by UI components to render Circle of Fifths
 * visualizations. The main entry point is getCircleOfFifthsData(), which
 * returns all data needed for a complete visualization.
 *
 * @example
 * ```typescript
 * import { getCircleOfFifthsData } from '@/lib/theory-core/circle';
 *
 * const circleData = getCircleOfFifthsData({ tonic: 'C', mode: 'major' });
 * // Use circleData.notes, circleData.degrees, circleData.chordQualities
 * // to render the three rings of the circle
 * ```
 */

import { Scale, Note } from 'tonal';
import type {
  BlockKey,
  CircleNote,
  CircleDegree,
  CircleChordQuality,
  CircleOfFifthsData,
  ChordQuality,
} from '@/state/theory.types';

/**
 * The 12 chromatic notes in circle-of-fifths order.
 *
 * Starting from F (position 0) and moving clockwise, adding fifths each time.
 * Uses sharp spellings for black keys.
 *
 * IMPORTANT: This array defines the canonical circle order. Position indices
 * throughout this module refer to indices in this array.
 */
const CIRCLE_OF_FIFTHS_NOTES = [
  'F', 'C', 'G', 'D', 'A', 'E', 'B',
  'F#', 'C#', 'G#', 'D#', 'A#'
];

/**
 * Mode offsets from major, measured in fifths on the circle.
 *
 * Each mode is a rotation of the major scale. These offsets define how many
 * positions to shift on the circle of fifths when changing modes.
 *
 * THEORY:
 * - Major/Ionian is the baseline (offset 0)
 * - Lydian is +1 fifth from major (brighter)
 * - Mixolydian is -1 fifth from major
 * - Dorian is -2 fifths from major
 * - Minor/Aeolian is -3 fifths from major
 * - Phrygian is -4 fifths from major
 * - Locrian is -5 fifths from major (darkest)
 *
 * @example
 * C major (offset 0) has the same notes as D dorian (offset -2)
 * because D is 2 fifths up from C on the circle.
 */
const MODE_OFFSETS: Record<string, number> = {
  'lydian': 1,      // +1 fifth from major
  'major': 0,       // baseline
  'mixolydian': -1, // -1 fifth from major
  'dorian': -2,     // -2 fifths from major
  'minor': -3,      // -3 fifths from major (natural minor = aeolian)
  'aeolian': -3,    // same as natural minor
  'phrygian': -4,   // -4 fifths from major
  'locrian': -5,    // -5 fifths from major
};

/**
 * Get all 12 chromatic notes in circle-of-fifths order.
 *
 * Returns a copy of the canonical note order used throughout this module.
 * Starting from F and adding fifths clockwise: F → C → G → D → A → E → B → F# → ...
 *
 * @returns Array of 12 note names in circle-of-fifths order
 *
 * @example
 * const notes = getCircleOfFifthsNotes();
 * // => ['F', 'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#']
 */
export function getCircleOfFifthsNotes(): string[] {
  return [...CIRCLE_OF_FIFTHS_NOTES];
}

/**
 * Get the position (0-11) of a note on the circle of fifths.
 *
 * IMPLEMENTATION NOTE:
 * Uses Note.chroma() instead of string comparison to handle enharmonic
 * equivalents correctly. This ensures Ab and G# map to the same position.
 *
 * @param note - Note name (e.g., 'C', 'F#', 'Ab')
 * @returns Position index (0-11) in the circle, or 0 if invalid
 *
 * @example
 * getNotePosition('C')   // => 1
 * getNotePosition('G#')  // => 9
 * getNotePosition('Ab')  // => 9 (same as G# due to enharmonic equivalence)
 */
function getNotePosition(note: string): number {
  const noteChroma = Note.chroma(note); // Get numeric pitch class (0-11), handles enharmonics
  if (noteChroma === undefined) return 0;

  const position = CIRCLE_OF_FIFTHS_NOTES.findIndex(n => Note.chroma(n) === noteChroma);
  return position >= 0 ? position : 0;
}

/**
 * Get which notes are diatonic to a given key.
 * Returns array of 12 CircleNote objects with isDiatonic flag.
 */
export function getDiatonicNotes(key: BlockKey): CircleNote[] {
  const scale = getScaleForKey(key);
  const diatonicChromas = scale.notes.map(note => Note.chroma(note));

  return CIRCLE_OF_FIFTHS_NOTES.map((note, position) => {
    const noteChroma = Note.chroma(note);
    const isDiatonic = diatonicChromas.includes(noteChroma);

    return {
      note,
      position,
      isDiatonic,
    };
  });
}

/**
 * Get scale degrees with Roman numerals positioned on the circle.
 * Returns array of 7 CircleDegree objects.
 */
export function getScaleDegrees(key: BlockKey): CircleDegree[] {
  const scale = getScaleForKey(key);
  const tonicPosition = getNotePosition(key.tonic);

  // Get the diatonic roman numerals for this key
  const romans = getRomanNumeralsForKey(key);

  const degrees: CircleDegree[] = [];

  scale.notes.forEach((note, degreeIndex) => {
    const position = getNotePosition(note);
    const roman = romans[degreeIndex] || 'I';
    const isTonic = degreeIndex === 0;

    degrees.push({
      position,
      roman,
      isTonic,
    });
  });

  return degrees;
}

/**
 * Get chord qualities for each diatonic position on the circle.
 * Returns array of 7 CircleChordQuality objects.
 */
export function getChordQualities(key: BlockKey): CircleChordQuality[] {
  const scale = getScaleForKey(key);
  const qualities: CircleChordQuality[] = [];

  // Build triads from each scale degree
  scale.notes.forEach((root, degreeIndex) => {
    const third = scale.notes[(degreeIndex + 2) % 7];
    const fifth = scale.notes[(degreeIndex + 4) % 7];

    const quality = determineTriadQuality(root, third, fifth);
    const position = getNotePosition(root);

    qualities.push({
      position,
      quality,
    });
  });

  return qualities;
}

/**
 * Get the circle position (0-11) for a given key/mode combination.
 * Used to calculate rotation offset.
 */
export function getCirclePosition(tonic: string, mode: BlockKey['mode']): number {
  const tonicPosition = getNotePosition(tonic);
  const modeOffset = MODE_OFFSETS[mode] || 0;

  // Calculate final position with wrapping
  let position = tonicPosition + modeOffset;
  while (position < 0) position += 12;
  while (position >= 12) position -= 12;

  return position;
}

/**
 * Get enharmonic spelling for a note based on key signature preference.
 * Returns proper spelling (e.g., F# vs Gb) for display.
 */
export function getEnharmonicName(note: string, preferSharps: boolean): string {
  const pitchClass = Note.get(note).pc;

  // Map of pitch classes to their sharp and flat spellings
  const enharmonicMap: Record<string, { sharp: string; flat: string }> = {
    'C': { sharp: 'C', flat: 'C' },
    'C#': { sharp: 'C#', flat: 'Db' },
    'D': { sharp: 'D', flat: 'D' },
    'D#': { sharp: 'D#', flat: 'Eb' },
    'E': { sharp: 'E', flat: 'E' },
    'F': { sharp: 'F', flat: 'F' },
    'F#': { sharp: 'F#', flat: 'Gb' },
    'G': { sharp: 'G', flat: 'G' },
    'G#': { sharp: 'G#', flat: 'Ab' },
    'A': { sharp: 'A', flat: 'A' },
    'A#': { sharp: 'A#', flat: 'Bb' },
    'B': { sharp: 'B', flat: 'B' },
  };

  const mapping = enharmonicMap[pitchClass];
  if (!mapping) return note;

  return preferSharps ? mapping.sharp : mapping.flat;
}

/**
 * Get complete Circle of Fifths data for a given key.
 *
 * PRIMARY API ENTRY POINT for Circle of Fifths visualizations.
 * Combines all circle-related data into a single object for convenience.
 *
 * USAGE FOR UI COMPONENTS:
 * This function provides all data needed to render a three-ring Circle of Fifths:
 * 1. Outer Ring: Chord qualities (major/minor/diminished)
 * 2. Middle Ring: 12 chromatic notes (white=diatonic, gray=chromatic)
 * 3. Inner Ring: 7 scale degrees with Roman numerals
 *
 * The data is position-indexed (0-11) to match the circle coordinate system.
 *
 * @param key - Musical key (tonic + mode)
 * @returns CircleOfFifthsData containing:
 *   - notes: All 12 chromatic notes with diatonic flags
 *   - degrees: 7 scale degrees with Roman numerals and positions
 *   - chordQualities: 7 chord qualities (major/minor/dim/aug) with positions
 *   - tonicPosition: Circle position (0-11) of the tonic note
 *
 * @example
 * ```typescript
 * const circleData = getCircleOfFifthsData({ tonic: 'C', mode: 'major' });
 *
 * // Render outer ring (chord qualities)
 * circleData.chordQualities.forEach(({ position, quality }) => {
 *   renderSegment(position, getColorForQuality(quality));
 * });
 *
 * // Render middle ring (notes)
 * circleData.notes.forEach(({ note, position, isDiatonic }) => {
 *   renderNote(position, note, isDiatonic ? 'white' : 'gray');
 * });
 *
 * // Render inner ring (degrees)
 * circleData.degrees.forEach(({ position, roman, isTonic }) => {
 *   renderDegree(position, roman, isTonic);
 * });
 * ```
 */
export function getCircleOfFifthsData(key: BlockKey): CircleOfFifthsData {
  return {
    notes: getDiatonicNotes(key),
    degrees: getScaleDegrees(key),
    chordQualities: getChordQualities(key),
    tonicPosition: getNotePosition(key.tonic),
  };
}

// Helper functions

/**
 * Get the Tonal.js scale for a given key.
 */
function getScaleForKey(key: BlockKey): ReturnType<typeof Scale.get> {
  let scaleName = `${key.tonic} ${key.mode}`;

  if (key.mode === 'minor') {
    scaleName = `${key.tonic} minor`;
    if (key.minorVariant === 'harmonic') {
      scaleName = `${key.tonic} harmonic minor`;
    } else if (key.minorVariant === 'melodic') {
      scaleName = `${key.tonic} melodic minor`;
    }
  }

  return Scale.get(scaleName);
}

/**
 * Get Roman numerals for each scale degree in a given key.
 */
function getRomanNumeralsForKey(key: BlockKey): string[] {
  if (key.mode === 'major') {
    return ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
  }

  if (key.mode === 'minor') {
    if (key.minorVariant === 'harmonic') {
      return ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'];
    }
    // Natural minor (aeolian)
    return ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
  }

  // Other modes - determine based on mode characteristics
  const modeRomans: Record<string, string[]> = {
    'dorian': ['i', 'ii', 'III', 'IV', 'v', 'vi°', 'VII'],
    'phrygian': ['i', 'II', 'III', 'iv', 'v°', 'VI', 'vii'],
    'lydian': ['I', 'II', 'iii', '#iv°', 'V', 'vi', 'vii'],
    'mixolydian': ['I', 'ii', 'iii°', 'IV', 'v', 'vi', 'VII'],
    'aeolian': ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
    'locrian': ['i°', 'II', 'iii', 'iv', 'V', 'VI', 'vii'],
  };

  return modeRomans[key.mode] || ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
}

/**
 * Determine triad quality from root, third, and fifth notes.
 */
function determineTriadQuality(root: string, third: string, fifth: string): ChordQuality {
  const rootNote = Note.get(root);
  const thirdNote = Note.get(third);
  const fifthNote = Note.get(fifth);

  // Calculate semitone distances
  const thirdInterval = (Note.chroma(thirdNote.pc)! - Note.chroma(rootNote.pc)! + 12) % 12;
  const fifthInterval = (Note.chroma(fifthNote.pc)! - Note.chroma(rootNote.pc)! + 12) % 12;

  // Determine quality based on intervals
  const isMajorThird = thirdInterval === 4;
  const isMinorThird = thirdInterval === 3;
  const isPerfectFifth = fifthInterval === 7;
  const isDiminishedFifth = fifthInterval === 6;
  const isAugmentedFifth = fifthInterval === 8;

  if (isMajorThird && isPerfectFifth) return 'major';
  if (isMinorThird && isPerfectFifth) return 'minor';
  if (isMinorThird && isDiminishedFifth) return 'diminished';
  if (isMajorThird && isAugmentedFifth) return 'augmented';

  // Default to major if we can't determine
  return 'major';
}
