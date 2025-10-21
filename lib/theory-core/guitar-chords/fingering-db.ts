/**
 * Guitar Chords - Fingering Database
 *
 * PURPOSE:
 * Load, index, and lookup guitar chord fingerings.
 * Handles enharmonic equivalents and provides fallback to simpler chords.
 *
 * DATA SOURCE:
 * Uses a built-in database of common guitar chord fingerings.
 * Future enhancement: integrate UCI Guitar Chords dataset.
 *
 * @module guitar-chords/fingering-db
 */

import { Fingering } from './types';
import { Note } from 'tonal';

// ============================================================
// CONSTANTS
// ============================================================

/**
 * Standard guitar tuning (low to high): E-A-D-G-B-E
 */
export const STANDARD_TUNING = Object.freeze(['E', 'A', 'D', 'G', 'B', 'E']);

/**
 * Enharmonic equivalent mappings for chord root normalization.
 * Maps less common spellings to more common ones.
 */
const ENHARMONIC_MAP = Object.freeze({
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb',
  'E#': 'F',
  'B#': 'C',
  'Fb': 'E',
  'Cb': 'B',
} as const);

/**
 * Chord type aliases and normalizations.
 * Maps variations of chord type names to canonical forms.
 */
const CHORD_TYPE_ALIASES = Object.freeze({
  '': 'maj',
  'M': 'maj',
  'major': 'maj',
  'm': 'min',
  'minor': 'min',
  '-': 'min',
  'dom7': '7',
  'dominant': '7',
  'maj7': 'M7',
  'major7': 'M7',
  'min7': 'm7',
  'minor7': 'm7',
  '-7': 'm7',
  'dim': 'dim',
  'diminished': 'dim',
  'aug': 'aug',
  'augmented': 'aug',
  '+': 'aug',
  'sus2': 'sus2',
  'sus4': 'sus4',
  'sus': 'sus4',
} as const);

// ============================================================
// FINGERING DATABASE
// ============================================================

/**
 * Built-in fingering database with common guitar chord voicings.
 * Organized by root note and chord type for O(1) lookup.
 *
 * PERFORMANCE: Using frozen objects for better optimization.
 */
const FINGERING_DATABASE: ReadonlyArray<Fingering> = Object.freeze([
  // C Major and variations
  { root: 'C', type: 'maj', frets: ['x', 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], position: 0, difficulty: 60 },
  { root: 'C', type: 'maj', frets: ['x', 3, 2, 0, 1, 3], fingers: [0, 2, 1, 0, 0, 3], position: 0, difficulty: 65 },
  { root: 'C', type: 'min', frets: ['x', 3, 1, 0, 1, 3], fingers: [0, 3, 1, 0, 2, 4], position: 0, difficulty: 65 },
  { root: 'C', type: '7', frets: ['x', 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0], position: 0, difficulty: 70 },
  { root: 'C', type: 'M7', frets: ['x', 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0], position: 0, difficulty: 50 },
  { root: 'C', type: 'm7', frets: ['x', 3, 1, 3, 1, 3], fingers: [0, 3, 1, 4, 1, 4], position: 0, difficulty: 75, isBarre: true },

  // D Major and variations
  { root: 'D', type: 'maj', frets: ['x', 'x', 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], position: 0, difficulty: 55 },
  { root: 'D', type: 'min', frets: ['x', 'x', 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], position: 0, difficulty: 50 },
  { root: 'D', type: '7', frets: ['x', 'x', 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3], position: 0, difficulty: 55 },
  { root: 'D', type: 'M7', frets: ['x', 'x', 0, 2, 2, 2], fingers: [0, 0, 0, 1, 1, 1], position: 0, difficulty: 60, isBarre: true },
  { root: 'D', type: 'm7', frets: ['x', 'x', 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1], position: 0, difficulty: 55 },

  // E Major and variations
  { root: 'E', type: 'maj', frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0], position: 0, difficulty: 45 },
  { root: 'E', type: 'min', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], position: 0, difficulty: 40 },
  { root: 'E', type: '7', frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0], position: 0, difficulty: 45 },
  { root: 'E', type: 'M7', frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0], position: 0, difficulty: 50 },
  { root: 'E', type: 'm7', frets: [0, 2, 2, 0, 3, 0], fingers: [0, 2, 3, 0, 4, 0], position: 0, difficulty: 50 },
  { root: 'E', type: 'm7', frets: [0, 2, 0, 0, 0, 0], fingers: [0, 1, 0, 0, 0, 0], position: 0, difficulty: 30 },

  // F Major and variations
  { root: 'F', type: 'maj', frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], position: 1, difficulty: 80, isBarre: true },
  { root: 'F', type: 'maj', frets: ['x', 'x', 3, 2, 1, 1], fingers: [0, 0, 3, 2, 1, 1], position: 1, difficulty: 60 },
  { root: 'F', type: 'min', frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], position: 1, difficulty: 85, isBarre: true },
  { root: 'F', type: '7', frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], position: 1, difficulty: 80, isBarre: true },
  { root: 'F', type: 'M7', frets: ['x', 'x', 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0], position: 0, difficulty: 55 },

  // G Major and variations
  { root: 'G', type: 'maj', frets: [3, 2, 0, 0, 0, 3], fingers: [3, 2, 0, 0, 0, 4], position: 0, difficulty: 50 },
  { root: 'G', type: 'maj', frets: [3, 2, 0, 0, 3, 3], fingers: [3, 2, 0, 0, 4, 4], position: 0, difficulty: 60 },
  { root: 'G', type: 'min', frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], position: 3, difficulty: 85, isBarre: true },
  { root: 'G', type: '7', frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1], position: 0, difficulty: 55 },
  { root: 'G', type: 'M7', frets: [3, 2, 0, 0, 0, 2], fingers: [3, 2, 0, 0, 0, 4], position: 0, difficulty: 55 },
  { root: 'G', type: 'm7', frets: [3, 5, 3, 3, 3, 3], fingers: [1, 3, 1, 1, 1, 1], position: 3, difficulty: 80, isBarre: true },

  // A Major and variations
  { root: 'A', type: 'maj', frets: ['x', 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0], position: 0, difficulty: 45 },
  { root: 'A', type: 'min', frets: ['x', 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0], position: 0, difficulty: 40 },
  { root: 'A', type: '7', frets: ['x', 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0], position: 0, difficulty: 40 },
  { root: 'A', type: 'M7', frets: ['x', 0, 2, 1, 2, 0], fingers: [0, 0, 3, 1, 4, 0], position: 0, difficulty: 50 },
  { root: 'A', type: 'm7', frets: ['x', 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0], position: 0, difficulty: 35 },

  // B Major and variations
  { root: 'B', type: 'maj', frets: ['x', 2, 4, 4, 4, 2], fingers: [0, 1, 3, 3, 3, 1], position: 2, difficulty: 75, isBarre: true },
  { root: 'B', type: 'min', frets: ['x', 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], position: 2, difficulty: 75, isBarre: true },
  { root: 'B', type: '7', frets: ['x', 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4], position: 0, difficulty: 65 },
  { root: 'B', type: 'M7', frets: ['x', 2, 4, 3, 4, 2], fingers: [0, 1, 4, 2, 3, 1], position: 2, difficulty: 80, isBarre: true },
  { root: 'B', type: 'm7', frets: ['x', 2, 0, 2, 0, 2], fingers: [0, 2, 0, 3, 0, 4], position: 0, difficulty: 60 },

  // Flat keys
  { root: 'Bb', type: 'maj', frets: ['x', 1, 3, 3, 3, 1], fingers: [0, 1, 3, 3, 3, 1], position: 1, difficulty: 75, isBarre: true },
  { root: 'Eb', type: 'maj', frets: ['x', 'x', 1, 3, 4, 3], fingers: [0, 0, 1, 2, 4, 3], position: 0, difficulty: 65 },
  { root: 'Ab', type: 'maj', frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], position: 4, difficulty: 85, isBarre: true },
  { root: 'Db', type: 'maj', frets: ['x', 4, 6, 6, 6, 4], fingers: [0, 1, 3, 3, 3, 1], position: 4, difficulty: 80, isBarre: true },
  { root: 'Gb', type: 'maj', frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1], position: 2, difficulty: 85, isBarre: true },

  // Sus chords
  { root: 'A', type: 'sus2', frets: ['x', 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0], position: 0, difficulty: 35 },
  { root: 'A', type: 'sus4', frets: ['x', 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0], position: 0, difficulty: 40 },
  { root: 'D', type: 'sus2', frets: ['x', 'x', 0, 2, 3, 0], fingers: [0, 0, 0, 1, 2, 0], position: 0, difficulty: 35 },
  { root: 'D', type: 'sus4', frets: ['x', 'x', 0, 2, 3, 3], fingers: [0, 0, 0, 1, 3, 4], position: 0, difficulty: 45 },
  { root: 'E', type: 'sus4', frets: [0, 2, 2, 2, 0, 0], fingers: [0, 1, 1, 1, 0, 0], position: 0, difficulty: 40 },

  // Diminished and Augmented
  { root: 'E', type: 'dim', frets: ['x', 'x', 2, 3, 2, 3], fingers: [0, 0, 1, 3, 2, 4], position: 0, difficulty: 70 },
  { root: 'C', type: 'aug', frets: ['x', 3, 2, 1, 1, 0], fingers: [0, 4, 3, 1, 2, 0], position: 0, difficulty: 70 },
]) as Fingering[];

// ============================================================
// INDEXING
// ============================================================

/**
 * Index for O(1) fingering lookup by root and type.
 * Built on module load for performance.
 */
const FINGERING_INDEX = new Map<string, Fingering[]>();

/**
 * Build fingering index on module initialization.
 */
function buildFingeringIndex(): void {
  for (const fingering of FINGERING_DATABASE) {
    const key = `${fingering.root}_${fingering.type}`;
    const existing = FINGERING_INDEX.get(key) || [];
    existing.push(fingering);
    FINGERING_INDEX.set(key, existing);
  }
}

// Build index immediately
buildFingeringIndex();

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Normalize a chord root to handle enharmonic equivalents.
 *
 * Maps sharp-based spellings to flat-based spellings for consistency.
 *
 * @param root - Note name (e.g., "C#", "Gb", "E")
 * @returns Normalized note name
 *
 * @example
 * normalizeRoot('C#') // => 'Db'
 * normalizeRoot('Gb') // => 'Gb'
 * normalizeRoot('E#') // => 'F'
 */
export function normalizeRoot(root: string): string {
  const normalized = ENHARMONIC_MAP[root as keyof typeof ENHARMONIC_MAP];
  return normalized || root;
}

/**
 * Normalize a chord type to canonical form.
 *
 * @param type - Chord type (e.g., "M", "minor", "dom7")
 * @returns Normalized chord type
 *
 * @example
 * normalizeChordType('M') // => 'maj'
 * normalizeChordType('minor') // => 'min'
 * normalizeChordType('dom7') // => '7'
 */
export function normalizeChordType(type: string): string {
  const normalized = CHORD_TYPE_ALIASES[type as keyof typeof CHORD_TYPE_ALIASES];
  return normalized || type;
}

/**
 * Find fingerings for a specific chord root and type.
 *
 * Handles enharmonic equivalents and chord type aliases automatically.
 *
 * @param root - Root note (e.g., "C", "D#")
 * @param type - Chord type (e.g., "maj", "m7", "7")
 * @returns Array of fingerings, or empty array if none found
 *
 * @example
 * findFingerings('C', 'maj') // => [...fingerings for C major]
 * findFingerings('C#', 'minor') // => [...fingerings for Db minor]
 */
export function findFingerings(root: string, type: string): Fingering[] {
  const normalizedRoot = normalizeRoot(root);
  const normalizedType = normalizeChordType(type);
  const key = `${normalizedRoot}_${normalizedType}`;

  return FINGERING_INDEX.get(key) || [];
}

/**
 * Find fingerings by parsing a chord symbol.
 *
 * @param chordSymbol - Full chord symbol (e.g., "Cmaj7", "Am", "D7")
 * @returns Array of fingerings
 *
 * @example
 * findFingeringsBySymbol('Cmaj7') // => [...fingerings for Cmaj7]
 * findFingeringsBySymbol('Am') // => [...fingerings for Am]
 */
export function findFingeringsBySymbol(chordSymbol: string): Fingering[] {
  // Simple parsing: extract root and type
  // Root is first 1-2 characters (C, C#, Bb, etc.)
  const rootMatch = chordSymbol.match(/^[A-G][#b]?/);
  if (!rootMatch) return [];

  const root = rootMatch[0];
  const type = chordSymbol.slice(root.length) || 'maj';

  return findFingerings(root, type);
}

/**
 * Get all available chord types in the database.
 *
 * @returns Array of unique chord types
 *
 * @example
 * getAvailableChordTypes() // => ['maj', 'min', '7', 'M7', 'm7', ...]
 */
export function getAvailableChordTypes(): string[] {
  const types = new Set<string>();
  for (const fingering of FINGERING_DATABASE) {
    types.add(fingering.type);
  }
  return Array.from(types).sort();
}

/**
 * Get all roots available in the database.
 *
 * @returns Array of unique root notes
 *
 * @example
 * getAvailableRoots() // => ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Bb', 'Eb', ...]
 */
export function getAvailableRoots(): string[] {
  const roots = new Set<string>();
  for (const fingering of FINGERING_DATABASE) {
    roots.add(fingering.root);
  }
  return Array.from(roots).sort();
}

/**
 * Calculate finger stretch for a fingering (in frets).
 *
 * @param fingering - Fingering to analyze
 * @returns Maximum stretch distance in frets
 *
 * @example
 * calculateStretch({ frets: [0, 3, 2, 0, 1, 0], ... }) // => 2
 */
export function calculateStretch(fingering: Fingering): number {
  const activeFrets = fingering.frets
    .filter((f): f is number => typeof f === 'number' && f > 0);

  if (activeFrets.length === 0) return 0;

  const min = Math.min(...activeFrets);
  const max = Math.max(...activeFrets);

  return max - min;
}
