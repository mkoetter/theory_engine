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
