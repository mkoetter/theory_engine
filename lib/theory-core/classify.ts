import { parseRoman } from './convert';
import { Scale, Key } from 'tonal';
import type { BlockKey, OriginTag, ChordClassification } from '@/state/theory.types';

/**
 * Diatonic scale degrees for major and natural minor.
 */
const DIATONIC_MAJOR = [1, 2, 3, 4, 5, 6, 7];
const DIATONIC_MINOR = [1, 2, 3, 4, 5, 6, 7];

/**
 * Common borrowed chords in major keys (from parallel minor).
 */
const BORROWED_IN_MAJOR = ['bIII', 'bVI', 'bVII', 'iv', 'iiø7', 'bII'];

/**
 * Classify a chord by its origin (diatonic, borrowed, secondary, etc.).
 * Full implementation for Milestone 2.
 */
export function classifyChord(
  roman: string,
  key: BlockKey
): ChordClassification {
  // Check for secondary dominants/leading-tone chords first (e.g., V/V, V/ii, vii°/V)
  if (roman.includes('/')) {
    const parsed = parseRoman(roman);
    return {
      origin: 'secondary',
      quality: parsed?.quality || 'dominant',
    };
  }

  const parsed = parseRoman(roman);

  if (!parsed) {
    return {
      origin: 'custom',
      quality: 'unknown',
    };
  }

  const { degree, quality, accidentals } = parsed;

  // Get diatonic chords for this key
  const diatonicChords = getDiatonicRomans(key);

  // Check if this exact roman numeral is diatonic
  if (diatonicChords.includes(roman)) {
    return {
      origin: 'diatonic',
      quality,
    };
  }

  // Check for borrowed chords
  if (key.mode === 'major' && BORROWED_IN_MAJOR.some(b => roman.startsWith(b))) {
    return {
      origin: 'borrowed',
      quality,
    };
  }

  // Check for chromatic mediants (III in major, bIII in minor, etc.)
  if (isChromaticMediant(roman, key)) {
    return {
      origin: 'chromatic-mediant',
      quality,
    };
  }

  // If it has accidentals but isn't borrowed or mediant, likely custom
  if (accidentals) {
    return {
      origin: 'borrowed',
      quality,
    };
  }

  // Default to diatonic if degree is in scale
  return {
    origin: 'diatonic',
    quality,
  };
}

/**
 * Get the diatonic roman numerals for a given key.
 */
function getDiatonicRomans(key: BlockKey): string[] {
  if (key.mode === 'major') {
    return ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°',
            'Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viiø7'];
  }

  if (key.mode === 'minor') {
    // Natural minor
    if (!key.minorVariant || key.minorVariant === 'natural') {
      return ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII',
              'i7', 'iiø7', 'IIImaj7', 'iv7', 'v7', 'VImaj7', 'VII7'];
    }
    // Harmonic minor
    if (key.minorVariant === 'harmonic') {
      return ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°',
              'i7', 'iiø7', 'III+maj7', 'iv7', 'V7', 'VImaj7', 'vii°7'];
    }
  }

  // Other modes - simplified
  return ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
}

/**
 * Check if a chord is a chromatic mediant.
 * Chromatic mediants are chords whose roots are a third away and share one common tone.
 */
function isChromaticMediant(roman: string, key: BlockKey): boolean {
  // Common chromatic mediants in major: bIII, bVI
  // Common chromatic mediants in minor: III, VI
  const mediantPatterns = ['bIII', 'bVI', '#III', 'III', 'VI'];
  return mediantPatterns.some(pattern => roman.startsWith(pattern));
}
