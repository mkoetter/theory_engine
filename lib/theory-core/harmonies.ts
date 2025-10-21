/**
 * Extended Harmonies Module
 *
 * PURPOSE:
 * Handles extended chord voicings, inversions, and complex jazz harmonies.
 * Supports 9th, 11th, 13th chords, altered extensions, and slash chords.
 *
 * CAPABILITIES:
 * - Parse extended chord symbols (Cmaj7, D7b9, F#m11, etc.)
 * - Parse slash chords (C/E, Am/C, G7/B, etc.)
 * - Analyze chord extensions and alterations
 * - Convert between Roman numerals and extended symbols
 * - Validate chord construction
 * - Determine chord quality and function
 *
 * USAGE:
 * This module extends the basic chord functionality to support complex
 * harmonic structures common in jazz, R&B, and contemporary music.
 *
 * @example
 * ```typescript
 * import { parseExtendedChord, createSlashChord } from '@/lib/theory-core/harmonies';
 *
 * const chord = parseExtendedChord('Cmaj9');
 * // => { root: 'C', quality: 'major', extensions: [7, 9], alterations: [] }
 *
 * const slash = createSlashChord('C', 'E');
 * // => { chord: 'C', bass: 'E', symbol: 'C/E', inversion: 1 }
 * ```
 */

import { Note, Chord } from 'tonal';

/**
 * Extended chord structure with full harmonic information.
 */
export interface ExtendedChord {
  /** Root note of the chord */
  root: string;

  /** Base chord quality */
  quality: 'major' | 'minor' | 'dominant' | 'diminished' | 'augmented' | 'sus2' | 'sus4';

  /** Extensions (7, 9, 11, 13) */
  extensions: number[];

  /** Alterations (b9, #9, #11, b13, etc.) */
  alterations: Array<{ degree: number; alteration: 'b' | '#' }>;

  /** Added tones (add9, add11, etc.) */
  addedTones: number[];

  /** Bass note (for slash chords) */
  bass?: string;

  /** Original symbol as parsed */
  symbol: string;

  /** All notes in the chord */
  notes: string[];
}

/**
 * Slash chord structure with inversion information.
 */
export interface SlashChord {
  /** Main chord symbol */
  chord: string;

  /** Bass note */
  bass: string;

  /** Complete symbol (e.g., "C/E") */
  symbol: string;

  /** Inversion number (1 = first inversion, 2 = second, etc.) */
  inversion: number;

  /** All notes in order */
  notes: string[];
}

/**
 * Parse an extended chord symbol into its components.
 *
 * Supports comprehensive chord notation including:
 * - Basic triads: C, Cm, C+, C°
 * - Seventh chords: Cmaj7, C7, Cm7, Cm7b5
 * - Extensions: C9, C11, C13, Cmaj9, Cm11
 * - Alterations: C7b9, C7#9, C7#11, C7b13
 * - Added tones: Cadd9, Cadd11
 * - Suspended: Csus2, Csus4, C7sus4
 * - Slash chords: C/E, Am/C, D7/F#
 *
 * @param symbol - Chord symbol to parse (e.g., "Cmaj9", "D7b9#11", "Am/C")
 * @returns ExtendedChord object with all harmonic information
 *
 * @example
 * parseExtendedChord('Cmaj9')
 * // => { root: 'C', quality: 'major', extensions: [7, 9], ... }
 *
 * parseExtendedChord('D7b9#11')
 * // => { root: 'D', quality: 'dominant', extensions: [7, 9, 11],
 * //      alterations: [{ degree: 9, alteration: 'b' }, { degree: 11, alteration: '#' }] }
 *
 * parseExtendedChord('Am/C')
 * // => { root: 'A', quality: 'minor', bass: 'C', ... }
 */
export function parseExtendedChord(symbol: string): ExtendedChord {
  // Handle slash chords first
  let bassNote: string | undefined;
  let chordPart = symbol;

  if (symbol.includes('/')) {
    const [chord, bass] = symbol.split('/');
    chordPart = chord.trim();
    bassNote = bass.trim();
  }

  // Use Tonal.js to parse the chord
  const chord = Chord.get(chordPart);

  if (!chord.tonic) {
    throw new Error(`Invalid chord symbol: ${symbol}`);
  }

  // Determine base quality
  const quality = determineChordQuality(chord);

  // Parse extensions and alterations
  const { extensions, alterations, addedTones } = parseChordExtensions(chord.aliases[0] || chord.symbol);

  // Get all notes
  let notes = chord.notes;
  if (bassNote) {
    // Move bass note to bottom
    notes = [bassNote, ...notes.filter(n => Note.chroma(n) !== Note.chroma(bassNote))];
  }

  return {
    root: chord.tonic,
    quality,
    extensions,
    alterations,
    addedTones,
    bass: bassNote,
    symbol,
    notes,
  };
}

/**
 * Create a slash chord from a chord and bass note.
 *
 * Analyzes the relationship between the chord and bass note to determine
 * the inversion and proper voice leading.
 *
 * @param chordSymbol - Main chord (e.g., 'C', 'Am7', 'Gmaj7')
 * @param bassNote - Bass note (e.g., 'E', 'C', 'B')
 * @returns SlashChord object with inversion information
 *
 * @example
 * createSlashChord('C', 'E')
 * // => { chord: 'C', bass: 'E', symbol: 'C/E', inversion: 1, notes: ['E', 'C', 'G'] }
 *
 * createSlashChord('Am7', 'C')
 * // => { chord: 'Am7', bass: 'C', symbol: 'Am7/C', inversion: 2, notes: ['C', 'A', 'E', 'G'] }
 */
export function createSlashChord(chordSymbol: string, bassNote: string): SlashChord {
  const chord = Chord.get(chordSymbol);

  if (!chord.tonic) {
    throw new Error(`Invalid chord: ${chordSymbol}`);
  }

  // Find which degree the bass note is
  const bassChroma = Note.chroma(bassNote);
  const chordChromas = chord.notes.map(n => Note.chroma(n));
  const inversionIndex = chordChromas.indexOf(bassChroma);

  // Determine inversion
  let inversion = 0;
  let notes = chord.notes;

  if (inversionIndex >= 0) {
    // Bass note is part of the chord - it's a true inversion
    inversion = inversionIndex;
    notes = [...chord.notes.slice(inversionIndex), ...chord.notes.slice(0, inversionIndex)];
  } else {
    // Bass note is not part of the chord - polychord or added bass
    inversion = -1;
    notes = [bassNote, ...chord.notes];
  }

  return {
    chord: chordSymbol,
    bass: bassNote,
    symbol: `${chordSymbol}/${bassNote}`,
    inversion,
    notes,
  };
}

/**
 * Validate if a chord symbol is properly formed.
 *
 * Checks for valid root notes, quality symbols, extensions, and syntax.
 *
 * @param symbol - Chord symbol to validate
 * @returns Object with isValid flag and error message if invalid
 *
 * @example
 * validateChordSymbol('Cmaj9')  // => { isValid: true, error: null }
 * validateChordSymbol('Z#7')    // => { isValid: false, error: 'Invalid root note' }
 */
export function validateChordSymbol(symbol: string): { isValid: boolean; error: string | null } {
  try {
    const chord = Chord.get(symbol);

    if (!chord.tonic) {
      return { isValid: false, error: 'Invalid root note' };
    }

    if (chord.notes.length === 0) {
      return { isValid: false, error: 'No notes found in chord' };
    }

    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Convert a Roman numeral with extensions to an absolute chord symbol.
 *
 * Handles extended Roman numerals like "Imaj9", "ii7", "V7b9", etc.
 *
 * @param roman - Roman numeral with extensions
 * @param tonic - Key tonic
 * @returns Absolute chord symbol with extensions
 *
 * @example
 * extendedRomanToAbsolute('Imaj9', 'C')  // => 'Cmaj9'
 * extendedRomanToAbsolute('ii7', 'C')     // => 'Dm7'
 * extendedRomanToAbsolute('V7b9', 'G')    // => 'D7b9'
 */
export function extendedRomanToAbsolute(roman: string, tonic: string): string {
  // Parse the Roman numeral
  const match = roman.match(/^([b#]?)([ivIV]+)(.*)$/);
  if (!match) throw new Error(`Invalid Roman numeral: ${roman}`);

  const [, accidental, numeralPart, extension] = match;

  // Determine the degree
  const romanMap: Record<string, number> = {
    'i': 1, 'I': 1,
    'ii': 2, 'II': 2,
    'iii': 3, 'III': 3,
    'iv': 4, 'IV': 4,
    'v': 5, 'V': 5,
    'vi': 6, 'VI': 6,
    'vii': 7, 'VII': 7,
  };

  const degree = romanMap[numeralPart.toLowerCase()];
  if (!degree) throw new Error(`Invalid Roman numeral: ${numeralPart}`);

  // Get the scale note for this degree
  const scale = Chord.get(`${tonic} major`).notes;
  let rootNote = scale[degree - 1];

  // Apply accidental
  if (accidental === 'b') {
    rootNote = Note.transpose(rootNote, '-1');
  } else if (accidental === '#') {
    rootNote = Note.transpose(rootNote, '1');
  }

  // Determine quality from case
  const isUpperCase = numeralPart === numeralPart.toUpperCase();
  const baseQuality = isUpperCase ? '' : 'm';

  return `${rootNote}${baseQuality}${extension}`;
}

/**
 * Get all possible voicings for a chord.
 *
 * Returns different ways to voice the same chord, including various
 * inversions and spacings.
 *
 * @param symbol - Chord symbol
 * @param options - Voicing options (range, doublings, etc.)
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
export function getChordVoicings(
  symbol: string,
  options: {
    inversions?: boolean;
    dropVoicings?: boolean;
    openVoicings?: boolean;
    octaveRange?: [number, number];
  } = {}
): Array<{ name: string; notes: string[] }> {
  const {
    inversions = true,
    dropVoicings = false,
    openVoicings = false,
    octaveRange = [3, 5],
  } = options;

  const chord = Chord.get(symbol);
  if (!chord.tonic) throw new Error(`Invalid chord: ${symbol}`);

  const voicings: Array<{ name: string; notes: string[] }> = [];
  const baseNotes = chord.notes;

  // Root position
  voicings.push({
    name: 'Root position',
    notes: baseNotes.map((n, i) => `${n}${octaveRange[0] + Math.floor(i / 7)}`),
  });

  // Inversions
  if (inversions && baseNotes.length > 2) {
    for (let i = 1; i < baseNotes.length; i++) {
      const inverted = [...baseNotes.slice(i), ...baseNotes.slice(0, i)];
      voicings.push({
        name: `${getInversionName(i, baseNotes.length)} inversion`,
        notes: inverted.map((n, idx) => `${n}${octaveRange[0] + Math.floor((i + idx) / 7)}`),
      });
    }
  }

  // TODO: Add drop voicings and open voicings

  return voicings;
}

// Helper functions

/**
 * Determine chord quality from Tonal chord object.
 */
function determineChordQuality(chord: ReturnType<typeof Chord.get>): ExtendedChord['quality'] {
  const aliases = chord.aliases.join(' ').toLowerCase();
  const symbol = chord.symbol.toLowerCase();

  // Check for major (including maj7, maj9, etc.)
  if (aliases.includes('maj') || symbol.includes('maj')) return 'major';

  // Check for minor
  if (aliases.includes('min') || symbol.includes('min') || symbol.includes('m')) return 'minor';

  // Check for dominant (7, 9, 13 without 'maj')
  if (aliases.includes('dom') || (symbol.includes('7') && !symbol.includes('maj'))) return 'dominant';

  // Check for diminished
  if (aliases.includes('dim') || chord.quality === 'Diminished') return 'diminished';

  // Check for augmented
  if (aliases.includes('aug') || chord.quality === 'Augmented') return 'augmented';

  // Check for suspended
  if (aliases.includes('sus2') || symbol.includes('sus2')) return 'sus2';
  if (aliases.includes('sus4') || aliases.includes('sus') || symbol.includes('sus')) return 'sus4';

  // Default to major if nothing else matches
  return 'major';
}

/**
 * Parse extensions and alterations from chord symbol.
 */
function parseChordExtensions(symbol: string): {
  extensions: number[];
  alterations: Array<{ degree: number; alteration: 'b' | '#' }>;
  addedTones: number[];
} {
  const extensions: number[] = [];
  const alterations: Array<{ degree: number; alteration: 'b' | '#' }> = [];
  const addedTones: number[] = [];

  // Match extensions like 7, 9, 11, 13
  const extMatch = symbol.match(/(\d+)/g);
  if (extMatch) {
    extMatch.forEach(ext => {
      const num = parseInt(ext);
      if ([7, 9, 11, 13].includes(num)) {
        extensions.push(num);
      }
    });
  }

  // Match alterations like b9, #9, #11, b13
  const altMatch = symbol.match(/([b#])(\d+)/g);
  if (altMatch) {
    altMatch.forEach(alt => {
      const altType = alt[0] as 'b' | '#';
      const degree = parseInt(alt.slice(1));
      alterations.push({ degree, alteration: altType });
    });
  }

  // Match added tones like add9
  const addMatch = symbol.match(/add(\d+)/g);
  if (addMatch) {
    addMatch.forEach(add => {
      const num = parseInt(add.replace('add', ''));
      addedTones.push(num);
    });
  }

  return { extensions, alterations, addedTones };
}

/**
 * Get inversion name (First, Second, Third, etc.).
 */
function getInversionName(index: number, totalNotes: number): string {
  const names = ['Root', 'First', 'Second', 'Third', 'Fourth', 'Fifth'];
  return names[index] || `${index}th`;
}

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
export function getExtendedChordNotes(extended: ExtendedChord, startOctave: number = 3): string[] {
  return extended.notes.map((note, i) => `${note}${startOctave + Math.floor(i / 7)}`);
}
