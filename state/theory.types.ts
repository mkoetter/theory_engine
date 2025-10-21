export type SectionRole = "Intro" | "Verse" | "Pre" | "Chorus" | "Bridge" | "Outro";

export interface BlockKey {
  tonic: string;
  mode: "major" | "minor" | "dorian" | "phrygian" | "lydian" | "mixolydian" | "aeolian" | "locrian";
  minorVariant?: "natural" | "harmonic" | "melodic";
}

export interface Block {
  id: string;
  role: SectionRole;
  key: BlockKey;
  palette: {
    source: "mode" | "scratch";
    includeSevenths: boolean;
    romans: string[];
    extras: string[];
  };
  progression: Array<{ roman: string; bars: number; origin?: OriginTag }>;
  renderCache?: { chords: string[]; enharmonics: "key-signature" | "flat" | "sharp" };
}

export type OriginTag = "diatonic" | "borrowed" | "secondary" | "chromatic-mediant" | "custom";

export type FunctionalLabel = "T" | "SD" | "D";

export interface TransitionPlan {
  type: "pivot" | "secondary" | "direct";
  chords: string[];
  notes: string;
}

export interface TensionPoint {
  bar: number;
  value: number;
}

export interface ProgressionAnalysis {
  functions: FunctionalLabel[];
  cadenceHints: string[];
  tension: TensionPoint[];
  borrowedCount: number;
  secondaryCount: number;
}

export interface ChordClassification {
  origin: OriginTag;
  quality: string;
}

// Circle of Fifths types

export type ChordQuality = "major" | "minor" | "diminished" | "augmented";

export interface CircleNote {
  note: string;
  position: number;
  isDiatonic: boolean;
}

export interface CircleDegree {
  position: number;
  roman: string;
  isTonic: boolean;
}

export interface CircleChordQuality {
  position: number;
  quality: ChordQuality;
}

export interface CircleOfFifthsData {
  notes: CircleNote[];
  degrees: CircleDegree[];
  chordQualities: CircleChordQuality[];
  tonicPosition: number;
}

// Extended Harmonies types

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
 * Chord voicing with specific note arrangement.
 */
export interface ChordVoicing {
  /** Name of the voicing */
  name: string;

  /** Notes with octave numbers */
  notes: string[];
}

// Scale Enhancement types

/**
 * Scale characteristics for analysis and classification.
 */
export interface ScaleCharacteristics {
  /** Whether the scale has symmetrical interval structure */
  isSymmetrical: boolean;

  /** Whether the scale has 5 notes (pentatonic) */
  isPentatonic: boolean;

  /** Whether the scale has 7 notes (heptatonic) */
  isHeptatonic: boolean;

  /** Whether the scale contains augmented intervals */
  hasAugmentedIntervals: boolean;

  /** Whether the scale contains diminished intervals */
  hasDiminishedIntervals: boolean;

  /** Interval pattern (e.g., "2-2-2-2-2-2" for whole tone) */
  pattern?: string;
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

  /** Number of common notes with source scale */
  commonNotesCount: number;
}
