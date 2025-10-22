/**
 * Guitar Chords - Type Definitions
 *
 * PURPOSE:
 * Defines TypeScript interfaces and types for guitar chord fingerings,
 * voicings, and diagram generation.
 *
 * SCOPE:
 * Standard 6-string guitar in standard tuning (E-A-D-G-B-E).
 * Focus on practical fingerings for guitar players.
 *
 * @module guitar-chords/types
 */

/**
 * Guitar fingering representation.
 * Describes how to play a chord on a 6-string guitar in standard tuning.
 */
export interface Fingering {
  /** Root note of the chord (e.g., "C", "D#", "Bb") */
  root: string;

  /** Chord type (e.g., "maj7", "m", "7", "dim") */
  type: string;

  /**
   * Fret positions for each string (E-A-D-G-B-E from low to high).
   * - Number: fret number (0 = open string)
   * - 'x': muted/not played
   * Example: ['x', 3, 2, 0, 1, 0] for C major
   */
  frets: (number | 'x')[];

  /**
   * Finger numbers for each string (E-A-D-G-B-E).
   * - 0: open string or not played
   * - 1-4: index, middle, ring, pinky
   * Example: [0, 3, 2, 0, 1, 0] for C major
   */
  fingers: (number | 0)[];

  /**
   * Fret position/region where chord is played.
   * Used for barre chords and higher position voicings.
   * Example: 3 for a C major barre chord at 3rd fret
   */
  position?: number;

  /**
   * Starting fret for diagram display.
   * For chords played higher on neck, this indicates the lowest fret shown.
   */
  baseFret?: number;

  /**
   * Playability score (0-100, higher = easier).
   * Calculated based on stretch, position, and technique difficulty.
   */
  difficulty?: number;

  /**
   * Whether this is a barre chord requiring one finger across multiple strings.
   */
  isBarre?: boolean;
}

/**
 * Complete guitar chord with all available voicings.
 */
export interface GuitarChord {
  /** Chord symbol (e.g., "Cmaj7", "Am9", "D7#9") */
  symbol: string;

  /** Root note */
  root: string;

  /** Chord type */
  type: string;

  /** Array of note names that make up the chord */
  notes: string[];

  /** All available fingerings for this chord */
  voicings: Fingering[];
}

/**
 * Options for filtering guitar chord voicings.
 */
export interface VoicingFilters {
  /** Maximum fret position (e.g., 12 for first 12 frets) */
  maxFret?: number;

  /** Minimum fret position (e.g., 0 for open position) */
  minFret?: number;

  /** Only include open position voicings (with at least one open string) */
  openOnly?: boolean;

  /** Only include barre chord voicings */
  barreOnly?: boolean;

  /** Maximum finger stretch (in frets) */
  maxStretch?: number;

  /** Difficulty level filter */
  difficulty?: 'easy' | 'medium' | 'hard';

  /** Preferred string set (e.g., "bass" for lower strings, "treble" for higher) */
  stringSet?: 'bass' | 'treble' | 'middle' | 'all';
}

/**
 * Options for generating SVG chord diagrams.
 */
export interface DiagramOptions {
  /** Diagram width in pixels */
  width?: number;

  /** Diagram height in pixels */
  height?: number;

  /** Number of frets to display */
  fretCount?: number;

  /** Show finger numbers on diagram */
  showFingers?: boolean;

  /** Show note names on diagram */
  showNotes?: boolean;

  /** Visual style for the diagram */
  style?: 'modern' | 'classic';

  /** Primary color for the diagram (used for non-root notes) */
  color?: string;

  /** Font size for labels */
  fontSize?: number;

  /** Color for root notes (default: #D4A574 gold) */
  rootColor?: string;

  /** Color for 7th notes (default: same as root) */
  seventhColor?: string;

  /** Color for 3rd notes (default: same as color) */
  thirdColor?: string;

  /** Color for 5th notes (default: same as color) */
  fifthColor?: string;

  /** Enable interval-based color coding (default: true for root only) */
  colorByInterval?: boolean;
}

