/**
 * Guitar Chords - Chord Mapper
 *
 * PURPOSE:
 * Bridge between Tonal.js chord data and guitar fingerings.
 * Parses chord symbols and maps them to available guitar fingerings.
 *
 * STRATEGY:
 * 1. Parse chord symbol with Tonal.js
 * 2. Extract root and chord type
 * 3. Lookup fingerings in database
 * 4. Fallback to simpler chords if exact match not found
 *
 * @module guitar-chords/chord-mapper
 */

import { Chord } from 'tonal';
import { GuitarChord, Fingering } from './types';
import { findFingerings, findFingeringsBySymbol, normalizeRoot } from './fingering-db';

// ============================================================
// CONSTANTS
// ============================================================

/**
 * Chord type simplification hierarchy.
 * Maps complex chord types to simpler fallbacks.
 */
const CHORD_SIMPLIFICATION = Object.freeze({
  // Extended 9th, 11th, 13th chords
  '13': ['11', '9', '7', 'maj'],
  '11': ['9', '7', 'maj'],
  '9': ['7', 'maj'],

  // Minor extended
  'm13': ['m11', 'm9', 'm7', 'min'],
  'm11': ['m9', 'm7', 'min'],
  'm9': ['m7', 'min'],

  // Major extended
  'M13': ['M11', 'M9', 'M7', 'maj'],
  'M11': ['M9', 'M7', 'maj'],
  'M9': ['M7', 'maj'],

  // Altered dominants
  '7#9': ['7b9', '7', 'maj'],
  '7b9': ['7', 'maj'],
  '7#5': ['7', 'aug', 'maj'],
  '7b5': ['7', 'dim', 'maj'],

  // Add chords
  'add9': ['maj'],
  'madd9': ['min'],
  '6': ['maj'],
  'm6': ['min'],
} as const);

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Parse chord type from Tonal chord data.
 * Converts Tonal's chord quality notation to our database format.
 */
function parseChordType(chord: ReturnType<typeof Chord.get>): string {
  const { quality, aliases } = chord;

  // Map Tonal quality to our chord types
  if (quality === 'Major') return 'maj';
  if (quality === 'Minor') return 'min';
  if (quality === 'Augmented') return 'aug';
  if (quality === 'Diminished') return 'dim';

  // Check aliases for chord type indicators
  const alias = aliases[0] || '';

  // Look for specific patterns in the alias
  if (alias.includes('maj7') || alias.includes('M7') || alias.includes('Δ')) return 'M7';
  if (alias.includes('m7') || alias.includes('min7') || alias.includes('-7')) return 'm7';
  if (alias.includes('7') && !alias.includes('maj') && !alias.includes('M')) return '7';
  if (alias.includes('sus4')) return 'sus4';
  if (alias.includes('sus2')) return 'sus2';
  if (alias.includes('dim')) return 'dim';
  if (alias.includes('aug')) return 'aug';
  if (alias.includes('m') || alias.includes('min') || alias.includes('-')) return 'min';

  // Default to major
  return 'maj';
}

/**
 * Get fallback chord types for a given chord type.
 */
function getFallbackTypes(chordType: string): string[] {
  const fallback = CHORD_SIMPLIFICATION[chordType as keyof typeof CHORD_SIMPLIFICATION];
  return fallback ? [...fallback] : [];
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Map a chord symbol to guitar fingerings.
 *
 * Parses the chord symbol using Tonal.js and finds matching guitar fingerings.
 * If no exact match is found, attempts to simplify the chord and find alternatives.
 *
 * @param chordSymbol - Chord symbol (e.g., "Cmaj7", "Am9", "D7#9")
 * @returns GuitarChord object with all available fingerings, or null if chord cannot be parsed
 *
 * @example
 * mapChordToFingerings('Cmaj7')
 * // => { symbol: 'Cmaj7', root: 'C', type: 'M7', notes: [...], voicings: [...] }
 *
 * mapChordToFingerings('Am')
 * // => { symbol: 'Am', root: 'A', type: 'min', notes: [...], voicings: [...] }
 */
export function mapChordToFingerings(chordSymbol: string): GuitarChord | null {
  // Parse with Tonal
  const chord = Chord.get(chordSymbol);

  // Validate chord
  if (!chord.tonic || chord.empty) {
    return null;
  }

  const root = chord.tonic;
  const notes = chord.notes;

  // Determine chord type
  let chordType = parseChordType(chord);

  // Try to find fingerings
  let voicings = findFingerings(root, chordType);

  // If no fingerings found, try fallbacks
  if (voicings.length === 0) {
    const fallbacks = getFallbackTypes(chordType);
    for (const fallbackType of fallbacks) {
      voicings = findFingerings(root, fallbackType);
      if (voicings.length > 0) {
        // Update chord type to the fallback we're using
        chordType = fallbackType;
        break;
      }
    }
  }

  // If still no fingerings, try simple symbol-based lookup
  if (voicings.length === 0) {
    voicings = findFingeringsBySymbol(chordSymbol);
  }

  return {
    symbol: chordSymbol,
    root,
    type: chordType,
    notes,
    voicings,
  };
}

/**
 * Check if fingerings are available for a chord symbol.
 *
 * @param chordSymbol - Chord symbol to check
 * @returns true if fingerings are available
 *
 * @example
 * hasFingeringsFor('Cmaj7') // => true
 * hasFingeringsFor('C#m9b5') // => might be false
 */
export function hasFingeringsFor(chordSymbol: string): boolean {
  const guitarChord = mapChordToFingerings(chordSymbol);
  return guitarChord !== null && guitarChord.voicings.length > 0;
}

/**
 * Get the best (easiest) fingering for a chord symbol.
 *
 * Returns the fingering with the lowest difficulty score.
 *
 * @param chordSymbol - Chord symbol
 * @returns Best fingering, or null if none available
 *
 * @example
 * getBestFingering('Cmaj7')
 * // => { root: 'C', type: 'M7', frets: [...], difficulty: 50, ... }
 */
export function getBestFingering(chordSymbol: string): Fingering | null {
  const guitarChord = mapChordToFingerings(chordSymbol);

  if (!guitarChord || guitarChord.voicings.length === 0) {
    return null;
  }

  // Sort by difficulty (lower is better)
  const sorted = [...guitarChord.voicings].sort((a, b) => {
    const diffA = a.difficulty ?? 50;
    const diffB = b.difficulty ?? 50;
    return diffA - diffB;
  });

  return sorted[0];
}

/**
 * Map multiple chord symbols to fingerings (batch operation).
 *
 * Useful for processing entire chord progressions.
 *
 * @param chordSymbols - Array of chord symbols
 * @returns Array of GuitarChord objects
 *
 * @example
 * mapChordProgression(['C', 'Am', 'F', 'G'])
 * // => [{ symbol: 'C', ... }, { symbol: 'Am', ... }, ...]
 */
export function mapChordProgression(chordSymbols: string[]): GuitarChord[] {
  return chordSymbols
    .map(symbol => mapChordToFingerings(symbol))
    .filter((chord): chord is GuitarChord => chord !== null);
}

/**
 * Get easiest fingering for each chord in a progression.
 *
 * @param chordSymbols - Array of chord symbols
 * @returns Array of best fingerings
 *
 * @example
 * getBestFingeringsForProgression(['C', 'Am', 'F', 'G'])
 * // => [{ root: 'C', ... }, { root: 'A', ... }, ...]
 */
export function getBestFingeringsForProgression(chordSymbols: string[]): Fingering[] {
  return chordSymbols
    .map(symbol => getBestFingering(symbol))
    .filter((fingering): fingering is Fingering => fingering !== null);
}
