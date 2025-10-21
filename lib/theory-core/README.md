# Theory Core API

Pure JavaScript/TypeScript music theory engine with **NO React dependencies**.

## Architecture

This module provides a **stateless, functional API** for music theory operations. It's built on [Tonal.js](https://github.com/tonaljs/tonal) and extends it with custom harmonic analysis, functional harmony, and Circle of Fifths logic.

### Design Principles

1. **Pure Functions**: No side effects, all state passed explicitly
2. **Type-Safe**: Comprehensive TypeScript definitions
3. **Framework-Agnostic**: Can be used in React, Node.js, CLI, etc.
4. **Stateless**: Each function call is independent
5. **Well-Tested**: Comprehensive test coverage via Playwright

## Module Structure

```
lib/theory-core/
├── index.ts          # Main API facade & factory function
├── convert.ts        # Roman ↔ Absolute chord conversion
├── classify.ts       # Chord origin classification (diatonic/borrowed/secondary)
├── analysis.ts       # Functional analysis (T/SD/D) & cadence detection
├── tension.ts        # Harmonic tension calculation
├── transition.ts     # Key modulation planning
├── palette.ts        # Chord palette generation
└── circle.ts         # Circle of Fifths calculations
```

## Quick Start

### 1. Import and Create Instance

```typescript
import { createTheoryCore } from '@/lib/theory-core';

const theory = createTheoryCore();
```

### 2. Define a Key

```typescript
import type { BlockKey } from '@/state/theory.types';

const key: BlockKey = {
  tonic: 'C',
  mode: 'major'
};
```

### 3. Use the API

```typescript
// Get chord palette
const palette = theory.buildPalette(key, { sevenths: false });
// => ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']

// Analyze progression
const progression = ['I', 'IV', 'V', 'I'];
const analysis = theory.analyzeProgression(progression, key);
// => {
//   functions: ['T', 'SD', 'D', 'T'],
//   cadenceHints: ['Perfect Authentic Cadence (V → I)'],
//   tension: [0, 0.3, 0.7, 0],
//   borrowedCount: 0,
//   secondaryCount: 0
// }

// Get Circle of Fifths data
const circleData = theory.getCircleOfFifthsData(key);
// => { notes: [...], degrees: [...], chordQualities: [...], tonicPosition: 1 }
```

## Core Capabilities

### 1. Chord Palette Generation

Build diatonic chord sets for any key/mode:

```typescript
// Major scale triads
theory.buildPalette({ tonic: 'C', mode: 'major' }, { sevenths: false });
// => ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']

// Dorian mode with 7th chords
theory.buildPalette({ tonic: 'D', mode: 'dorian' }, { sevenths: true });
// => ['im7', 'ii7', 'bIIImaj7', 'IV7', 'vm7', 'vi°7', 'bVIImaj7']

// Natural minor triads
theory.buildPalette({ tonic: 'A', mode: 'minor' }, { sevenths: false });
// => ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']
```

Supports all 7 modes: Lydian, Major/Ionian, Mixolydian, Dorian, Minor/Aeolian, Phrygian, Locrian.

### 2. Chord Conversion

#### Roman → Absolute

```typescript
theory.romansToAbsolute('C', ['I', 'IV', 'V', 'I']);
// => ['C', 'F', 'G', 'C']

theory.romansToAbsolute('G', ['ii7', 'V7', 'Imaj7']);
// => ['Am7', 'D7', 'Gmaj7']
```

#### Absolute → Roman

```typescript
theory.absoluteToRomans('C', ['C', 'F', 'G', 'C']);
// => ['I', 'IV', 'V', 'I']

theory.absoluteToRomans('D', ['Em', 'A', 'D']);
// => ['ii', 'V', 'I']
```

### 3. Chord Classification

Determine origin and function of any chord:

```typescript
// Diatonic chord
theory.classifyChord('IV', { tonic: 'C', mode: 'major' });
// => {
//   origin: 'diatonic',
//   degree: 4,
//   quality: 'major',
//   description: 'Diatonic to C major'
// }

// Borrowed chord (modal interchange)
theory.classifyChord('bVI', { tonic: 'C', mode: 'major' });
// => {
//   origin: 'borrowed',
//   degree: 6,
//   quality: 'major',
//   fromMode: 'minor',
//   description: 'Borrowed from C minor'
// }

// Secondary dominant
theory.classifyChord('V/V', { tonic: 'C', mode: 'major' });
// => {
//   origin: 'secondary',
//   degree: 5,
//   quality: 'dominant',
//   toChord: 'V',
//   description: 'Secondary dominant to V'
// }
```

### 4. Progression Analysis

Comprehensive harmonic analysis:

```typescript
const analysis = theory.analyzeProgression(
  ['I', 'vi', 'IV', 'V'],
  { tonic: 'C', mode: 'major' }
);

console.log(analysis);
// {
//   functions: ['T', 'T', 'SD', 'D'],          // Functional labels
//   cadenceHints: [
//     'Authentic cadence: V resolves to I (strong)'
//   ],
//   tension: [0, 0.2, 0.3, 0.7],              // 0-1 scale
//   borrowedCount: 0,                          // Modal interchange
//   secondaryCount: 0                          // Secondary dominants
// }
```

**Functional Labels:**
- `T` = Tonic (stable, home)
- `SD` = Subdominant (mild tension)
- `D` = Dominant (high tension, wants to resolve)

**Cadence Types:**
- Perfect Authentic Cadence (PAC): V → I with tonic in soprano
- Imperfect Authentic Cadence (IAC): V → I without PAC criteria
- Half Cadence: ends on V
- Plagal Cadence: IV → I ("Amen" cadence)
- Deceptive Cadence: V → vi (or other non-tonic)

### 5. Context-Aware Suggestions

Get smart chord suggestions based on current progression:

```typescript
// Starting progression
theory.suggestNext([], { tonic: 'C', mode: 'major' });
// => ['I', 'IV', 'V', 'vi']  // Common starting chords

// After tonic
theory.suggestNext(['I'], { tonic: 'C', mode: 'major' });
// => ['IV', 'ii', 'V', 'vi']  // Move to subdominant or dominant

// After dominant
theory.suggestNext(['I', 'IV', 'V'], { tonic: 'C', mode: 'major' });
// => ['I', 'vi', 'IV']  // Resolve to tonic or deceptive cadence
```

### 6. Key Modulation Planning

Plan transitions between keys:

```typescript
const plan = theory.planTransition(
  { tonic: 'C', mode: 'major' },
  { tonic: 'G', mode: 'major' }
);

console.log(plan);
// {
//   relationship: 'closely-related',
//   method: 'common-chord',
//   commonChords: ['C', 'Em', 'G', 'Am'],
//   suggestion: 'Use Em as pivot chord (iii in C, vi in G)'
// }
```

**Relationship Types:**
- `same`: Same key
- `relative`: Relative major/minor (e.g., C major ↔ A minor)
- `parallel`: Same tonic, different mode (e.g., C major ↔ C minor)
- `closely-related`: Differ by ≤1 accidental
- `distant`: Differ by >1 accidental

### 7. Circle of Fifths

Complete data for Circle of Fifths visualizations:

```typescript
const circleData = theory.getCircleOfFifthsData({
  tonic: 'C',
  mode: 'major'
});

// All 12 chromatic notes with diatonic flags
circleData.notes.forEach(({ note, position, isDiatonic }) => {
  console.log(`${note} at position ${position}: ${isDiatonic ? 'diatonic' : 'chromatic'}`);
});
// F at position 0: diatonic
// C at position 1: diatonic
// G at position 2: diatonic
// ...
// F# at position 7: chromatic

// 7 scale degrees with Roman numerals
circleData.degrees.forEach(({ position, roman, isTonic }) => {
  console.log(`${roman} at position ${position}${isTonic ? ' (TONIC)' : ''}`);
});
// I at position 1 (TONIC)
// ii at position 3
// iii at position 5
// ...

// 7 chord qualities
circleData.chordQualities.forEach(({ position, quality }) => {
  console.log(`${quality} chord at position ${position}`);
});
// major chord at position 0  (IV)
// major chord at position 1  (I)
// major chord at position 2  (V)
// minor chord at position 3  (ii)
// ...
```

## Advanced Usage

### Working with Modes

All 7 modes are fully supported:

```typescript
const modes = [
  'lydian',      // Brightest (major with raised 4th)
  'major',       // Standard major
  'mixolydian',  // Major with flatted 7th
  'dorian',      // Minor with raised 6th
  'minor',       // Natural minor / Aeolian
  'phrygian',    // Minor with flatted 2nd
  'locrian'      // Darkest (diminished tonic)
];

modes.forEach(mode => {
  const key = { tonic: 'D', mode };
  const palette = theory.buildPalette(key, { sevenths: false });
  console.log(`${mode}: ${palette.join(', ')}`);
});
```

### Harmonic Minor & Melodic Minor

```typescript
// Harmonic minor (raised 7th)
const harmonicKey: BlockKey = {
  tonic: 'A',
  mode: 'minor',
  minorVariant: 'harmonic'
};
theory.buildPalette(harmonicKey, { sevenths: false });
// => ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°']

// Melodic minor (raised 6th and 7th)
const melodicKey: BlockKey = {
  tonic: 'A',
  mode: 'minor',
  minorVariant: 'melodic'
};
theory.buildPalette(melodicKey, { sevenths: false });
// => ['i', 'ii', 'III+', 'IV', 'V', 'vi°', 'vii°']
```

### Enharmonic Spellings

Control sharp/flat preference:

```typescript
// Use key signature (default)
theory.romansToAbsolute('F#', ['I', 'IV', 'V'], 'key-signature');
// => ['F#', 'B', 'C#']

// Force flats
theory.romansToAbsolute('F#', ['I', 'IV', 'V'], 'flat');
// => ['Gb', 'Cb', 'Db']

// Force sharps
theory.romansToAbsolute('Gb', ['I', 'IV', 'V'], 'sharp');
// => ['F#', 'B', 'C#']
```

## Integration Examples

### React Hook (useTheory)

```typescript
// state/useTheory.ts
import { useMemo } from 'react';
import { createTheoryCore } from '@/lib/theory-core';

export function useTheory(block: Block) {
  const theoryCore = useMemo(() => createTheoryCore(), []);

  const palette = useMemo(
    () => theoryCore.buildPalette(block.key, { sevenths: block.sevenths }),
    [theoryCore, block.key, block.sevenths]
  );

  // ... more memoized values

  return { palette, theoryCore, /* ... */ };
}
```

### Node.js CLI Tool

```typescript
// cli-tool.ts
import { createTheoryCore } from './lib/theory-core';

const theory = createTheoryCore();

const key = { tonic: 'G', mode: 'major' };
const progression = ['I', 'V', 'vi', 'IV'];

console.log('Analyzing progression:', progression.join(' - '));

const analysis = theory.analyzeProgression(progression, key);
console.log('Functions:', analysis.functions.join(', '));
console.log('Cadences:', analysis.cadenceHints.join(', '));

const chords = theory.romansToAbsolute(key.tonic, progression);
console.log('Absolute chords:', chords.join(', '));
```

### REST API Endpoint

```typescript
// api/analyze.ts
import { createTheoryCore } from '@/lib/theory-core';

export async function POST(request: Request) {
  const { key, progression } = await request.json();

  const theory = createTheoryCore();
  const analysis = theory.analyzeProgression(progression, key);

  return Response.json({ analysis });
}
```

## Type Definitions

All types are defined in `/state/theory.types.ts`:

```typescript
// Core types
type BlockKey = {
  tonic: string;              // 'C', 'F#', 'Bb', etc.
  mode: 'major' | 'minor' | 'dorian' | ...;
  minorVariant?: 'natural' | 'harmonic' | 'melodic';
};

type ChordClassification = {
  origin: 'diatonic' | 'borrowed' | 'secondary' | 'chromatic-mediant';
  degree: number;
  quality: ChordQuality;
  description: string;
  fromMode?: string;          // For borrowed chords
  toChord?: string;           // For secondary dominants
};

type ProgressionAnalysis = {
  functions: FunctionLabel[];  // ['T', 'SD', 'D', ...]
  cadenceHints: string[];
  tension: number[];           // [0-1 values]
  borrowedCount: number;
  secondaryCount: number;
};

type CircleOfFifthsData = {
  notes: CircleNote[];         // All 12 notes
  degrees: CircleDegree[];     // 7 scale degrees
  chordQualities: CircleChordQuality[];  // 7 qualities
  tonicPosition: number;       // 0-11
};
```

## Testing

All theory engine functions are tested via Playwright end-to-end tests:

```bash
# Run all tests
npm test

# Run Circle of Fifths tests
npx playwright test test-circle.spec.ts

# Run in UI mode
npx playwright test --ui
```

## Contributing

When adding new features:

1. **Keep it pure**: No side effects, no React dependencies
2. **Add JSDoc**: Document parameters, return types, and examples
3. **Update types**: Add new types to `theory.types.ts`
4. **Export from index**: Add to the `TheoryCore` interface
5. **Write tests**: Add Playwright tests for new functionality

## References

- [Tonal.js Documentation](https://github.com/tonaljs/tonal)
- [Music Theory: Functional Harmony](https://en.wikipedia.org/wiki/Function_(music))
- [Circle of Fifths](https://en.wikipedia.org/wiki/Circle_of_fifths)
- [Modal Interchange](https://en.wikipedia.org/wiki/Borrowed_chord)

---

**Theory Engine** • Built with Tonal.js • MIT License
