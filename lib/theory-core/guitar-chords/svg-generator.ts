/**
 * Guitar Chords - SVG Generator
 *
 * PURPOSE:
 * Generate SVG fretboard diagrams for guitar chord fingerings.
 * Custom implementation that works in both server and client environments.
 *
 * FEATURES:
 * - Automatic barre chord detection
 * - Customizable diagram styling
 * - Support for open and muted strings
 * - Display finger numbers and positions
 *
 * @module guitar-chords/svg-generator
 */

import { Fingering, DiagramOptions } from './types';
import { Note } from 'tonal';

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

// Diagram layout constants
const DIAGRAM_PADDING = 40;
const STRING_SPACING = 28;
const FRET_HEIGHT = 35;
const DOT_RADIUS = 10;
const OPEN_CIRCLE_RADIUS = 6;

// Color constants
const TONIC_COLOR = '#D4A574'; // Gold/tan color for root notes
const DEFAULT_DOT_COLOR = '#333333'; // Default dark color for other notes

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Detect barre chords from fingering data.
 */
function detectBarres(fingering: Fingering): Array<{ fromString: number; toString: number; fret: number }> {
  const { frets, fingers } = fingering;
  const barres: Array<{ fromString: number; toString: number; fret: number }> = [];

  const fingerGroups = new Map<string, number[]>();

  for (let stringIndex = 0; stringIndex < frets.length; stringIndex++) {
    const fret = frets[stringIndex];
    const finger = fingers[stringIndex];

    if (typeof fret === 'number' && fret > 0 && finger > 0) {
      const key = `${finger}-${fret}`;
      const existing = fingerGroups.get(key) || [];
      existing.push(stringIndex);
      fingerGroups.set(key, existing);
    }
  }

  for (const [key, strings] of fingerGroups.entries()) {
    if (strings.length >= 2) {
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
 * Determine which strings contain the root/tonic note.
 * Standard guitar tuning: E A D G B E (strings 0-5, low to high)
 */
function getRootStrings(fingering: Fingering): Set<number> {
  const rootStrings = new Set<number>();
  const standardTuning = ['E', 'A', 'D', 'G', 'B', 'E']; // 6th to 1st string

  // Get the root note's chroma (pitch class) for comparison
  const rootChroma = Note.chroma(fingering.root);
  if (rootChroma === undefined) {
    return rootStrings; // Invalid root note
  }

  for (let stringIndex = 0; stringIndex < fingering.frets.length; stringIndex++) {
    const fret = fingering.frets[stringIndex];

    if (fret === 0) {
      // Open string - check if open string note matches root
      const openNote = standardTuning[stringIndex];
      const openChroma = Note.chroma(openNote);
      if (openChroma === rootChroma) {
        rootStrings.add(stringIndex);
      }
    } else if (typeof fret === 'number' && fret > 0) {
      // Fretted note - calculate the note at this fret
      // Each fret is one semitone, so transpose by semitones
      const openNote = standardTuning[stringIndex];
      const openChroma = Note.chroma(openNote);
      if (openChroma !== undefined) {
        // Calculate the chroma at this fret (add semitones and mod 12)
        const frettedChroma = (openChroma + fret) % 12;
        if (frettedChroma === rootChroma) {
          rootStrings.add(stringIndex);
        }
      }
    }
  }

  return rootStrings;
}

/**
 * Categorize each string by its interval relationship to the root.
 * Returns a map of string index to interval type (root, 3rd, 5th, 7th, etc.)
 */
function categorizeStringsByInterval(fingering: Fingering): Map<number, string> {
  const intervalMap = new Map<number, string>();
  const standardTuning = ['E', 'A', 'D', 'G', 'B', 'E'];
  const rootChroma = Note.chroma(fingering.root);

  if (rootChroma === undefined) return intervalMap;

  for (let stringIndex = 0; stringIndex < fingering.frets.length; stringIndex++) {
    const fret = fingering.frets[stringIndex];
    let noteChroma: number | undefined;

    if (fret === 0) {
      // Open string
      noteChroma = Note.chroma(standardTuning[stringIndex]);
    } else if (typeof fret === 'number' && fret > 0) {
      // Fretted note
      const openChroma = Note.chroma(standardTuning[stringIndex]);
      if (openChroma !== undefined) {
        noteChroma = (openChroma + fret) % 12;
      }
    }

    if (noteChroma !== undefined) {
      // Calculate interval from root
      const semitones = (noteChroma - rootChroma + 12) % 12;

      // Map semitones to interval names
      switch (semitones) {
        case 0:
          intervalMap.set(stringIndex, 'root');
          break;
        case 3:
        case 4:
          intervalMap.set(stringIndex, '3rd');
          break;
        case 7:
          intervalMap.set(stringIndex, '5th');
          break;
        case 10:
        case 11:
          intervalMap.set(stringIndex, '7th');
          break;
        default:
          intervalMap.set(stringIndex, 'other');
      }
    }
  }

  return intervalMap;
}

// ============================================================
// SVG GENERATION
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
 */
export function generateChordSVG(fingering: Fingering, options?: Partial<DiagramOptions>): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    const activeFrets = fingering.frets.filter((f): f is number => typeof f === 'number' && f > 0);
    const minFret = activeFrets.length > 0 ? Math.min(...activeFrets) : 1;
    const maxFret = activeFrets.length > 0 ? Math.max(...activeFrets) : 1;

    // Determine if this is an open position chord (fits within first 5 frets from nut)
    const isOpenPosition = maxFret <= opts.fretCount;
    const baseFret = isOpenPosition ? 1 : (fingering.baseFret || minFret);
    const displayFrets = opts.fretCount;

    const barres = detectBarres(fingering);
    const rootStrings = getRootStrings(fingering);
    const intervalMap = opts.colorByInterval ? categorizeStringsByInterval(fingering) : new Map();

    // Set up color scheme
    const colors = {
      root: opts.rootColor || TONIC_COLOR,
      '7th': opts.seventhColor || opts.rootColor || TONIC_COLOR,
      '3rd': opts.thirdColor || opts.color || DEFAULT_DOT_COLOR,
      '5th': opts.fifthColor || opts.color || DEFAULT_DOT_COLOR,
      other: opts.color || DEFAULT_DOT_COLOR,
    };

    // Helper to get color for a string
    const getStringColor = (stringIndex: number): string => {
      if (opts.colorByInterval) {
        const interval = intervalMap.get(stringIndex) || 'other';
        return colors[interval as keyof typeof colors] || colors.other;
      } else {
        // Default behavior: only color root notes
        return rootStrings.has(stringIndex) ? colors.root : colors.other;
      }
    };

    // Calculate dimensions
    const nutHeight = 8;
    const topMargin = 60;
    const fretboardWidth = STRING_SPACING * 5;
    const fretboardHeight = FRET_HEIGHT * displayFrets;

    const svgWidth = opts.width;
    const svgHeight = opts.height;

    // Start SVG
    let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}">`;
    svg += '<rect width="100%" height="100%" fill="#ffffff"/>';

    // Draw title
    svg += `<text x="${svgWidth / 2}" y="30" text-anchor="middle" font-size="24" font-weight="bold" fill="#333">${fingering.root}${fingering.type}</text>`;

    // Draw position marker only if NOT in open position
    if (!isOpenPosition && baseFret > 1) {
      svg += `<text x="${DIAGRAM_PADDING - 20}" y="${topMargin + FRET_HEIGHT / 2}" text-anchor="end" font-size="14" fill="#666">${baseFret}fr</text>`;
    }

    const startX = (svgWidth - fretboardWidth) / 2;
    const startY = topMargin;

    // Draw nut (thicker line for open position)
    if (baseFret === 1) {
      svg += `<rect x="${startX}" y="${startY}" width="${fretboardWidth}" height="${nutHeight}" fill="#333"/>`;
    }

    // Draw frets
    for (let i = 0; i <= displayFrets; i++) {
      const y = startY + (baseFret === 1 && i === 0 ? nutHeight : i * FRET_HEIGHT);
      const strokeWidth = i === 0 && baseFret > 1 ? 3 : 2;
      svg += `<line x1="${startX}" y1="${y}" x2="${startX + fretboardWidth}" y2="${y}" stroke="#333" stroke-width="${strokeWidth}"/>`;
    }

    // Draw strings
    for (let i = 0; i < 6; i++) {
      const x = startX + i * STRING_SPACING;
      svg += `<line x1="${x}" y1="${startY}" x2="${x}" y2="${startY + fretboardHeight}" stroke="#333" stroke-width="2"/>`;
    }

    // Draw open/muted indicators
    for (let i = 0; i < 6; i++) {
      const x = startX + i * STRING_SPACING;
      const y = startY - 20;
      const fret = fingering.frets[i];
      const stringColor = getStringColor(i);
      const isColored = stringColor !== colors.other;

      if (fret === 'x') {
        // Muted string (X)
        svg += `<text x="${x}" y="${y}" text-anchor="middle" font-size="18" font-weight="bold" fill="#999">×</text>`;
      } else if (fret === 0) {
        // Open string (O) - use interval color
        const strokeWidth = isColored ? 3 : 2;
        svg += `<circle cx="${x}" cy="${y}" r="${OPEN_CIRCLE_RADIUS}" fill="${isColored ? stringColor : 'none'}" stroke="${stringColor}" stroke-width="${strokeWidth}"/>`;
      }
    }

    // Draw barres
    for (const barre of barres) {
      const fretNum = baseFret > 1 ? barre.fret - baseFret + 1 : barre.fret;
      const y = startY + (baseFret === 1 ? nutHeight : 0) + (fretNum - 0.5) * FRET_HEIGHT;
      const x1 = startX + barre.fromString * STRING_SPACING;
      const x2 = startX + barre.toString * STRING_SPACING;

      // Determine barre color (use first string's interval color)
      const barreColor = getStringColor(barre.fromString);
      const barreWidth = x2 - x1;
      const barreHeight = DOT_RADIUS * 2;
      svg += `<rect x="${x1}" y="${y - DOT_RADIUS}" width="${barreWidth}" height="${barreHeight}" rx="${DOT_RADIUS}" fill="${barreColor}"/>`;

      // Draw finger number on barre if enabled
      if (opts.showFingers) {
        const barreCenterX = (x1 + x2) / 2;
        const finger = fingering.fingers[barre.fromString]; // Get finger used for barre
        if (finger > 0) {
          svg += `<text x="${barreCenterX}" y="${y + 5}" text-anchor="middle" font-size="14" font-weight="bold" fill="#fff">${finger}</text>`;
        }
      }
    }

    // Draw finger positions
    for (let i = 0; i < 6; i++) {
      const fret = fingering.frets[i];
      const finger = fingering.fingers[i];

      if (typeof fret === 'number' && fret > 0) {
        const fretNum = baseFret > 1 ? fret - baseFret + 1 : fret;

        // Skip if part of a barre
        const isInBarre = barres.some(b =>
          i >= b.fromString && i <= b.toString &&
          (baseFret > 1 ? fret - baseFret + 1 : fret) === (baseFret > 1 ? b.fret - baseFret + 1 : b.fret)
        );

        if (!isInBarre) {
          const x = startX + i * STRING_SPACING;
          const y = startY + (baseFret === 1 ? nutHeight : 0) + (fretNum - 0.5) * FRET_HEIGHT;

          // Draw dot - use interval-based color
          const dotColor = getStringColor(i);
          svg += `<circle cx="${x}" cy="${y}" r="${DOT_RADIUS}" fill="${dotColor}"/>`;

          // Draw finger number
          if (opts.showFingers && finger > 0) {
            svg += `<text x="${x}" y="${y + 5}" text-anchor="middle" font-size="14" font-weight="bold" fill="#fff">${finger}</text>`;
          }
        }
      }
    }

    svg += '</svg>';
    return svg;
  } catch (error) {
    console.error('Error generating chord diagram:', error);
    return generateErrorSVG(fingering, opts);
  }
}

/**
 * Generate error placeholder SVG when diagram generation fails.
 */
function generateErrorSVG(fingering: Fingering, options: Required<DiagramOptions>): string {
  const fretDisplay = fingering.frets
    .map((f, i) => `${i + 1}:${f === 'x' ? 'X' : f}`)
    .join(' ');

  return `
    <svg width="${options.width}" height="${options.height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f9f9f9" stroke="#999" stroke-width="2" rx="4"/>
      <text x="50%" y="30%" text-anchor="middle" font-size="18" font-weight="bold" fill="#333">
        ${fingering.root}${fingering.type}
      </text>
      <text x="50%" y="50%" text-anchor="middle" font-size="10" fill="#666">
        ${fretDisplay}
      </text>
      <text x="50%" y="70%" text-anchor="middle" font-size="9" fill="#aaa">
        Position: ${fingering.position || 'Open'}
      </text>
    </svg>
  `.trim();
}

/**
 * Generate SVG diagrams for multiple fingerings.
 */
export function generateMultipleChordSVGs(
  fingerings: Fingering[],
  options?: Partial<DiagramOptions>
): string[] {
  return fingerings.map(fingering => generateChordSVG(fingering, options));
}

/**
 * Generate a compact chord diagram.
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
 */
export function generateChordSVGWithNotes(fingering: Fingering, notes?: string[]): string {
  return generateChordSVG(fingering, {
    showNotes: true,
  });
}
