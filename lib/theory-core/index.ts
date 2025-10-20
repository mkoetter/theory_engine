/**
 * TheoryCore - Music Theory Engine using Tonal.js
 *
 * This module provides a facade API for all music theory operations.
 * It wraps Tonal.js and adds custom logic for functional analysis,
 * chord classification, and progression suggestions.
 */

import { buildPalette } from './palette';
import { romansToAbsolute, absoluteToRomans, parseRoman } from './convert';
import { classifyChord } from './classify';
import { analyzeFunctionalLabel, detectCadences } from './analysis';
import { calculateTensionCurve } from './tension';
import { planTransition as planKeyTransition } from './transition';
import {
  getDiatonicNotes,
  getScaleDegrees,
  getChordQualities,
  rotateCircle,
  areEnharmonic,
  getCircleData,
  type CircleData,
  CIRCLE_OF_FIFTHS_ORDER,
  MODE_ORDER,
  getClassicKeySignatures
} from './circle';
import type {
  BlockKey,
  ChordClassification,
  ProgressionAnalysis,
  TransitionPlan,
} from '@/state/theory.types';

export type EnharmonicPolicy = "key-signature" | "flat" | "sharp";

/**
 * TheoryCore API - Main interface for music theory operations
 */
export interface TheoryCore {
  // Palette and progression
  buildPalette(key: BlockKey, opts: { sevenths: boolean }): string[];
  romansToAbsolute(tonic: string, romans: string[], enharmonic?: EnharmonicPolicy): string[];
  absoluteToRomans(tonic: string, chords: string[]): string[];
  classifyChord(roman: string, key: BlockKey): ChordClassification;
  analyzeProgression(romans: string[], key: BlockKey): ProgressionAnalysis;
  suggestNext(ctxRomans: string[], key: BlockKey, style?: "pop" | "jazz" | "folk"): string[];
  planTransition(from: BlockKey, to: BlockKey): TransitionPlan;

  // Circle of Fifths
  getDiatonicNotes(key: BlockKey): string[];
  getScaleDegrees(key: BlockKey): Array<{ note: string; roman: string; degree: number }>;
  getChordQualities(key: BlockKey): Array<{ note: string; quality: string; symbol: string }>;
  rotateCircle(key: BlockKey, direction: 'clockwise' | 'counterclockwise', rotateBy: 'tonic' | 'mode'): BlockKey;
  areEnharmonic(key1: BlockKey, key2: BlockKey): boolean;
  getCircleData(key: BlockKey): CircleData;
}

/**
 * Create a TheoryCore instance
 */
export function createTheoryCore(): TheoryCore {
  return {
    // Palette and progression
    buildPalette,
    romansToAbsolute,
    absoluteToRomans,
    classifyChord,

    // Circle of Fifths
    getDiatonicNotes,
    getScaleDegrees,
    getChordQualities,
    rotateCircle,
    areEnharmonic,
    getCircleData,

    // Full implementations for Milestone 2
    analyzeProgression(romans: string[], key: BlockKey): ProgressionAnalysis {
      // Analyze functional labels for each chord
      const functions = romans.map(roman => analyzeFunctionalLabel(roman, key));

      // Detect cadences
      const cadenceHints = detectCadences(romans, key);

      // Calculate tension curve
      const tension = calculateTensionCurve(romans, key);

      // Count borrowed and secondary chords
      let borrowedCount = 0;
      let secondaryCount = 0;

      romans.forEach(roman => {
        const classification = classifyChord(roman, key);
        if (classification.origin === 'borrowed') borrowedCount++;
        if (classification.origin === 'secondary') secondaryCount++;
      });

      return {
        functions,
        cadenceHints,
        tension,
        borrowedCount,
        secondaryCount,
      };
    },

    suggestNext(
      ctxRomans: string[],
      key: BlockKey,
      style?: "pop" | "jazz" | "folk"
    ): string[] {
      // Context-aware suggestions based on last chord
      if (ctxRomans.length === 0) {
        return key.mode === 'major' ? ['I', 'IV', 'V', 'vi'] : ['i', 'iv', 'v', 'VI'];
      }

      const lastChord = ctxRomans[ctxRomans.length - 1];
      const lastFunc = analyzeFunctionalLabel(lastChord, key);

      // Suggest based on functional progression
      if (lastFunc === 'T') {
        // From tonic, go to subdominant or dominant
        return key.mode === 'major' ? ['IV', 'ii', 'V', 'vi'] : ['iv', 'ii°', 'V', 'VI'];
      }

      if (lastFunc === 'SD') {
        // From subdominant, go to dominant or tonic
        return key.mode === 'major' ? ['V', 'I', 'vi'] : ['V', 'i', 'VI'];
      }

      if (lastFunc === 'D') {
        // From dominant, resolve to tonic or deceptive cadence
        return key.mode === 'major' ? ['I', 'vi', 'IV'] : ['i', 'VI', 'iv'];
      }

      return key.mode === 'major' ? ['I', 'IV', 'V', 'vi'] : ['i', 'iv', 'V', 'VI'];
    },

    planTransition(from: BlockKey, to: BlockKey): TransitionPlan {
      return planKeyTransition(from, to);
    },
  };
}

// Export utility functions
export { buildPalette, romansToAbsolute, absoluteToRomans, parseRoman, classifyChord };
export {
  getDiatonicNotes,
  getScaleDegrees,
  getChordQualities,
  rotateCircle,
  areEnharmonic,
  getCircleData,
  CIRCLE_OF_FIFTHS_ORDER,
  MODE_ORDER,
  getClassicKeySignatures
};
export type { BlockKey, ChordClassification, ProgressionAnalysis, TransitionPlan, CircleData };
