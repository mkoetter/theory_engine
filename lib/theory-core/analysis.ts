import { parseRoman } from './convert';
import type { BlockKey, FunctionalLabel } from '@/state/theory.types';

/**
 * Analyze the functional role of a chord (Tonic, Subdominant, Dominant).
 * Based on traditional harmonic function theory.
 */
export function analyzeFunctionalLabel(
  roman: string,
  key: BlockKey
): FunctionalLabel {
  // Handle secondary dominants - they function as dominants
  if (roman.includes('/')) {
    return 'D';
  }

  const parsed = parseRoman(roman);
  if (!parsed) return 'T';

  const degree = parsed.degree;

  // Function mapping based on scale degree
  if (key.mode === 'major') {
    switch (degree) {
      case 1: // I
      case 3: // iii (mediant, tonic function)
      case 6: // vi (submediant, tonic function)
        return 'T';
      case 2: // ii (predominant)
      case 4: // IV (subdominant)
        return 'SD';
      case 5: // V (dominant)
      case 7: // vii° (leading tone, dominant function)
        return 'D';
      default:
        return 'T';
    }
  }

  if (key.mode === 'minor') {
    switch (degree) {
      case 1: // i
      case 3: // III
      case 6: // VI
        return 'T';
      case 2: // ii°
      case 4: // iv
        return 'SD';
      case 5: // V or v
      case 7: // vii° or VII
        return 'D';
      default:
        return 'T';
    }
  }

  // Modal contexts - simplified
  switch (degree) {
    case 1:
    case 3:
    case 6:
      return 'T';
    case 2:
    case 4:
      return 'SD';
    case 5:
    case 7:
      return 'D';
    default:
      return 'T';
  }
}

/**
 * Detect common cadence patterns in a progression.
 * Returns hints about incomplete or weak cadences.
 */
export function detectCadences(
  romans: string[],
  key: BlockKey
): string[] {
  const hints: string[] = [];

  if (romans.length < 2) return hints;

  const lastTwo = romans.slice(-2);
  const lastThree = romans.length >= 3 ? romans.slice(-3) : null;

  // Analyze the last two chords
  const penultimate = lastTwo[0];
  const final = lastTwo[1];

  const penultimateFunc = analyzeFunctionalLabel(penultimate, key);
  const finalFunc = analyzeFunctionalLabel(final, key);

  // Perfect Authentic Cadence (V-I)
  if (penultimate === 'V' && (final === 'I' || final === 'i')) {
    hints.push('✓ Perfect Authentic Cadence (V-I) - Strong resolution');
    return hints;
  }

  // Half Cadence (ends on V)
  if (finalFunc === 'D' && (final.includes('V') || final.includes('v'))) {
    hints.push('⚠ Half Cadence - Ends on dominant (unresolved). Consider adding I to resolve.');
    return hints;
  }

  // Plagal Cadence (IV-I)
  if (penultimate === 'IV' && final === 'I') {
    hints.push('✓ Plagal Cadence (IV-I) - "Amen" cadence');
    return hints;
  }

  // Deceptive Cadence (V-vi)
  if (penultimate === 'V' && final === 'vi') {
    hints.push('✓ Deceptive Cadence (V-vi) - Surprise resolution');
    return hints;
  }

  // Imperfect Authentic Cadence (V-I but with inversions or other voice leading issues)
  if (penultimateFunc === 'D' && finalFunc === 'T') {
    hints.push('✓ Authentic Cadence - Dominant to Tonic resolution');
    return hints;
  }

  // Weak ending suggestions
  if (finalFunc === 'SD') {
    hints.push('⚠ Ends on subdominant - Consider V-I or I for stronger resolution');
  }

  if (finalFunc === 'T' && penultimateFunc === 'T') {
    hints.push('💡 Weak cadence - Consider adding V before final I for stronger resolution');
  }

  // Check for common progressions
  if (lastThree) {
    const [third, second, first] = lastThree;
    if (third === 'ii' && second === 'V' && first === 'I') {
      hints.push('✓ Strong cadence with ii-V-I progression');
    }
  }

  return hints;
}
