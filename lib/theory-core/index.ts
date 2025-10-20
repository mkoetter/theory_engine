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
  buildPalette(key: BlockKey, opts: { sevenths: boolean }): string[];
  romansToAbsolute(tonic: string, romans: string[], enharmonic?: EnharmonicPolicy): string[];
  absoluteToRomans(tonic: string, chords: string[]): string[];
  classifyChord(roman: string, key: BlockKey): ChordClassification;
  analyzeProgression(romans: string[], key: BlockKey): ProgressionAnalysis;
  suggestNext(ctxRomans: string[], key: BlockKey, style?: "pop" | "jazz" | "folk"): string[];
  planTransition(from: BlockKey, to: BlockKey): TransitionPlan;
}

/**
 * Create a TheoryCore instance
 */
export function createTheoryCore(): TheoryCore {
  return {
    buildPalette,
    romansToAbsolute,
    absoluteToRomans,
    classifyChord,

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
export type { BlockKey, ChordClassification, ProgressionAnalysis, TransitionPlan };
