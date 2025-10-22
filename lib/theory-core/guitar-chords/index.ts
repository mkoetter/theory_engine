/**
 * Guitar Chords Module
 *
 * PURPOSE:
 * Provides guitar chord fingerings, diagram generation, and voicing optimization
 * for integration with the TheoryCore music theory engine.
 *
 * FEATURES:
 * - Guitar chord fingering lookup (50+ common chords)
 * - SVG fretboard diagram generation
 * - Alternative voicing discovery and filtering
 * - Chord progression optimization
 * - Playability scoring and difficulty analysis
 *
 * USAGE:
 * ```typescript
 * import { getChordFingerings, generateChordDiagram } from '@/lib/theory-core/guitar-chords';
 *
 * // Get fingerings
 * const fingerings = getChordFingerings('Cmaj7');
 *
 * // Generate diagram
 * const svg = generateChordDiagram('Cmaj7');
 *
 * // Find alternatives
 * const openVoicings = findAlternativeVoicings('G', { openOnly: true });
 * ```
 *
 * @module guitar-chords
 */

// ============================================================
// TYPE EXPORTS
// ============================================================

export type {
  Fingering,
  GuitarChord,
  VoicingFilters,
  DiagramOptions,
} from './types';

// ============================================================
// CORE API EXPORTS
// ============================================================

import { mapChordToFingerings, getBestFingering, mapChordProgression } from './chord-mapper';
import {
  generateChordSVG,
  generateMultipleChordSVGs,
  generateCompactChordSVG,
  generateChordSVGWithNotes,
} from './svg-generator';
import {
  findAlternativeVoicings,
  getOpenVoicings,
  getBarreVoicings,
  getEasiestVoicings,
  optimizeProgression,
  calculateTransitionDifficulty,
} from './voicing-engine';
import { normalizeRoot, getAvailableChordTypes, getAvailableRoots } from './fingering-db';
import type { Fingering, GuitarChord, VoicingFilters, DiagramOptions } from './types';

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Get all available guitar fingerings for a chord symbol.
 *
 * Returns all voicings in the database for the specified chord.
 * Supports standard chord notation including triads, seventh chords,
 * suspended chords, and altered chords.
 *
 * SUPPORTED CHORD TYPES:
 * - Major triads: C, Cmaj, D, E, etc.
 * - Minor triads: Cm, Am, Dm, etc.
 * - Dominant 7th: C7, D7, E7, G7, etc.
 * - Major 7th: Cmaj7, Dmaj7, Amaj7, etc.
 * - Minor 7th: Cm7, Am7, Dm7, etc.
 * - Suspended: Csus2, Dsus4, Asus4, etc.
 * - Diminished: Edim, Bdim, etc.
 * - Augmented: Caug, Eaug, etc.
 *
 * PARSING BEHAVIOR:
 * - Uses Tonal.js for chord parsing
 * - Checks chord aliases before quality to correctly identify types
 * - Falls back to simpler voicings if exact match not found
 *   (e.g., C13 → C11 → C9 → C7 → C)
 *
 * @param chordSymbol - Chord symbol (e.g., "Cmaj7", "Am", "D7")
 * @returns Array of fingerings, or empty array if chord not found
 *
 * @example
 * // Major 7th chord
 * getChordFingerings('Cmaj7')
 * // => [
 * //   { root: 'C', type: 'M7', frets: ['x', 3, 2, 0, 0, 0], ... },
 * //   { root: 'C', type: 'M7', frets: ['x', 3, 5, 4, 5, 3], ... }
 * // ]
 *
 * @example
 * // Dominant 7th chord
 * getChordFingerings('D7')
 * // => [
 * //   { root: 'D', type: '7', frets: ['x', 'x', 0, 2, 1, 2], ... }
 * // ]
 */
export function getChordFingerings(chordSymbol: string): Fingering[] {
  const guitarChord = mapChordToFingerings(chordSymbol);
  return guitarChord?.voicings || [];
}

/**
 * Generate an SVG fretboard diagram for a chord.
 *
 * Creates a visual representation of the chord fingering with customizable
 * styling and interval-based color coding. Uses the easiest (lowest difficulty)
 * voicing by default.
 *
 * DIAGRAM FEATURES:
 * - Automatic barre chord detection and visualization
 * - Open position chords start from nut (fret 0)
 * - Higher position chords show fret position marker
 * - Open strings (○) and muted strings (×) clearly marked
 * - Optional finger numbers on fretted notes
 * - Interval-based color coding for chord tones
 *
 * COLOR CODING OPTIONS:
 * - Default: Root notes highlighted in gold (#D4A574)
 * - colorByInterval: true → Color all intervals (root, 3rd, 5th, 7th)
 * - Customizable colors via rootColor, thirdColor, fifthColor, seventhColor
 *
 * @param chordSymbol - Chord symbol (e.g., "Cmaj7", "D7", "Am")
 * @param options - Optional diagram customization
 * @param options.width - Diagram width in pixels (default: 200)
 * @param options.height - Diagram height in pixels (default: 250)
 * @param options.fretCount - Number of frets to display (default: 5)
 * @param options.showFingers - Show finger numbers (default: true)
 * @param options.rootColor - Color for root notes (default: #D4A574 gold)
 * @param options.seventhColor - Color for 7th interval (default: same as root)
 * @param options.thirdColor - Color for 3rd interval (default: same as color)
 * @param options.fifthColor - Color for 5th interval (default: same as color)
 * @param options.colorByInterval - Enable full interval coloring (default: false)
 * @param options.color - Default color for non-interval notes (default: #333333)
 * @returns SVG string, or null if chord not found
 *
 * @example
 * // Basic diagram with default styling
 * generateChordDiagram('Cmaj7')
 * // => '<svg>...</svg>' with root notes in gold
 *
 * @example
 * // Customized size and finger display
 * generateChordDiagram('D7', {
 *   width: 160,
 *   height: 200,
 *   showFingers: true
 * })
 *
 * @example
 * // Full interval color coding
 * generateChordDiagram('Gmaj7', {
 *   colorByInterval: true,
 *   rootColor: '#D4A574',    // Gold for root
 *   thirdColor: '#4A90E2',   // Blue for 3rd
 *   fifthColor: '#7ED321',   // Green for 5th
 *   seventhColor: '#F5A623', // Orange for 7th
 * })
 *
 * @example
 * // Custom root and 7th coloring only
 * generateChordDiagram('Am7', {
 *   colorByInterval: true,
 *   rootColor: '#D4A574',    // Gold for root (A)
 *   seventhColor: '#9B59B6', // Purple for 7th (G)
 *   color: '#333333',        // Dark gray for 3rd and 5th
 * })
 */
export function generateChordDiagram(
  chordSymbol: string,
  options?: Partial<DiagramOptions>
): string | null {
  const fingering = getBestFingering(chordSymbol);

  if (!fingering) {
    return null;
  }

  return generateChordSVG(fingering, options);
}

/**
 * Find alternative voicings for a chord with optional filtering.
 *
 * Returns voicings that match the specified criteria, sorted by difficulty.
 *
 * @param chordSymbol - Chord symbol
 * @param filters - Optional voicing filters
 * @returns Array of matching fingerings
 *
 * @example
 * // Get open position voicings only
 * findAlternativeVoicings('G', { openOnly: true })
 *
 * // Get voicings in first 5 frets
 * findAlternativeVoicings('Cmaj7', { maxFret: 5 })
 *
 * // Get easy voicings
 * findAlternativeVoicings('F', { difficulty: 'easy' })
 */
export { findAlternativeVoicings };

/**
 * Generate chord diagrams for an entire progression.
 *
 * Batch operation for creating multiple diagrams at once.
 *
 * @param chordSymbols - Array of chord symbols
 * @param options - Optional diagram customization
 * @returns Array of SVG strings
 *
 * @example
 * generateProgressionDiagrams(['C', 'Am', 'F', 'G'])
 * // => ['<svg>...</svg>', '<svg>...</svg>', ...]
 */
export function generateProgressionDiagrams(
  chordSymbols: string[],
  options?: Partial<DiagramOptions>
): string[] {
  const chords = mapChordProgression(chordSymbols);

  return chords
    .map(chord => {
      if (chord.voicings.length === 0) return null;
      return generateChordSVG(chord.voicings[0], options);
    })
    .filter((svg): svg is string => svg !== null);
}

/**
 * Optimize voicing selection for smooth chord transitions.
 *
 * Analyzes a chord progression and selects voicings that minimize
 * finger movement and position changes.
 *
 * @param chordSymbols - Array of chord symbols in progression order
 * @param filters - Optional voicing constraints
 * @returns Array of optimized fingerings
 *
 * @example
 * optimizeChordProgression(['C', 'Am', 'F', 'G'])
 * // => [cMajFingering, aMinFingering, fMajFingering, gMajFingering]
 * // Selected for smooth transitions
 */
export { optimizeProgression as optimizeChordProgression };

/**
 * Get only open position voicings for a chord.
 *
 * @param chordSymbol - Chord symbol
 * @returns Array of open position fingerings
 *
 * @example
 * getOpenPositionVoicings('C')
 * // => [{ frets: ['x', 3, 2, 0, 1, 0], ... }]
 */
export { getOpenVoicings as getOpenPositionVoicings };

/**
 * Get only barre chord voicings for a chord.
 *
 * @param chordSymbol - Chord symbol
 * @returns Array of barre chord fingerings
 *
 * @example
 * getBarreChordVoicings('F')
 * // => [{ frets: [1, 3, 3, 2, 1, 1], isBarre: true, ... }]
 */
export { getBarreVoicings as getBarreChordVoicings };

/**
 * Get the easiest voicings for a chord (top 3).
 *
 * @param chordSymbol - Chord symbol
 * @returns Array of up to 3 easiest fingerings
 *
 * @example
 * getSimplestVoicings('Cmaj7')
 * // => [easiest, 2nd easiest, 3rd easiest]
 */
export { getEasiestVoicings as getSimplestVoicings };

/**
 * Calculate difficulty of transitioning between two fingerings.
 *
 * @param from - Starting fingering
 * @param to - Target fingering
 * @returns Transition difficulty score (0-100, lower is easier)
 *
 * @example
 * const cmaj = getChordFingerings('C')[0];
 * const gmaj = getChordFingerings('G')[0];
 * calculateChordTransitionDifficulty(cmaj, gmaj) // => 35
 */
export { calculateTransitionDifficulty as calculateChordTransitionDifficulty };

/**
 * Generate a compact chord diagram (smaller size).
 *
 * @param chordSymbol - Chord symbol
 * @returns Compact SVG string, or null if chord not found
 *
 * @example
 * generateCompactDiagram('C')
 * // => '<svg width="120" height="160">...</svg>'
 */
export function generateCompactDiagram(chordSymbol: string): string | null {
  const fingering = getBestFingering(chordSymbol);

  if (!fingering) {
    return null;
  }

  return generateCompactChordSVG(fingering);
}

// ============================================================
// UTILITY EXPORTS
// ============================================================

/**
 * Get list of all chord types available in the database.
 *
 * @returns Array of chord type names
 *
 * @example
 * getAvailableChordTypes()
 * // => ['maj', 'min', '7', 'M7', 'm7', 'sus2', 'sus4', ...]
 */
export { getAvailableChordTypes };

/**
 * Get list of all root notes available in the database.
 *
 * @returns Array of root note names
 *
 * @example
 * getAvailableRoots()
 * // => ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Bb', 'Eb', ...]
 */
export { getAvailableRoots };

/**
 * Normalize a chord root to handle enharmonic equivalents.
 *
 * @param root - Note name
 * @returns Normalized note name
 *
 * @example
 * normalizeChordRoot('C#') // => 'Db'
 * normalizeChordRoot('E#') // => 'F'
 */
export { normalizeRoot as normalizeChordRoot };

// ============================================================
// MODULE INFO
// ============================================================

/**
 * Guitar chords module metadata.
 */
export const MODULE_INFO = Object.freeze({
  name: 'guitar-chords',
  version: '1.0.0',
  description: 'Guitar chord fingerings and diagram generation',
  features: [
    'Chord fingering lookup',
    'SVG diagram generation',
    'Voicing optimization',
    'Playability analysis',
    'Progression optimization',
  ],
  chordCount: 50, // Approximate number of chord fingerings in database
  tuning: 'Standard (E-A-D-G-B-E)',
});
