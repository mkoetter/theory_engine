"use client";

import { useMemo, useCallback } from 'react';
import { createTheoryCore } from '@/lib/theory-core';
import type { Block, BlockKey } from './theory.types';

/**
 * React hook for accessing music theory operations.
 * Provides memoized theory functions for a given block.
 */
export function useTheory(block: Block) {
  // Create memoized theory core instance
  const theoryCore = useMemo(() => createTheoryCore(), []);

  // Memoize palette generation
  const palette = useMemo(() => {
    return theoryCore.buildPalette(block.key, {
      sevenths: block.palette.includeSevenths,
    });
  }, [theoryCore, block.key, block.palette.includeSevenths]);

  // Convert romans to absolute chords
  const romansToAbs = useCallback(
    (romans: string[]) => {
      return theoryCore.romansToAbsolute(
        block.key.tonic,
        romans,
        block.renderCache?.enharmonics || 'key-signature'
      );
    },
    [theoryCore, block.key.tonic, block.renderCache?.enharmonics]
  );

  // Convert absolute chords to romans
  const absToRomans = useCallback(
    (chords: string[]) => {
      return theoryCore.absoluteToRomans(block.key.tonic, chords);
    },
    [theoryCore, block.key.tonic]
  );

  // Analyze the current progression
  const analysis = useMemo(() => {
    const romans = block.progression.map((p) => p.roman);
    return theoryCore.analyzeProgression(romans, block.key);
  }, [theoryCore, block.progression, block.key]);

  // Suggest next chord based on context
  const suggestNext = useCallback(
    (style?: "pop" | "jazz" | "folk") => {
      const romans = block.progression.map((p) => p.roman);
      return theoryCore.suggestNext(romans, block.key, style);
    },
    [theoryCore, block.progression, block.key]
  );

  // Plan transition to another key
  const planTransition = useCallback(
    (toKey: BlockKey) => {
      return theoryCore.planTransition(block.key, toKey);
    },
    [theoryCore, block.key]
  );

  // Classify a chord
  const classifyChord = useCallback(
    (roman: string) => {
      return theoryCore.classifyChord(roman, block.key);
    },
    [theoryCore, block.key]
  );

  // Get absolute chords for current progression
  const absoluteChords = useMemo(() => {
    const romans = block.progression.map((p) => p.roman);
    return romansToAbs(romans);
  }, [block.progression, romansToAbs]);

  return {
    palette,
    romansToAbs,
    absToRomans,
    analysis,
    suggestNext,
    planTransition,
    classifyChord,
    absoluteChords,
  };
}
