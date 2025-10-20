import { Key, Scale, Chord } from 'tonal';
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

  // For major and minor modes, use Tonal's Key module
  if (mode === 'major') {
    const majorKey = Key.majorKey(tonic);
    if (!majorKey) return [];

    // Get triads or seventh chords
    return sevenths
      ? majorKey.chords.map((chord) => chord.includes('7') ? chord : `${chord}maj7`)
      : majorKey.triads;
  }

  if (mode === 'minor') {
    // Handle minor variants
    let scaleName = `${tonic} minor`;
    if (minorVariant === 'harmonic') {
      scaleName = `${tonic} harmonic minor`;
    } else if (minorVariant === 'melodic') {
      scaleName = `${tonic} melodic minor`;
    }

    const scale = Scale.get(scaleName);
    if (!scale.notes.length) return [];

    // Build chords from scale degrees
    const chords = Scale.scaleChords(scale.name);
    return sevenths
      ? chords.filter((c) => c.includes('7'))
      : chords.filter((c) => !c.includes('7') && !c.includes('add'));
  }

  // For other modes (dorian, phrygian, etc.), build from scale
  const scaleName = `${tonic} ${mode}`;
  const scale = Scale.get(scaleName);

  if (!scale.notes.length) return [];

  // Get scale chords
  const chords = Scale.scaleChords(scale.name);
  return sevenths
    ? chords.filter((c) => c.includes('7'))
    : chords.filter((c) => !c.includes('7') && !c.includes('add'));
}
