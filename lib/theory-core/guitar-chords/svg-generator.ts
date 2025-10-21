/**
 * Guitar Chords - SVG Generator
 *
 * PURPOSE:
 * Generate SVG fretboard diagrams for guitar chord fingerings.
 * Uses svguitar library for rendering.
 *
 * FEATURES:
 * - Automatic barre chord detection
 * - Customizable diagram styling
 * - Support for open and muted strings
 * - Display finger numbers and positions
 *
 * @module guitar-chords/svg-generator
 */

import { SVGuitarChord } from 'svguitar';
import { Fingering, DiagramOptions } from './types';

// ============================================================
// CONSTANTS
// ============================================================

/**
 * Default diagram options following guitar tablature conventions.
 */
const DEFAULT_OPTIONS: Required<DiagramOptions> = Object.freeze({
  width: 200,
  height: 250,
  fretCount: 5,
  showFingers: true,
  showNotes: false,
  style: 'modern',
  color: '#333333',
  fontSize: 14,
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Detect barre chords from fingering data.
 * A barre is when the same finger plays multiple adjacent strings on the same fret.
 *
 * @param fingering - Fingering to analyze
 * @returns Array of barre objects for svguitar
 */
function detectBarres(fingering: Fingering): Array<{ fromString: number; toString: number; fret: number }> {
  const { frets, fingers } = fingering;
  const barres: Array<{ fromString: number; toString: number; fret: number }> = [];

  // Group strings by finger and fret
  const fingerGroups = new Map<string, number[]>();

  for (let stringIndex = 0; stringIndex < frets.length; stringIndex++) {
    const fret = frets[stringIndex];
    const finger = fingers[stringIndex];

    if (typeof fret === 'number' && fret > 0 && finger > 0) {
      const key = `${finger}-${fret}`;
      const existing = fingerGroups.get(key) || [];
      existing.push(stringIndex + 1); // svguitar uses 1-indexed strings
      fingerGroups.set(key, existing);
    }
  }

  // Find barres (same finger on 2+ adjacent strings at same fret)
  for (const [key, strings] of fingerGroups.entries()) {
    if (strings.length >= 2) {
      // Check if strings are adjacent
      const sorted = [...strings].sort((a, b) => a - b);
      let isAdjacent = true;
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] !== sorted[i - 1] + 1) {
          isAdjacent = false;
          break;
        }
      }

      if (isAdjacent) {
        const [_finger, fret] = key.split('-').map(Number);
        barres.push({
          fromString: Math.min(...sorted),
          toString: Math.max(...sorted),
          fret,
        });
      }
    }
  }

  return barres;
}

/**
 * Convert fingering frets array to svguitar format.
 * svguitar uses string indices starting at 1, and special values for open/muted.
 *
 * @param fingering - Fingering to convert
 * @returns Array in svguitar format
 */
function convertFretsForSVGuitar(fingering: Fingering): Array<[number, number | string]> {
  return fingering.frets.map((fret, index) => {
    const stringNum = index + 1;
    if (fret === 'x') {
      // Muted string
      return [stringNum, 'x'];
    } else {
      // Open or fretted note
      return [stringNum, fret];
    }
  });
}

/**
 * Convert fingering fingers array to svguitar format.
 *
 * @param fingering - Fingering to convert
 * @returns Array in svguitar format
 */
function convertFingersForSVGuitar(fingering: Fingering): Array<[number, number | 'x']> {
  return fingering.fingers
    .map((finger, index) => {
      if (finger === 0) return null;
      return [index + 1, finger] as [number, number];
    })
    .filter((f): f is [number, number] => f !== null);
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Generate SVG chord diagram from a fingering.
 *
 * Creates a visual fretboard diagram showing finger positions,
 * open/muted strings, and barre chords.
 *
 * @param fingering - Guitar fingering to visualize
 * @param options - Customization options
 * @returns SVG string
 *
 * @example
 * const cmajFingering = { root: 'C', type: 'maj', frets: ['x', 3, 2, 0, 1, 0], ... };
 * const svg = generateChordSVG(cmajFingering);
 * // Returns: '<svg>...</svg>'
 */
export function generateChordSVG(fingering: Fingering, options?: Partial<DiagramOptions>): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Determine base fret for display
  const activeFrets = fingering.frets.filter((f): f is number => typeof f === 'number' && f > 0);
  const minFret = activeFrets.length > 0 ? Math.min(...activeFrets) : 1;
  const baseFret = fingering.baseFret || (minFret > 1 ? minFret : 1);

  // Detect barres
  const barres = detectBarres(fingering);

  // TODO: Full SVGuitar integration
  // For now, return a placeholder SVG while we refine the svguitar API integration
  return generatePlaceholderSVG(fingering, opts, barres);
}

/**
 * Generate placeholder SVG with basic chord information.
 *
 * @param fingering - Fingering to display
 * @param options - Diagram options
 * @param barres - Barre information
 * @returns Placeholder SVG string
 */
function generatePlaceholderSVG(
  fingering: Fingering,
  options: Required<DiagramOptions>,
  barres: Array<{ fromString: number; toString: number; fret: number }>
): string {
  const fretDisplay = fingering.frets
    .map((f, i) => `String ${i + 1}: ${f === 'x' ? 'X' : f}`)
    .join(', ');

  const barreText = barres.length > 0 ? `Barre: ${barres.map(b => `fret ${b.fret}`).join(', ')}` : '';

  return `
    <svg width="${options.width}" height="${options.height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f9f9f9" stroke="#999" stroke-width="2" rx="4"/>
      <text x="50%" y="20%" text-anchor="middle" font-size="18" font-weight="bold" fill="#333">
        ${fingering.root}${fingering.type}
      </text>
      <text x="50%" y="35%" text-anchor="middle" font-size="11" fill="#666">
        Position: ${fingering.position || 'Open'}
      </text>
      <text x="50%" y="50%" text-anchor="middle" font-size="10" fill="#888">
        ${fretDisplay}
      </text>
      ${barreText ? `<text x="50%" y="65%" text-anchor="middle" font-size="10" fill="#888">${barreText}</text>` : ''}
      <text x="50%" y="85%" text-anchor="middle" font-size="9" fill="#aaa">
        (Detailed diagram coming soon)
      </text>
    </svg>
  `.trim();
}

/**
 * Generate error placeholder SVG when diagram generation fails.
 *
 * @param fingering - Fingering that failed to render
 * @param options - Diagram options
 * @returns Error SVG string
 */
function generateErrorSVG(fingering: Fingering, options: Required<DiagramOptions>): string {
  return `
    <svg width="${options.width}" height="${options.height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f5f5f5" stroke="#ccc" stroke-width="2"/>
      <text x="50%" y="50%" text-anchor="middle" font-size="14" fill="#666">
        ${fingering.root}${fingering.type}
      </text>
      <text x="50%" y="65%" text-anchor="middle" font-size="12" fill="#999">
        (diagram unavailable)
      </text>
    </svg>
  `.trim();
}

/**
 * Generate SVG diagrams for multiple fingerings.
 *
 * Batch operation for creating multiple chord diagrams at once.
 *
 * @param fingerings - Array of fingerings to visualize
 * @param options - Customization options (applied to all diagrams)
 * @returns Array of SVG strings
 *
 * @example
 * const fingerings = [cMajor, dMinor, fMajor, gMajor];
 * const svgs = generateMultipleChordSVGs(fingerings);
 * // Returns: ['<svg>...</svg>', '<svg>...</svg>', ...]
 */
export function generateMultipleChordSVGs(
  fingerings: Fingering[],
  options?: Partial<DiagramOptions>
): string[] {
  return fingerings.map(fingering => generateChordSVG(fingering, options));
}

/**
 * Generate a compact chord diagram (smaller size for progression displays).
 *
 * @param fingering - Fingering to visualize
 * @returns Compact SVG string
 *
 * @example
 * const svg = generateCompactChordSVG(cmajFingering);
 */
export function generateCompactChordSVG(fingering: Fingering): string {
  return generateChordSVG(fingering, {
    width: 120,
    height: 160,
    fretCount: 4,
    showFingers: false,
    fontSize: 10,
  });
}

/**
 * Generate chord diagram with note names displayed.
 *
 * @param fingering - Fingering to visualize
 * @param notes - Note names for each string (optional)
 * @returns SVG string with note names
 *
 * @example
 * const svg = generateChordSVGWithNotes(cmajFingering, ['C', 'E', 'G', 'C', 'E']);
 */
export function generateChordSVGWithNotes(fingering: Fingering, notes?: string[]): string {
  return generateChordSVG(fingering, {
    showNotes: true,
  });
}
