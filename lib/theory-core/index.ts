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

    // Placeholder implementations for Milestone 2
    analyzeProgression(romans: string[], key: BlockKey): ProgressionAnalysis {
      // TODO: Implement full functional analysis, tension curves, cadence detection
      return {
        functions: romans.map(() => 'T' as const), // Simplified
        cadenceHints: [],
        tension: [],
        borrowedCount: 0,
        secondaryCount: 0,
      };
    },

    suggestNext(
      ctxRomans: string[],
      key: BlockKey,
      style?: "pop" | "jazz" | "folk"
    ): string[] {
      // TODO: Implement context-aware suggestions
      // For now, return common progressions
      return ['IV', 'V', 'vi', 'I'];
    },

    planTransition(from: BlockKey, to: BlockKey): TransitionPlan {
      // TODO: Implement pivot chord and secondary dominant logic
      return {
        type: 'direct',
        chords: [],
        notes: 'Direct modulation (transition logic coming in Milestone 2)',
      };
    },
  };
}

// Export utility functions
export { buildPalette, romansToAbsolute, absoluteToRomans, parseRoman, classifyChord };
export type { BlockKey, ChordClassification, ProgressionAnalysis, TransitionPlan };
