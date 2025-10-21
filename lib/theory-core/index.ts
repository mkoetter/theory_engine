/**
 * TheoryCore - Music Theory Engine using Tonal.js
 *
 * ARCHITECTURE:
 * This module provides a pure JavaScript/TypeScript API with NO React dependencies.
 * It can be used in any context: React apps, Node.js servers, CLI tools, etc.
 *
 * DESIGN PRINCIPLES:
 * - Pure functions with no side effects
 * - Stateless API (all functions receive complete context)
 * - Type-safe with comprehensive TypeScript definitions
 * - Built on Tonal.js for core music theory primitives
 * - Extended with custom harmonic analysis logic
 *
 * USAGE PATTERN:
 * 1. Create an instance: const theory = createTheoryCore()
 * 2. Call methods with key and chord data
 * 3. Use returned data for analysis, display, or further processing
 *
 * @example
 * ```typescript
 * import { createTheoryCore } from '@/lib/theory-core';
 *
 * const theory = createTheoryCore();
 * const key = { tonic: 'C', mode: 'major' };
 *
 * // Get chord palette
 * const palette = theory.buildPalette(key, { sevenths: false });
 * // => ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
 *
 * // Analyze progression
 * const analysis = theory.analyzeProgression(['I', 'IV', 'V', 'I'], key);
 * // => { functions: ['T', 'SD', 'D', 'T'], cadenceHints: [...], ... }
 *
 * // Get Circle of Fifths data
 * const circleData = theory.getCircleOfFifthsData(key);
 * // => { notes: [...], degrees: [...], chordQualities: [...] }
 * ```
 */

import { buildPalette } from './palette';
import { romansToAbsolute, absoluteToRomans, parseRoman } from './convert';
import { classifyChord } from './classify';
import { analyzeFunctionalLabel, detectCadences } from './analysis';
import { calculateTensionCurve } from './tension';
import { planTransition as planKeyTransition } from './transition';
import {
  getCircleOfFifthsNotes,
  getDiatonicNotes,
  getScaleDegrees,
  getChordQualities,
  getCirclePosition,
  getEnharmonicName,
  getCircleOfFifthsData,
} from './circle';
import {
  parseExtendedChord,
  createSlashChord,
  validateChordSymbol,
  extendedRomanToAbsolute,
  getChordVoicings,
  getExtendedChordNotes,
} from './harmonies';
import {
  getScaleInfo,
  getScaleNotes,
  getScaleIntervals,
  getExoticScales,
  getCompatibleScales,
  analyzeScale,
  getScalesContainingNotes,
} from './scales';
import type {
  BlockKey,
  ChordClassification,
  ProgressionAnalysis,
  TransitionPlan,
  CircleNote,
  CircleDegree,
  CircleChordQuality,
  CircleOfFifthsData,
  ExtendedChord,
  SlashChord,
  ChordVoicing,
  ScaleInfo,
  ScaleCharacteristics,
  CompatibleScale,
} from '@/state/theory.types';

/**
 * Enharmonic spelling policy for chord name conversion.
 * - "key-signature": Use sharps/flats based on key signature (e.g., G major uses F#)
 * - "flat": Always prefer flats (e.g., Gb instead of F#)
 * - "sharp": Always prefer sharps (e.g., F# instead of Gb)
 */
export type EnharmonicPolicy = "key-signature" | "flat" | "sharp";

/**
 * TheoryCore API - Main interface for music theory operations
 *
 * This interface defines the complete public API for the theory engine.
 * All methods are pure functions with no side effects.
 */
export interface TheoryCore {
  // ============================================================
  // CHORD PALETTE & CONVERSION
  // ============================================================

  /**
   * Build a palette of diatonic chords for a given key.
   *
   * Returns Roman numeral chord symbols appropriate for the key/mode.
   * Supports major, minor (natural/harmonic/melodic), and all 7 modes.
   *
   * @param key - The musical key (tonic + mode)
   * @param opts - Options: { sevenths: boolean }
   * @returns Array of Roman numeral chord symbols
   *
   * @example
   * buildPalette({ tonic: 'C', mode: 'major' }, { sevenths: false })
   * // => ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
   *
   * buildPalette({ tonic: 'A', mode: 'minor' }, { sevenths: true })
   * // => ['im7', 'ii°7', 'bIIImaj7', 'ivm7', 'vm7', 'bVImaj7', 'bVII7']
   */
  buildPalette(key: BlockKey, opts: { sevenths: boolean }): string[];

  /**
   * Convert Roman numeral chords to absolute chord names.
   *
   * Translates context-independent Roman numerals into specific chord names
   * based on the tonic note (e.g., 'IV' in C major becomes 'F').
   *
   * @param tonic - Root note of the key (e.g., 'C', 'F#', 'Bb')
   * @param romans - Array of Roman numeral chords
   * @param enharmonic - Spelling policy (default: "key-signature")
   * @returns Array of absolute chord names
   *
   * @example
   * romansToAbsolute('C', ['I', 'IV', 'V'])
   * // => ['C', 'F', 'G']
   *
   * romansToAbsolute('D', ['Im7', 'IVmaj7', 'V7'])
   * // => ['Dm7', 'Gmaj7', 'A7']
   */
  romansToAbsolute(tonic: string, romans: string[], enharmonic?: EnharmonicPolicy): string[];

  /**
   * Convert absolute chord names to Roman numerals relative to a tonic.
   *
   * Inverse of romansToAbsolute. Analyzes chord names and expresses them
   * as Roman numerals relative to the given tonic.
   *
   * @param tonic - Root note to use as reference (e.g., 'C')
   * @param chords - Array of absolute chord names
   * @returns Array of Roman numeral chords
   *
   * @example
   * absoluteToRomans('C', ['C', 'F', 'G'])
   * // => ['I', 'IV', 'V']
   *
   * absoluteToRomans('C', ['Dm7', 'G7', 'Cmaj7'])
   * // => ['ii7', 'V7', 'Imaj7']
   */
  absoluteToRomans(tonic: string, chords: string[]): string[];

  /**
   * Classify a chord's harmonic function and origin.
   *
   * Determines if a chord is diatonic, borrowed (modal interchange),
   * secondary dominant, or chromatic mediant. Also provides the degree
   * and quality analysis.
   *
   * @param roman - Roman numeral chord to classify
   * @param key - Musical key for context
   * @returns ChordClassification with origin, degree, quality, description
   *
   * @example
   * classifyChord('IV', { tonic: 'C', mode: 'major' })
   * // => { origin: 'diatonic', degree: 4, quality: 'major', ... }
   *
   * classifyChord('bVI', { tonic: 'C', mode: 'major' })
   * // => { origin: 'borrowed', degree: 6, quality: 'major', fromMode: 'minor', ... }
   */
  classifyChord(roman: string, key: BlockKey): ChordClassification;

  // ============================================================
  // PROGRESSION ANALYSIS
  // ============================================================

  /**
   * Analyze a chord progression for functional harmony, cadences, and tension.
   *
   * Provides comprehensive analysis including:
   * - Functional labels (T=Tonic, SD=Subdominant, D=Dominant)
   * - Cadence detection (PAC, IAC, Half, Plagal, Deceptive)
   * - Tension curve (0-1 values showing harmonic tension)
   * - Borrowed/secondary chord counts
   *
   * @param romans - Array of Roman numeral chords in the progression
   * @param key - Musical key for analysis context
   * @returns ProgressionAnalysis with functions, cadences, tension curve
   *
   * @example
   * analyzeProgression(['I', 'IV', 'V', 'I'], { tonic: 'C', mode: 'major' })
   * // => {
   * //   functions: ['T', 'SD', 'D', 'T'],
   * //   cadenceHints: ['Perfect Authentic Cadence (V → I)'],
   * //   tension: [0, 0.3, 0.7, 0],
   * //   borrowedCount: 0,
   * //   secondaryCount: 0
   * // }
   */
  analyzeProgression(romans: string[], key: BlockKey): ProgressionAnalysis;

  /**
   * Suggest next chords based on harmonic context and style.
   *
   * Provides context-aware suggestions following music theory principles:
   * - Functional progression (T → SD → D → T)
   * - Common chord movements
   * - Style-appropriate choices (pop, jazz, folk)
   *
   * @param ctxRomans - Current progression (context for suggestions)
   * @param key - Musical key
   * @param style - Optional style hint (default: general theory)
   * @returns Array of suggested Roman numeral chords
   *
   * @example
   * suggestNext(['I'], { tonic: 'C', mode: 'major' })
   * // => ['IV', 'ii', 'V', 'vi']  // Typical moves from I
   *
   * suggestNext(['I', 'IV', 'V'], { tonic: 'C', mode: 'major' })
   * // => ['I', 'vi', 'IV']  // Resolve to tonic or deceptive cadence
   */
  suggestNext(ctxRomans: string[], key: BlockKey, style?: "pop" | "jazz" | "folk"): string[];

  /**
   * Plan a key modulation from one key to another.
   *
   * Analyzes the relationship between keys and suggests transition methods:
   * - Common chords (pivot chord modulation)
   * - Secondary dominants (direct modulation)
   * - Relationship type (relative, parallel, closely related, distant)
   *
   * @param from - Source key
   * @param to - Destination key
   * @returns TransitionPlan with relationship, method, and suggestions
   *
   * @example
   * planTransition(
   *   { tonic: 'C', mode: 'major' },
   *   { tonic: 'G', mode: 'major' }
   * )
   * // => {
   * //   relationship: 'closely-related',
   * //   method: 'common-chord',
   * //   commonChords: ['C', 'Em', 'G', 'Am'],
   * //   suggestion: 'Use Em (iii in C, vi in G) as pivot chord'
   * // }
   */
  planTransition(from: BlockKey, to: BlockKey): TransitionPlan;

  // ============================================================
  // CIRCLE OF FIFTHS
  // ============================================================

  /**
   * Get the 12 chromatic notes in circle-of-fifths order.
   *
   * Returns notes starting from F and moving clockwise (adding fifths).
   * Uses sharp spellings by default.
   *
   * @returns Array of 12 note names
   *
   * @example
   * getCircleOfFifthsNotes()
   * // => ['F', 'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#']
   */
  getCircleOfFifthsNotes(): string[];

  /**
   * Get diatonic/chromatic status for all 12 notes in a key.
   *
   * Each note includes its circle position (0-11) and whether it's
   * diatonic (in the scale) or chromatic (outside the scale).
   *
   * @param key - Musical key to analyze
   * @returns Array of 12 CircleNote objects with note, position, isDiatonic
   *
   * @example
   * getDiatonicNotes({ tonic: 'C', mode: 'major' })
   * // => [
   * //   { note: 'F', position: 0, isDiatonic: true },   // F is in C major
   * //   { note: 'C', position: 1, isDiatonic: true },   // C is in C major
   * //   { note: 'G', position: 2, isDiatonic: true },   // etc...
   * //   { note: 'F#', position: 7, isDiatonic: false }, // F# is chromatic
   * //   ...
   * // ]
   */
  getDiatonicNotes(key: BlockKey): CircleNote[];

  /**
   * Get scale degrees with Roman numerals positioned on the circle.
   *
   * Returns the 7 diatonic scale degrees with their circle positions,
   * Roman numeral labels, and tonic flag.
   *
   * @param key - Musical key
   * @returns Array of 7 CircleDegree objects with position, roman, isTonic
   *
   * @example
   * getScaleDegrees({ tonic: 'C', mode: 'major' })
   * // => [
   * //   { position: 1, roman: 'I', isTonic: true },    // C
   * //   { position: 3, roman: 'ii', isTonic: false },  // D
   * //   { position: 5, roman: 'iii', isTonic: false }, // E
   * //   ...
   * // ]
   */
  getScaleDegrees(key: BlockKey): CircleDegree[];

  /**
   * Get chord qualities for each diatonic scale degree.
   *
   * Builds triads from scale degrees and determines their quality
   * (major, minor, diminished, augmented).
   *
   * @param key - Musical key
   * @returns Array of 7 CircleChordQuality objects with position, quality
   *
   * @example
   * getChordQualities({ tonic: 'C', mode: 'major' })
   * // => [
   * //   { position: 0, quality: 'major' },     // F (IV)
   * //   { position: 1, quality: 'major' },     // C (I)
   * //   { position: 2, quality: 'major' },     // G (V)
   * //   { position: 3, quality: 'minor' },     // D (ii)
   * //   ...
   * // ]
   */
  getChordQualities(key: BlockKey): CircleChordQuality[];

  /**
   * Get the circle position (0-11) for a key/mode combination.
   *
   * Accounts for modal rotation. Used for calculating circle rotations
   * when visualizing different modes.
   *
   * @param tonic - Root note
   * @param mode - Scale mode
   * @returns Position index (0-11) on the circle
   *
   * @example
   * getCirclePosition('C', 'major')    // => 1
   * getCirclePosition('C', 'dorian')   // => ~11 (different rotation)
   */
  getCirclePosition(tonic: string, mode: BlockKey['mode']): number;

  /**
   * Get enharmonic spelling for a note based on preference.
   *
   * Converts between sharp and flat spellings (e.g., F# ↔ Gb).
   *
   * @param note - Note to respell
   * @param preferSharps - True for sharps, false for flats
   * @returns Enharmonically equivalent note name
   *
   * @example
   * getEnharmonicName('F#', false)  // => 'Gb'
   * getEnharmonicName('Bb', true)   // => 'A#'
   */
  getEnharmonicName(note: string, preferSharps: boolean): string;

  /**
   * Get complete Circle of Fifths data for a key (convenience method).
   *
   * Combines all circle-related data into a single object. This is the
   * primary method for building Circle of Fifths visualizations.
   *
   * @param key - Musical key
   * @returns CircleOfFifthsData with notes, degrees, qualities, tonic position
   *
   * @example
   * getCircleOfFifthsData({ tonic: 'C', mode: 'major' })
   * // => {
   * //   notes: [...],           // All 12 notes with diatonic flags
   * //   degrees: [...],         // 7 scale degrees with positions
   * //   chordQualities: [...],  // 7 chord qualities
   * //   tonicPosition: 1        // C's position on the circle
   * // }
   */
  getCircleOfFifthsData(key: BlockKey): CircleOfFifthsData;

  // ============================================================
  // EXTENDED HARMONIES
  // ============================================================

  /**
   * Parse an extended chord symbol into its components.
   *
   * Supports comprehensive chord notation including extended chords,
   * alterations, and slash chords.
   *
   * @param symbol - Chord symbol (e.g., "Cmaj9", "D7b9", "Am/C")
   * @returns ExtendedChord object with all harmonic information
   *
   * @example
   * parseExtendedChord('Cmaj9')
   * // => { root: 'C', quality: 'major', extensions: [7, 9], ... }
   *
   * parseExtendedChord('D7b9#11')
   * // => { root: 'D', quality: 'dominant', alterations: [{ degree: 9, alteration: 'b' }, ...] }
   */
  parseExtendedChord(symbol: string): ExtendedChord;

  /**
   * Create a slash chord from a chord and bass note.
   *
   * Analyzes the relationship between the chord and bass note to determine
   * the inversion.
   *
   * @param chordSymbol - Main chord (e.g., 'C', 'Am7')
   * @param bassNote - Bass note (e.g., 'E', 'C')
   * @returns SlashChord object with inversion information
   *
   * @example
   * createSlashChord('C', 'E')
   * // => { chord: 'C', bass: 'E', symbol: 'C/E', inversion: 1, notes: ['E', 'C', 'G'] }
   */
  createSlashChord(chordSymbol: string, bassNote: string): SlashChord;

  /**
   * Validate if a chord symbol is properly formed.
   *
   * @param symbol - Chord symbol to validate
   * @returns Object with isValid flag and error message if invalid
   *
   * @example
   * validateChordSymbol('Cmaj9')  // => { isValid: true, error: null }
   * validateChordSymbol('Z#7')    // => { isValid: false, error: 'Invalid root note' }
   */
  validateChordSymbol(symbol: string): { isValid: boolean; error: string | null };

  /**
   * Convert a Roman numeral with extensions to an absolute chord symbol.
   *
   * @param roman - Roman numeral with extensions (e.g., "Imaj9", "ii7", "V7b9")
   * @param tonic - Key tonic
   * @returns Absolute chord symbol with extensions
   *
   * @example
   * extendedRomanToAbsolute('Imaj9', 'C')  // => 'Cmaj9'
   * extendedRomanToAbsolute('V7b9', 'G')   // => 'D7b9'
   */
  extendedRomanToAbsolute(roman: string, tonic: string): string;

  /**
   * Get all possible voicings for a chord.
   *
   * Returns different ways to voice the same chord, including various
   * inversions and spacings.
   *
   * @param symbol - Chord symbol
   * @param options - Voicing options (range, inversions, etc.)
   * @returns Array of voicings with note arrays
   *
   * @example
   * getChordVoicings('Cmaj7', { inversions: true })
   * // => [
   * //   { name: 'Root position', notes: ['C3', 'E3', 'G3', 'B3'] },
   * //   { name: 'First inversion', notes: ['E3', 'G3', 'B3', 'C4'] },
   * //   ...
   * // ]
   */
  getChordVoicings(
    symbol: string,
    options?: {
      inversions?: boolean;
      dropVoicings?: boolean;
      openVoicings?: boolean;
      octaveRange?: [number, number];
    }
  ): ChordVoicing[];

  /**
   * Get all notes for an extended chord with proper octave assignments.
   *
   * @param extended - ExtendedChord object
   * @param startOctave - Starting octave number (default: 3)
   * @returns Array of notes with octave numbers
   *
   * @example
   * const chord = parseExtendedChord('Cmaj9');
   * getExtendedChordNotes(chord, 3)
   * // => ['C3', 'E3', 'G3', 'B3', 'D4']
   */
  getExtendedChordNotes(extended: ExtendedChord, startOctave?: number): string[];

  // ============================================================
  // SCALE ENHANCEMENTS
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
   */
  getScaleInfo(tonic: string, scaleName: string): ScaleInfo;

  /**
   * Get all notes in a scale as an array.
   *
   * @param tonic - Root note
   * @param scaleName - Scale type
   * @returns Array of note names
   *
   * @example
   * getScaleNotes('C', 'major')
   * // => ['C', 'D', 'E', 'F', 'G', 'A', 'B']
   */
  getScaleNotes(tonic: string, scaleName: string): string[];

  /**
   * Get interval structure of a scale.
   *
   * @param tonic - Root note
   * @param scaleName - Scale type
   * @returns Array of interval notations
   *
   * @example
   * getScaleIntervals('C', 'major')
   * // => ['1P', '2M', '3M', '4P', '5P', '6M', '7M']
   */
  getScaleIntervals(tonic: string, scaleName: string): string[];

  /**
   * Get list of all available exotic scales.
   *
   * @returns Array of exotic scale names
   *
   * @example
   * getExoticScales()
   * // => ['major pentatonic', 'blues', 'whole tone', ...]
   */
  getExoticScales(): string[];

  /**
   * Find scales compatible with a given key.
   *
   * @param tonic - Root note
   * @param mode - Mode or scale type
   * @returns Array of compatible scales with reasoning
   *
   * @example
   * getCompatibleScales('C', 'major')
   * // => [{ name: 'C major pentatonic', reason: 'Subset of C major', ... }, ...]
   */
  getCompatibleScales(tonic: string, mode: string): CompatibleScale[];

  /**
   * Analyze scale for patterns and characteristics.
   *
   * @param tonic - Root note
   * @param scaleName - Scale type
   * @returns Scale characteristics object
   *
   * @example
   * analyzeScale('C', 'whole tone')
   * // => { isSymmetrical: true, isPentatonic: false, ... }
   */
  analyzeScale(tonic: string, scaleName: string): ScaleCharacteristics;

  /**
   * Get scales that contain a specific set of notes.
   *
   * @param notes - Array of note names to match
   * @returns Array of matching scales
   *
   * @example
   * getScalesContainingNotes(['C', 'E', 'G', 'B'])
   * // => ['C major', 'C lydian', 'G major', ...]
   */
  getScalesContainingNotes(notes: string[]): string[];
}

/**
 * Create a TheoryCore instance.
 *
 * Factory function that returns a configured TheoryCore API object.
 * This is the primary entry point for using the theory engine.
 *
 * IMPORTANT: This is a stateless API. Each method call is independent
 * and requires complete context (key, chords, etc.). There is no
 * internal state or configuration to manage.
 *
 * @returns TheoryCore instance with all methods
 *
 * @example
 * ```typescript
 * // Create instance
 * const theory = createTheoryCore();
 *
 * // Use anywhere in your application
 * const palette = theory.buildPalette({ tonic: 'D', mode: 'dorian' }, { sevenths: true });
 * const analysis = theory.analyzeProgression(['i', 'IV', 'VII', 'i'], { tonic: 'D', mode: 'dorian' });
 *
 * // Can create multiple instances (no shared state)
 * const theory2 = createTheoryCore();
 * ```
 */
export function createTheoryCore(): TheoryCore {
  return {
    buildPalette,
    romansToAbsolute,
    absoluteToRomans,
    classifyChord,

    // Full implementations for Milestone 2
    analyzeProgression(romans: string[], key: BlockKey): ProgressionAnalysis {
      // Analyze functional labels for each chord
      const functions = romans.map(roman => analyzeFunctionalLabel(roman, key));

      // Detect cadences
      const cadenceHints = detectCadences(romans, key);

      // Calculate tension curve
      const tension = calculateTensionCurve(romans, key);

      // Count borrowed and secondary chords
      let borrowedCount = 0;
      let secondaryCount = 0;

      romans.forEach(roman => {
        const classification = classifyChord(roman, key);
        if (classification.origin === 'borrowed') borrowedCount++;
        if (classification.origin === 'secondary') secondaryCount++;
      });

      return {
        functions,
        cadenceHints,
        tension,
        borrowedCount,
        secondaryCount,
      };
    },

    suggestNext(
      ctxRomans: string[],
      key: BlockKey,
      style?: "pop" | "jazz" | "folk"
    ): string[] {
      // Context-aware suggestions based on last chord
      if (ctxRomans.length === 0) {
        return key.mode === 'major' ? ['I', 'IV', 'V', 'vi'] : ['i', 'iv', 'v', 'VI'];
      }

      const lastChord = ctxRomans[ctxRomans.length - 1];
      const lastFunc = analyzeFunctionalLabel(lastChord, key);

      // Suggest based on functional progression
      if (lastFunc === 'T') {
        // From tonic, go to subdominant or dominant
        return key.mode === 'major' ? ['IV', 'ii', 'V', 'vi'] : ['iv', 'ii°', 'V', 'VI'];
      }

      if (lastFunc === 'SD') {
        // From subdominant, go to dominant or tonic
        return key.mode === 'major' ? ['V', 'I', 'vi'] : ['V', 'i', 'VI'];
      }

      if (lastFunc === 'D') {
        // From dominant, resolve to tonic or deceptive cadence
        return key.mode === 'major' ? ['I', 'vi', 'IV'] : ['i', 'VI', 'iv'];
      }

      return key.mode === 'major' ? ['I', 'IV', 'V', 'vi'] : ['i', 'iv', 'V', 'VI'];
    },

    planTransition(from: BlockKey, to: BlockKey): TransitionPlan {
      return planKeyTransition(from, to);
    },

    // Circle of Fifths functions
    getCircleOfFifthsNotes,
    getDiatonicNotes,
    getScaleDegrees,
    getChordQualities,
    getCirclePosition,
    getEnharmonicName,
    getCircleOfFifthsData,

    // Extended Harmonies functions
    parseExtendedChord,
    createSlashChord,
    validateChordSymbol,
    extendedRomanToAbsolute,
    getChordVoicings,
    getExtendedChordNotes,

    // Scale Enhancement functions
    getScaleInfo,
    getScaleNotes,
    getScaleIntervals,
    getExoticScales,
    getCompatibleScales,
    analyzeScale,
    getScalesContainingNotes,
  };
}

// Export utility functions
export { buildPalette, romansToAbsolute, absoluteToRomans, parseRoman, classifyChord };

// Export circle functions
export {
  getCircleOfFifthsNotes,
  getDiatonicNotes,
  getScaleDegrees,
  getChordQualities,
  getCirclePosition,
  getEnharmonicName,
  getCircleOfFifthsData,
};

// Export harmonies functions
export {
  parseExtendedChord,
  createSlashChord,
  validateChordSymbol,
  extendedRomanToAbsolute,
  getChordVoicings,
  getExtendedChordNotes,
};

// Export scales functions
export {
  getScaleInfo,
  getScaleNotes,
  getScaleIntervals,
  getExoticScales,
  getCompatibleScales,
  analyzeScale,
  getScalesContainingNotes,
};

// Export types
export type {
  BlockKey,
  ChordClassification,
  ProgressionAnalysis,
  TransitionPlan,
  CircleNote,
  CircleDegree,
  CircleChordQuality,
  CircleOfFifthsData,
  ExtendedChord,
  SlashChord,
  ChordVoicing,
  ScaleInfo,
  ScaleCharacteristics,
  CompatibleScale,
};
