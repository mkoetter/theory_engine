import { Key, Scale, Chord, Interval, Note } from 'tonal';
import type { BlockKey } from '@/state/theory.types';

/**
 * Generate a diatonic chord palette for a given key and mode.
 * Uses Tonal.js to derive scale chords.
 */
export function buildPalette(
  key: BlockKey,
  opts: { sevenths: boolean }
): string[] {
  const { tonic, mode, minorVariant } = key;
  const { sevenths } = opts;

  // For major mode, use Tonal's Key module (already works well)
  if (mode === 'major') {
    const majorKey = Key.majorKey(tonic);
    if (!majorKey) return [];

    // Get triads or seventh chords (convert readonly arrays to mutable)
    return sevenths
      ? majorKey.chords.map((chord) => chord.includes('7') ? chord : `${chord}maj7`)
      : [...majorKey.triads];
  }

  // For minor and all other modes, build diatonic chords from scale degrees
  let scaleName = `${tonic} ${mode}`;
  if (mode === 'minor') {
    scaleName = `${tonic} minor`;
    if (minorVariant === 'harmonic') {
      scaleName = `${tonic} harmonic minor`;
    } else if (minorVariant === 'melodic') {
      scaleName = `${tonic} melodic minor`;
    }
  }

  const scale = Scale.get(scaleName);
  if (!scale.notes.length) return [];

  // Build diatonic chords from each scale degree
  return buildDiatonicChords(scale.notes, sevenths);
}

/**
 * Build diatonic chords by stacking thirds from each scale degree.
 */
function buildDiatonicChords(scaleNotes: string[], includeSevenths: boolean): string[] {
  const chords: string[] = [];

  for (let i = 0; i < scaleNotes.length; i++) {
    const root = scaleNotes[i];
    const third = scaleNotes[(i + 2) % scaleNotes.length];
    const fifth = scaleNotes[(i + 4) % scaleNotes.length];
    const seventh = scaleNotes[(i + 6) % scaleNotes.length];

    // Determine chord quality from intervals
    const chordNotes = includeSevenths
      ? [root, third, fifth, seventh]
      : [root, third, fifth];

    const chordName = detectChordName(root, chordNotes);
    if (chordName) {
      chords.push(chordName);
    }
  }

  return chords;
}

/**
 * Detect chord name from root and notes.
 * Determines quality (major, minor, diminished, etc.) from intervals.
 */
function detectChordName(root: string, notes: string[]): string {
  // Use Tonal's Chord.detect to identify the chord
  const detected = Chord.detect(notes, { assumePerfectFifth: false });

  if (detected.length === 0) {
    // Fallback: build manually from intervals
    return buildChordFromIntervals(root, notes);
  }

  // Find the chord that has the root as its root note
  const rootChord = detected.find(chord => chord.startsWith(root));

  if (rootChord) {
    return rootChord;
  }

  // If no exact match, use the first detected chord or fallback
  return detected[0] || buildChordFromIntervals(root, notes);
}

/**
 * Build chord name from intervals when Chord.detect fails.
 */
function buildChordFromIntervals(root: string, notes: string[]): string {
  if (notes.length < 3) return root;

  const intervals = notes.slice(1).map(note => Interval.distance(root, note));

  // Determine triad quality
  const thirdInterval = intervals[0];
  const fifthInterval = intervals[1];

  let quality = '';

  // Check third (major or minor)
  if (thirdInterval === '3M') {
    quality = ''; // Major (no symbol)
  } else if (thirdInterval === '3m') {
    quality = 'm'; // Minor
  }

  // Check fifth (perfect, diminished, or augmented)
  if (fifthInterval === '5d') {
    quality = quality === 'm' ? 'dim' : 'dim'; // Diminished
  } else if (fifthInterval === '5A') {
    quality = '+'; // Augmented
  }

  // If we have a seventh, add it
  if (notes.length >= 4) {
    const seventhInterval = intervals[2];

    if (quality === 'dim') {
      // Diminished chord with 7th
      quality = seventhInterval === '7d' ? 'dim7' : 'ø7';
    } else if (quality === 'm') {
      // Minor chord with 7th
      quality = seventhInterval === '7M' ? 'mmaj7' : 'm7';
    } else if (quality === '+') {
      // Augmented chord with 7th
      quality = seventhInterval === '7M' ? '+maj7' : '+7';
    } else {
      // Major chord with 7th
      quality = seventhInterval === '7M' ? 'maj7' : '7';
    }
  }

  return root + quality;
}
