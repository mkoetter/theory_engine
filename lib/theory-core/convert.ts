import { Progression, RomanNumeral, Key } from 'tonal';

export type EnharmonicPolicy = "key-signature" | "flat" | "sharp";

/**
 * Convert roman numerals to absolute chord names.
 * Uses Tonal.js Progression.fromRomanNumerals.
 */
export function romansToAbsolute(
  tonic: string,
  romans: string[],
  enharmonicPolicy: EnharmonicPolicy = "key-signature"
): string[] {
  // Tonal.js handles the conversion directly
  const chords = Progression.fromRomanNumerals(tonic, romans);

  // Apply enharmonic policy if needed (simplified for MVP)
  // Full enharmonic normalization can be added in Milestone 3
  return chords;
}

/**
 * Convert absolute chord names to roman numerals.
 * Uses Tonal.js Progression.toRomanNumerals.
 */
export function absoluteToRomans(
  tonic: string,
  chords: string[]
): string[] {
  // Tonal.js provides this conversion
  return Progression.toRomanNumerals(tonic, chords);
}

/**
 * Parse a single roman numeral to understand its properties.
 */
export function parseRoman(roman: string): {
  degree: number;
  quality: string;
  accidentals: string;
} | null {
  const parsed = RomanNumeral.get(roman);

  if (!parsed || !parsed.roman) {
    return null;
  }

  return {
    degree: parsed.step || 0,
    quality: parsed.chordType || '',
    accidentals: parsed.acc || '',
  };
}
