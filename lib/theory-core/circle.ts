import { Scale, Note } from 'tonal';
import type { BlockKey } from '@/state/theory.types';
import { buildPalette } from './palette';

/**
 * Circle of Fifths - Core Theory APIs
 *
 * Provides the underlying logic for interactive circle of fifths visualization.
 * All capabilities are in the theory engine, UI is just a test harness.
 */

/**
 * Standard circle of fifths order (clockwise from C).
 * Each step adds one sharp, or removes one flat.
 */
export const CIRCLE_OF_FIFTHS_ORDER = [
  'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#',  // Sharp side
  'G#', 'D#', 'A#',                           // Enharmonic/rare
  'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'    // Flat side (going backwards)
];

/**
 * Mode order from brightest (most sharps) to darkest (most flats).
 * Moving up adds sharps, moving down adds flats.
 */
export const MODE_ORDER: BlockKey['mode'][] = [
  'lydian',      // Brightest (+1 sharp vs major)
  'major',       // Standard
  'mixolydian',  // -1 sharp
  'dorian',      // -2 sharps
  'aeolian',     // -3 sharps (natural minor)
  'phrygian',    // -4 sharps
  'locrian'      // Darkest (-5 sharps)
];

/**
 * Get the 15 classic key signatures (white rows in tonic table).
 * From Cb (7 flats) through C# (7 sharps).
 */
export function getClassicKeySignatures(): string[] {
  return [
    'C#', 'F#', 'B', 'E', 'A', 'D', 'G', 'C',  // Sharp keys
    'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'    // Flat keys
  ];
}

/**
 * Get the 7 diatonic notes for a given key and mode.
 * Returns notes in circle of fifths order (not scale order).
 */
export function getDiatonicNotes(key: BlockKey): string[] {
  let scaleName = `${key.tonic} ${key.mode}`;

  if (key.mode === 'minor') {
    scaleName = `${key.tonic} ${key.minorVariant || 'natural'} minor`;
  } else if (key.mode === 'aeolian') {
    scaleName = `${key.tonic} minor`;  // Aeolian is natural minor
  }

  const scale = Scale.get(scaleName);

  if (!scale.notes.length) return [];

  // Return notes in circle of fifths order
  return sortByCircleOrder(scale.notes);
}

/**
 * Sort notes by circle of fifths order.
 */
function sortByCircleOrder(notes: string[]): string[] {
  const circleOrder = [
    'F', 'C', 'G', 'D', 'A', 'E', 'B',
    'Fb', 'Cb', 'Gb', 'Db', 'Ab', 'Eb', 'Bb',
    'F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'
  ];

  return notes
    .map(note => Note.get(note).pc) // Get pitch class (remove octave)
    .sort((a, b) => {
      const indexA = circleOrder.indexOf(a);
      const indexB = circleOrder.indexOf(b);
      return indexA - indexB;
    });
}

/**
 * Get scale degrees with roman numeral labels for a key/mode.
 * Returns array of 7 items with note and roman numeral.
 */
export function getScaleDegrees(key: BlockKey): Array<{ note: string; roman: string; degree: number }> {
  let scaleName = `${key.tonic} ${key.mode}`;

  if (key.mode === 'minor') {
    scaleName = `${key.tonic} ${key.minorVariant || 'natural'} minor`;
  } else if (key.mode === 'aeolian') {
    scaleName = `${key.tonic} minor`;
  }

  const scale = Scale.get(scaleName);

  if (!scale.notes.length) return [];

  // Get roman numerals for each degree
  const romans = getRomanNumeralsForMode(key.mode);

  return scale.notes.map((note, index) => ({
    note: Note.get(note).pc,
    roman: romans[index],
    degree: index + 1
  }));
}

/**
 * Get roman numerals for each scale degree based on mode.
 */
function getRomanNumeralsForMode(mode: BlockKey['mode']): string[] {
  switch (mode) {
    case 'major':
      return ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

    case 'minor':
    case 'aeolian':
      return ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];

    case 'dorian':
      return ['i', 'ii', 'III', 'IV', 'v', 'vi°', 'VII'];

    case 'phrygian':
      return ['i', 'II', 'III', 'iv', 'v°', 'VI', 'vii'];

    case 'lydian':
      return ['I', 'II', 'iii', '#iv°', 'V', 'vi', 'vii'];

    case 'mixolydian':
      return ['I', 'ii', 'iii°', 'IV', 'v', 'vi', 'VII'];

    case 'locrian':
      return ['i°', 'II', 'iii', 'iv', 'V', 'VI', 'vii'];

    default:
      return ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
  }
}

/**
 * Get chord qualities for each scale degree.
 * Returns array of 7 chord quality descriptors.
 */
export function getChordQualities(key: BlockKey): Array<{
  note: string;
  quality: 'major' | 'minor' | 'diminished' | 'augmented';
  symbol: string;
}> {
  const romans = getRomanNumeralsForMode(key.mode);
  const scale = Scale.get(`${key.tonic} ${key.mode}`);

  return scale.notes.map((note, index) => {
    const roman = romans[index];
    const quality = getQualityFromRoman(roman);

    return {
      note: Note.get(note).pc,
      quality,
      symbol: getSymbolForQuality(quality)
    };
  });
}

/**
 * Determine chord quality from roman numeral.
 */
function getQualityFromRoman(roman: string): 'major' | 'minor' | 'diminished' | 'augmented' {
  if (roman.includes('°')) return 'diminished';
  if (roman.includes('+')) return 'augmented';
  if (roman === roman.toUpperCase()) return 'major';
  return 'minor';
}

/**
 * Get display symbol for chord quality.
 */
function getSymbolForQuality(quality: string): string {
  switch (quality) {
    case 'major': return '';
    case 'minor': return 'm';
    case 'diminished': return '°';
    case 'augmented': return '+';
    default: return '';
  }
}

/**
 * Rotate the circle clockwise (add sharps) or counterclockwise (add flats).
 * Returns the new tonic and mode.
 */
export function rotateCircle(
  currentKey: BlockKey,
  direction: 'clockwise' | 'counterclockwise',
  rotateBy: 'tonic' | 'mode'
): BlockKey {
  if (rotateBy === 'tonic') {
    // Rotate tonic in circle of fifths
    const tonicIndex = CIRCLE_OF_FIFTHS_ORDER.indexOf(currentKey.tonic);
    const newIndex = direction === 'clockwise'
      ? (tonicIndex + 1) % CIRCLE_OF_FIFTHS_ORDER.length
      : (tonicIndex - 1 + CIRCLE_OF_FIFTHS_ORDER.length) % CIRCLE_OF_FIFTHS_ORDER.length;

    return {
      ...currentKey,
      tonic: CIRCLE_OF_FIFTHS_ORDER[newIndex]
    };
  } else {
    // Rotate mode
    const modeIndex = MODE_ORDER.indexOf(currentKey.mode);
    const newIndex = direction === 'clockwise'
      ? (modeIndex - 1 + MODE_ORDER.length) % MODE_ORDER.length  // Up = brighter = clockwise
      : (modeIndex + 1) % MODE_ORDER.length;  // Down = darker = counterclockwise

    return {
      ...currentKey,
      mode: MODE_ORDER[newIndex]
    };
  }
}

/**
 * Check if two keys are enharmonic (same notes, different spelling).
 */
export function areEnharmonic(key1: BlockKey, key2: BlockKey): boolean {
  const notes1 = getDiatonicNotes(key1);
  const notes2 = getDiatonicNotes(key2);

  if (notes1.length !== notes2.length) return false;

  // Compare enharmonic equivalents
  const normalized1 = notes1.map(n => Note.get(n).chroma).sort();
  const normalized2 = notes2.map(n => Note.get(n).chroma).sort();

  return JSON.stringify(normalized1) === JSON.stringify(normalized2);
}

/**
 * Get all information needed for circle visualization.
 */
export interface CircleData {
  key: BlockKey;
  diatonicNotes: string[];
  degrees: Array<{ note: string; roman: string; degree: number }>;
  chordQualities: Array<{ note: string; quality: string; symbol: string }>;
  tonicIndex: number;
}

export function getCircleData(key: BlockKey): CircleData {
  const diatonicNotes = getDiatonicNotes(key);
  const degrees = getScaleDegrees(key);
  const chordQualities = getChordQualities(key);

  // Find which note is the tonic for marking
  const tonicIndex = degrees.findIndex(d => d.degree === 1);

  return {
    key,
    diatonicNotes,
    degrees,
    chordQualities,
    tonicIndex
  };
}
