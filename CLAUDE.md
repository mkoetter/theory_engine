# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **music theory assistant component** designed to integrate into an existing Next.js/React/TypeScript application. The assistant helps users build chord progressions using music theory concepts like roman numeral analysis, borrowed chords, secondary dominants, and functional harmony.

**Key Design Principle**: This is a component library, not a full application. Avoid implementing authentication, routing, or other app-level concerns.

## Technology Stack

- **Framework**: Next.js (App Router assumed)
- **UI**: React, TypeScript
- **Music Theory**: Tonal.js library for chord/scale calculations
- **State Management**: Custom hooks (`useTheory`)
- **Performance**: Web Workers for theory calculations, memoization for expensive operations

## Architecture Overview

The codebase follows a **Roman-first data model**: chord progressions are stored as roman numerals (portable across keys) and rendered to absolute chord names on-demand.

### Directory Structure (Planned)

```
/app                    # Next.js app directory
/components/theory      # React components for theory UI
  TheoryPanel.tsx       # Main panel container
  CircleView.tsx        # Circle of fifths visualization
  PalettePanel.tsx      # Chord palette display
  ChordBuilder.tsx      # UI for building custom chords
  ProgressionTimeline.tsx  # Timeline showing progression
  TransitionPlanner.tsx    # Block-to-block transition UI

/lib/theory-core       # Pure functions, no React dependencies
  index.ts             # TheoryCore facade API
  palette.ts           # Generate diatonic chord palettes
  convert.ts           # Roman ↔ absolute conversion
  classify.ts          # Classify chord origin (diatonic/borrowed/etc)
  suggest.ts           # Suggest next chords based on context
  transition.ts        # Plan transitions between blocks
  tension.ts           # Calculate tension curves

/lib/workers
  theory.worker.ts     # Web Worker for heavy calculations

/state
  useTheory.ts         # Main React hook
  theory.types.ts      # TypeScript types
```

## Core Data Model

### Block
A musical section (Verse, Chorus, Bridge, etc.) with its own key and chord progression:
- `id`: Unique identifier
- `role`: "Intro" | "Verse" | "Pre" | "Chorus" | "Bridge" | "Outro"
- `key`: { tonic, mode, minorVariant? }
- `palette`: { source, includeSevenths, romans[], extras[] }
- `progression`: Array of { roman, bars, origin? }
- `renderCache`: Cached absolute chords with enharmonic policy

### Origin Tags
Chords are classified by origin:
- `diatonic`: From the key's scale
- `borrowed`: Modal interchange (e.g., ♭VI in major)
- `secondary`: Secondary dominants (V/ii, V/V, etc.)
- `chromatic-mediant`: Chromatic mediant relationships
- `custom`: User-defined non-diatonic chords

## TheoryCore API

The `TheoryCore` interface provides all music theory operations:

```typescript
buildPalette(key, opts): string[]
  // Generate diatonic chord palette for a key/mode

romansToAbsolute(tonic, romans, enharmonicPolicy): string[]
  // Convert roman numerals to absolute chord names

absoluteToRomans(tonic, chords): string[]
  // Convert absolute chords to romans

classifyChord(roman, key): { origin, quality }
  // Determine if chord is diatonic, borrowed, etc.

analyzeProgression(romans, key): { functions, cadenceHints, tension, ... }
  // Analyze: functional labels (T/SD/D), cadence detection, tension curve

suggestNext(contextRomans, key, style?): string[]
  // Suggest next chord based on progression context

planTransition(fromKey, toKey): TransitionPlan
  // Propose pivot chord or secondary dominant transitions
```

## Development Guidelines

### Tonal.js vs Custom Code
- Use Tonal.js for: chord parsing, scale generation, roman numeral conversion
- Implement custom: functional analysis, tension metrics, suggestion logic, cadence detection, MIDI export

### Data Flow
1. User edits progression in UI (romans)
2. Hook calls theory-core functions (pure)
3. Worker performs heavy calculations
4. Results memoized by (key, romans, policy)
5. UI renders with cached absolute chords

### Testing Approach
- **Unit tests** for all theory-core functions
- Snapshot tests for palette generation per key/mode
- Round-trip conversion tests (roman→absolute→roman)
- Component tests for palette and timeline interactions

## Implementation Milestones

**Milestone 1 (MVP)**: Basic palette generation, roman↔absolute conversion, persistence
**Milestone 2**: Borrowed/secondary chords, functional analysis, transition planner
**Milestone 3**: Enharmonic policies, minor variants, MIDI/chart export
**Milestone 4**: Full mode support, chord builder UI, role-based presets

## Key Constraints

- **Deterministic**: All theory functions must be pure (same input → same output)
- **Performance**: Memoize expensive calculations, debounce analysis calls
- **Type Safety**: Use strict TypeScript, no `any` types
- **Accessibility**: All UI components must support keyboard navigation
- **No Auth/Routing**: This is a component library for integration into existing apps

## Reference Documentation

See `docs/theory_assistant_plan.md` for complete functional specifications and data models.
