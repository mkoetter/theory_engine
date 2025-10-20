# Theory Assistant Integration Plan (Next.js, React, TypeScript)

The theory assistant is a component that fits into an existing application based on next.js, react and typescript.  Avoid building out irrelevant details (authentication, etc) as this will be integrated into another tool.  

## What the Theory Assistant Does (Functional Capabilities)

### For each block (Verse/Chorus/Bridge...)

-   **Seed from Mode**: generate a diatonic chord palette for the
    block's key+mode (triads or 7ths; minor variant:
    natural/harmonic/melodic).
-   **Start from Scratch**: begin with an empty palette; add any chord
    via a builder (quality, extensions, inversion), with an origin tag:
    *diatonic / borrowed / secondary / chromatic mediant / custom*.
-   **Roman-first Progressions**: build the progression as Romans
    (portable), render absolute chords on demand (for display/export).
-   **Borrowed & Secondary Tools**: one-click inserts (♭VI, ♭VII, V/ii,
    etc.) with "why it works" hints.
-   **Function & Tension Guidance**: per-chord functional labels
    (T/SD/D) and a simple tension curve (distance from tonic + dominant
    weight + cadence proximity).
-   **Cadence Hints**: detect incomplete cadences (e.g., ends on V) and
    offer "resolve to I?" quick actions.

### Between blocks (transitions/arrangement)

-   **Transition Planner**: propose pivot-chord or secondary-dominant
    handoffs between adjacent blocks; insert 1--2 bar transition if
    accepted.
-   **Global Transposition**: change song tonic; Romans stay stable,
    absolute spellings update.

### Output & Integration

-   **Per-block MIDI Export**: render playable chord clips using your
    voicing engine.
-   **Chord Chart Export**: Roman + absolute chord charts per block.
-   **DAW Touchpoints**: export block markers, consolidated chord track
    if desired.

------------------------------------------------------------------------

## Where Tonal.js Fits vs. Your Code

  --------------------------------------------------------------------------------
  Area               Tonal.js provides                 You implement
  ------------------ --------------------------------- ---------------------------
  **Roman ↔ absolute `Progression.fromRomanNumerals` / Roman-first data model;
  conversion**       `toRomanNumerals`                 validation & error UX.

  **Keys             `Key.majorKey`, `Key.minorKey`    Mode-quality mapping, minor
  (major/minor)**    for scale notes and chords        variant policy.

  **Scales & modes** `Scale.get`, `Scale.scaleChords`  Filter practical chord
                                                       sets, enharmonic policy.

  **Chord parsing**  `Chord.get`, `ChordType`          Chord builder UI, origin
                                                       tagging, voicing presets.

  **Analysis /       ---                               Functional labeling,
  detection**                                          tension metric, cadence
                                                       detection.

  **Suggestions /    ---                               "Suggest next chord" and
  AI**                                                 transition planner logic.

  **MIDI/voicing**   ---                               Playback engine and export.
  --------------------------------------------------------------------------------

------------------------------------------------------------------------

## Requirements

### Functional

1.  Seed-from-mode & scratch workflows per block\
2.  Roman-first storage; absolute cache with consistent enharmonics\
3.  Borrowed/secondary insertion + classification\
4.  Functional labels (T/SD/D), cadence hints, tension curve\
5.  Transition planning across blocks\
6.  MIDI/chord chart export

### Non-functional

-   Deterministic, pure functions (testable)
-   Fast UI via Web Worker and memoization
-   Accessibility & extensibility
-   Type-safe interfaces

------------------------------------------------------------------------

## High-Level Architecture

    /app (Next.js)
    /components
      /theory
        TheoryPanel.tsx
        CircleView.tsx
        PalettePanel.tsx
        ChordBuilder.tsx
        ProgressionTimeline.tsx
        TransitionPlanner.tsx
    /lib
      /theory-core
        index.ts
        palette.ts
        convert.ts
        classify.ts
        suggest.ts
        transition.ts
        tension.ts
      /workers
        theory.worker.ts
    /state
      useTheory.ts
      theory.types.ts

------------------------------------------------------------------------

## Canonical Data Model (TypeScript)

``` ts
export type SectionRole = "Intro"|"Verse"|"Pre"|"Chorus"|"Bridge"|"Outro";

export interface BlockKey {
  tonic: string;
  mode: "major"|"minor"|"dorian"|"phrygian"|"lydian"|"mixolydian"|"aeolian"|"locrian";
  minorVariant?: "natural"|"harmonic"|"melodic";
}

export interface Block {
  id: string;
  role: SectionRole;
  key: BlockKey;
  palette: {
    source: "mode"|"scratch";
    includeSevenths: boolean;
    romans: string[];
    extras: string[];
  };
  progression: Array<{ roman: string; bars: number; origin?: OriginTag }>;
  renderCache?: { chords: string[]; enharmonics: "key-signature"|"flat"|"sharp" };
}

export type OriginTag = "diatonic"|"borrowed"|"secondary"|"chromatic-mediant"|"custom";

export interface TransitionPlan {
  type: "pivot"|"secondary"|"direct";
  chords: string[];
  notes: string;
}

export interface TensionPoint { bar: number; value: number; }
```

------------------------------------------------------------------------

## Theory Core (Facade API)

``` ts
export interface TheoryCore {
  buildPalette(key: BlockKey, opts:{sevenths:boolean}): string[];
  romansToAbsolute(tonic: string, romans: string[], enh:"key-signature"|"flat"|"sharp"): string[];
  absoluteToRomans(tonic: string, chords: string[]): string[];
  classifyChord(roman: string, key: BlockKey): { origin: OriginTag; quality: string };
  analyzeProgression(romans: string[], key: BlockKey): {
    functions: ("T"|"SD"|"D")[];
    cadenceHints: string[];
    tension: TensionPoint[];
    borrowedCount: number;
    secondaryCount: number;
  };
  suggestNext(ctxRomans: string[], key: BlockKey, style?: "pop"|"jazz"|"folk"): string[];
  planTransition(from: BlockKey, to: BlockKey): TransitionPlan;
}
```

------------------------------------------------------------------------

## React Integration

### Hook: `useTheory(block)`

``` tsx
"use client";
import { useTheory } from "@/state/useTheory";

export function TheoryPanel({ block }: { block: Block }) {
  const { palette, analysis, romansToAbs, suggestNext, planTransition } = useTheory(block);
  return (/* UI */);
}
```

------------------------------------------------------------------------

## Implementation Strategy

### Milestone 1 --- MVP

-   `theory-core`: buildPalette, roman↔absolute conversion
-   Hook + worker scaffold
-   PalettePanel + ProgressionTimeline
-   Persist Romans; backfill from existing chords

### Milestone 2 --- Theory Assist

-   Borrowed/secondary actions + classifyChord
-   Function labels, cadence hints, tension curve
-   Transition planner

### Milestone 3 --- Quality & Export

-   Enharmonics UI + cache
-   Minor variant toggle
-   MIDI/chord chart export

### Milestone 4 --- Polish

-   Full mode support
-   Scratch chord builder
-   Role-based presets (Verse/Chorus/Bridge)

------------------------------------------------------------------------

## Testing Plan

-   **Unit (theory-core)**
    -   Palette snapshots per key/mode\
    -   Round-trip conversion tests\
    -   Cadence and transition planner tests
-   **Component tests**
    -   Palette actions\
    -   Timeline interactions

------------------------------------------------------------------------

## Performance & UX

-   Memoize theory results by `(key, romans, policy)`
-   Debounce analysis calls
-   GPU-accelerated CircleView
-   Keep palettes short by default

------------------------------------------------------------------------

## Security & Persistence

-   Client-only Tonal usage
-   Persist Romans canonically; absolute chords cached
-   Validate all chord inputs
