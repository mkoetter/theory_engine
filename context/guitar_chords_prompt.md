# Guitar Chord Diagram Module Plan

## Module Architecture

Create a new `guitar-chords` module within `theory_engine/lib/theory-core/` with the following structure:

```
/lib/theory-core/guitar-chords/
  index.ts           # Main module exports
  types.ts           # TypeScript types for fingerings, voicings
  fingering-db.ts    # UCI dataset integration & lookup
  svg-generator.ts   # SVG diagram generation
  voicing-engine.ts  # Alternative voicing calculation
  chord-mapper.ts    # Maps Tonal chords to fingerings
```

## Core Implementation Steps

### 1. Set up TypeScript types (`types.ts`)

Define core interfaces for the guitar chord system:

```typescript
// Fingering representation
interface Fingering {
  root: string;           // "C", "D#", etc.
  type: string;           // "maj7", "m", "7", etc.
  frets: (number | 'x')[]; // [x, 3, 2, 0, 0, 0] - fret positions for E-A-D-G-B-E
  fingers: (number | 0)[]; // [0, 3, 2, 0, 0, 0] - finger numbers (0 = open)
  position?: number;       // Fret position (for barre chords)
  difficulty?: number;     // Playability score
  baseFret?: number;       // Starting fret for display
}

// Guitar chord with all voicings
interface GuitarChord {
  symbol: string;          // "Cmaj7"
  notes: string[];         // ["C", "E", "G", "B"]
  voicings: Fingering[];   // All available fingerings
}

// SVG generation options
interface DiagramOptions {
  width?: number;
  height?: number;
  fretCount?: number;
  showFingers?: boolean;
  showNotes?: boolean;
  style?: 'modern' | 'classic';
  color?: string;
}

// Voicing filter preferences
interface VoicingFilters {
  maxFret?: number;
  minFret?: number;
  openOnly?: boolean;
  barreOnly?: boolean;
  maxStretch?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}
```

### 2. Integrate UCI dataset (`fingering-db.ts`)

Load and index the UCI Guitar Chords dataset for efficient lookup:

```typescript
// Load UCI dataset
function loadFingeringDatabase(): Map<string, Fingering[]>

// Lookup functions
function findFingerings(root: string, type: string): Fingering[]
function findFingeringsBySymbol(chordSymbol: string): Fingering[]

// Enharmonic handling
function normalizeChordSymbol(symbol: string): string
// C# → Db, E# → F, etc.
```

**Data structure:**
- Index by `${root}_${type}` for O(1) lookup
- Handle enharmonic equivalents
- Support partial matching (fall back to simpler chord if exact match not found)

### 3. Create chord mapping pipeline (`chord-mapper.ts`)

Bridge Tonal.js chord data to guitar fingerings:

```typescript
import { Chord } from '@tonaljs/tonal';
import { findFingerings } from './fingering-db';

// Main mapping function
function mapChordToFingerings(chordSymbol: string): GuitarChord | null {
  // 1. Parse with Tonal
  const chord = Chord.get(chordSymbol);

  // 2. Extract root and type
  const { tonic, aliases, notes } = chord;

  // 3. Lookup fingerings
  const fingerings = findFingeringsBySymbol(chordSymbol);

  // 4. Return structured result
  return {
    symbol: chordSymbol,
    notes,
    voicings: fingerings
  };
}

// Handle edge cases
function handleEnharmonics(symbol: string): string[]
function fallbackToSimpler(chordType: string): string[]
// Cmaj13 → Cmaj9 → Cmaj7 → C
```

### 4. Build SVG generator (`svg-generator.ts`)

Generate scalable chord diagrams using SVGuitar:

```typescript
import { SVGuitarChord } from 'svguitar';

// Generate SVG string from fingering
function generateChordSVG(
  fingering: Fingering,
  options?: DiagramOptions
): string {
  const chart = new SVGuitarChord('#container');

  chart
    .configure({
      fretCount: options?.fretCount ?? 5,
      strings: 6,
      fretLabelPosition: 'left',
      style: options?.style ?? 'modern'
    })
    .chord({
      frets: fingering.frets,
      fingers: fingering.fingers,
      barres: detectBarres(fingering)
    });

  return chart.draw(); // Returns SVG string
}

// Detect barre chords
function detectBarres(fingering: Fingering): number[]

// Style customization
function applyCustomStyle(svg: string, options: DiagramOptions): string
```

### 5. Implement voicing engine (`voicing-engine.ts`)

Find and rank alternative chord voicings:

```typescript
// Get alternative voicings with filters
function findAlternativeVoicings(
  chordSymbol: string,
  filters?: VoicingFilters
): Fingering[] {
  const allVoicings = mapChordToFingerings(chordSymbol)?.voicings ?? [];

  return allVoicings
    .filter(v => matchesFilters(v, filters))
    .map(v => calculateDifficulty(v))
    .sort((a, b) => a.difficulty - b.difficulty);
}

// Calculate playability score
function calculateDifficulty(fingering: Fingering): number {
  // Consider: stretch, barre, muted strings, position
}

// Filter functions
function matchesFilters(fingering: Fingering, filters?: VoicingFilters): boolean
function isOpenVoicing(fingering: Fingering): boolean
function isBarreChord(fingering: Fingering): boolean
function calculateStretch(fingering: Fingering): number
```

### 6. Create main API (`index.ts`)

Export clean functional interface following TheoryCore patterns:

```typescript
// Main exports
export function getChordFingerings(chordSymbol: string): Fingering[] {
  return mapChordToFingerings(chordSymbol)?.voicings ?? [];
}

export function generateChordDiagram(
  chordSymbol: string,
  options?: DiagramOptions
): string | null {
  const fingerings = getChordFingerings(chordSymbol);
  if (fingerings.length === 0) return null;

  // Return first (most common) voicing by default
  return generateChordSVG(fingerings[0], options);
}

export function findAlternativeVoicings(
  chordSymbol: string,
  filters?: VoicingFilters
): Fingering[] {
  // Implemented in voicing-engine.ts
}

// Batch processing for progressions
export function generateProgressionDiagrams(
  chordSymbols: string[],
  options?: DiagramOptions
): string[] {
  return chordSymbols
    .map(symbol => generateChordDiagram(symbol, options))
    .filter(Boolean);
}

// Re-export types
export * from './types';
```

### 7. Add to TheoryCore facade

Extend main `theory-core/index.ts` to include guitar functionality:

```typescript
import * as GuitarChords from './guitar-chords';

export interface TheoryCore {
  // ... existing methods ...

  // New guitar chord methods
  getChordFingerings: typeof GuitarChords.getChordFingerings;
  generateChordDiagram: typeof GuitarChords.generateChordDiagram;
  findAlternativeVoicings: typeof GuitarChords.findAlternativeVoicings;
}

export function createTheoryCore(): TheoryCore {
  return {
    // ... existing implementations ...

    // Guitar chord methods
    getChordFingerings: GuitarChords.getChordFingerings,
    generateChordDiagram: GuitarChords.generateChordDiagram,
    findAlternativeVoicings: GuitarChords.findAlternativeVoicings,
  };
}
```

### 8. Create React component (`components/theory/ChordDiagram.tsx`)

Display chord diagrams in the UI:

```typescript
interface ChordDiagramProps {
  chordSymbol: string;
  options?: DiagramOptions;
  showAlternatives?: boolean;
  onVoicingSelect?: (fingering: Fingering) => void;
}

export function ChordDiagram({
  chordSymbol,
  options,
  showAlternatives = false,
  onVoicingSelect
}: ChordDiagramProps) {
  const theory = createTheoryCore();
  const [selectedVoicing, setSelectedVoicing] = useState<Fingering | null>(null);

  const fingerings = theory.getChordFingerings(chordSymbol);
  const svgString = selectedVoicing
    ? generateChordSVG(selectedVoicing, options)
    : theory.generateChordDiagram(chordSymbol, options);

  return (
    <div className="chord-diagram">
      <div dangerouslySetInnerHTML={{ __html: svgString }} />

      {showAlternatives && (
        <div className="voicing-selector">
          {fingerings.map((voicing, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedVoicing(voicing);
                onVoicingSelect?.(voicing);
              }}
            >
              Position {voicing.position ?? idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Dependencies to Install

```bash
npm install svguitar
```

## Data Integration

Place the UCI Guitar Chords dataset in:
```
/lib/theory-core/guitar-chords/data/
  fingerings.json
```

Expected format:
```json
[
  {
    "root": "C",
    "type": "maj7",
    "frets": ["x", 3, 2, 0, 0, 0],
    "fingers": [0, 3, 2, 0, 0, 0],
    "position": 3
  }
]
```

## Testing Strategy

### Unit Tests
```typescript
describe('guitar-chords', () => {
  test('getChordFingerings returns valid fingerings', () => {
    const fingerings = getChordFingerings('Cmaj7');
    expect(fingerings.length).toBeGreaterThan(0);
    expect(fingerings[0].frets).toHaveLength(6);
  });

  test('handles enharmonic equivalents', () => {
    const cSharp = getChordFingerings('C#');
    const dFlat = getChordFingerings('Db');
    expect(cSharp).toEqual(dFlat);
  });

  test('findAlternativeVoicings filters correctly', () => {
    const openOnly = findAlternativeVoicings('G', { openOnly: true });
    expect(openOnly.every(v => v.frets.includes(0))).toBe(true);
  });
});
```

### Integration Tests
```typescript
test('TheoryCore integration', () => {
  const theory = createTheoryCore();
  const key = { tonic: 'C', mode: 'major' };
  const palette = theory.buildPalette(key);
  const romans = theory.romansToAbsolute('C', palette);

  // Generate diagrams for entire palette
  romans.forEach(chord => {
    const svg = theory.generateChordDiagram(chord);
    expect(svg).toBeTruthy();
  });
});
```

## Usage Examples

### Basic usage
```typescript
import { createTheoryCore } from '@/lib/theory-core';

const theory = createTheoryCore();

// Get fingerings
const fingerings = theory.getChordFingerings('Cmaj7');
console.log(fingerings); // Array of Fingering objects

// Generate diagram
const svg = theory.generateChordDiagram('Cmaj7', {
  fretCount: 5,
  showFingers: true
});

// Find open voicings
const openVoicings = theory.findAlternativeVoicings('G', {
  openOnly: true
});
```

### Progression diagrams
```typescript
const romans = ['I', 'IV', 'V', 'I'];
const chords = theory.romansToAbsolute('C', romans);
const diagrams = chords.map(chord =>
  theory.generateChordDiagram(chord)
);
```

### React component
```tsx
import { ChordDiagram } from '@/components/theory/ChordDiagram';

function MyComponent() {
  return (
    <div>
      <ChordDiagram
        chordSymbol="Cmaj7"
        showAlternatives={true}
        options={{ fretCount: 5 }}
      />
    </div>
  );
}
```

## Design Principles

- **Pure functions**: All functions are stateless and deterministic
- **Type safety**: Comprehensive TypeScript types throughout
- **Performance**: Efficient lookups using Map/Set indexing
- **Extensibility**: Easy to add new datasets or rendering options
- **Integration**: Seamless with existing TheoryCore architecture
- **Fallback handling**: Graceful degradation when fingerings not found

## Future Enhancements

- Custom tunings (Drop D, DADGAD, etc.)
- Ukulele chord diagrams
- Bass guitar fingerings
- MIDI playback of voicings
- Machine learning for voicing recommendations based on user preference
- Chord transition difficulty analysis (for smooth progressions)
