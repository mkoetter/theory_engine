# Theory Engine Architecture

## Overview

The Theory Engine is a music theory analysis and visualization application built with Next.js, React, TypeScript, and Tonal.js. It features a **clean three-layer architecture** that strictly separates business logic from UI concerns.

## Core Design Principles

### 1. Separation of Concerns

The codebase is organized into three distinct layers:

```
┌─────────────────────────────────────┐
│   UI Layer (React Components)       │  ← Presentation only
│   /components/theory/*.tsx           │
│   /app/*.tsx                         │
└─────────────────────────────────────┘
              ↓ uses
┌─────────────────────────────────────┐
│   Bridge Layer (React Hooks)        │  ← React optimization
│   /state/useTheory.ts                │
└─────────────────────────────────────┘
              ↓ wraps
┌─────────────────────────────────────┐
│   Core Layer (Pure Functions)       │  ← Business logic
│   /lib/theory-core/*.ts              │  ← NO React deps
└─────────────────────────────────────┘
```

### 2. Pure Functional API

The core theory engine (`/lib/theory-core/`) is:
- **Framework-agnostic**: No React, no DOM, no browser APIs
- **Stateless**: Every function receives complete context as parameters
- **Pure**: No side effects, deterministic outputs
- **Type-safe**: Comprehensive TypeScript definitions
- **Testable**: Can be tested independently of UI

### 3. Unidirectional Data Flow

```
User Action
    ↓
UI Component (state change)
    ↓
useTheory Hook (memoization)
    ↓
Theory Core API (computation)
    ↓
Results (flow back up)
    ↓
UI Component (render)
```

## Directory Structure

```
theory_engine/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Main theory assistant page
│   ├── circle/page.tsx           # Circle of Fifths page
│   └── layout.tsx                # Root layout
│
├── components/theory/            # React UI components (presentation)
│   ├── TheoryPanel.tsx           # Main container (state management)
│   ├── PalettePanel.tsx          # Chord palette display
│   ├── ProgressionTimeline.tsx   # Progression visualization
│   ├── CircleView.tsx            # Circle of Fifths SVG renderer
│   ├── TonicTable.tsx            # Tonic selector
│   ├── ModeTable.tsx             # Mode selector
│   └── index.ts                  # Barrel export
│
├── state/                        # State management & React integration
│   ├── useTheory.ts              # React hook (thin wrapper)
│   └── theory.types.ts           # TypeScript definitions
│
├── lib/theory-core/              # Core theory engine (pure functions)
│   ├── index.ts                  # Main API facade
│   ├── convert.ts                # Roman ↔ Absolute conversion
│   ├── classify.ts               # Chord classification
│   ├── analysis.ts               # Functional analysis & cadences
│   ├── tension.ts                # Tension curve calculation
│   ├── transition.ts             # Key modulation planning
│   ├── palette.ts                # Chord palette generation
│   ├── circle.ts                 # Circle of Fifths logic
│   └── README.md                 # API documentation
│
└── test-circle.spec.ts           # Playwright E2E tests
```

## Layer Details

### Core Layer: `/lib/theory-core/`

**Purpose**: Pure music theory business logic

**Key Characteristics**:
- ✅ Pure TypeScript functions
- ✅ No React dependencies
- ✅ No DOM manipulation
- ✅ Stateless API
- ✅ Uses Tonal.js for primitives
- ✅ Fully testable in isolation

**API Surface**:
```typescript
const theory = createTheoryCore();

// Chord operations
theory.buildPalette(key, opts)
theory.romansToAbsolute(tonic, romans)
theory.absoluteToRomans(tonic, chords)
theory.classifyChord(roman, key)

// Analysis operations
theory.analyzeProgression(romans, key)
theory.suggestNext(context, key, style)
theory.planTransition(fromKey, toKey)

// Circle of Fifths operations
theory.getCircleOfFifthsData(key)
theory.getDiatonicNotes(key)
theory.getScaleDegrees(key)
theory.getChordQualities(key)
```

**Documentation**: See `/lib/theory-core/README.md`

### Bridge Layer: `/state/useTheory.ts`

**Purpose**: React integration with performance optimization

**Key Characteristics**:
- ✅ Thin wrapper around theory-core
- ✅ NO business logic
- ✅ Only adds React-specific features:
  - `useMemo` for expensive computations
  - `useCallback` for function stability
- ✅ Makes theory-core convenient for React

**Example**:
```typescript
export function useTheory(block: Block) {
  const theoryCore = useMemo(() => createTheoryCore(), []);

  const palette = useMemo(
    () => theoryCore.buildPalette(block.key, { sevenths: block.palette.includeSevenths }),
    [theoryCore, block.key, block.palette.includeSevenths]
  );

  return { palette, /* ... */ };
}
```

### UI Layer: `/components/theory/` & `/app/`

**Purpose**: Visual presentation and user interaction

**Key Characteristics**:
- ✅ React components only
- ✅ NO business logic (delegates to useTheory/theory-core)
- ✅ Manages local UI state (selected items, open/closed, etc.)
- ✅ Renders data from theory-core
- ✅ Handles user events (clicks, inputs)

**Example**:
```typescript
export function TheoryPanel({ initialBlock }: TheoryPanelProps) {
  const [block, setBlock] = useState<Block>(initialBlock);
  const { palette, analysis, classifyChord } = useTheory(block);  // ← Uses hook

  const handleAddChord = (roman: string) => {  // ← UI logic only
    setBlock(prev => ({
      ...prev,
      progression: [...prev.progression, { roman, bars: 1, origin: classifyChord(roman).origin }]
    }));
  };

  return (
    <div>
      <PalettePanel chords={palette} onAddChord={handleAddChord} />
      <ProgressionTimeline progression={block.progression} analysis={analysis} />
    </div>
  );
}
```

## Data Flow Example

### Scenario: User adds a chord to progression

```
1. User clicks "IV" button in PalettePanel
   ↓
2. onClick handler calls onAddChord('IV')
   ↓
3. TheoryPanel's handleAddChord runs:
   - Calls classifyChord('IV') via useTheory hook
     ↓
   - Hook calls theoryCore.classifyChord('IV', key)
     ↓
   - Core returns { origin: 'diatonic', ... }
   - Updates block state with new chord
   ↓
4. React re-renders with new state
   ↓
5. useTheory runs with updated block
   - Memoization prevents unnecessary recomputation
   - analyzeProgression runs with new progression
   ↓
6. UI updates with new chord and analysis
```

## Type System

All types are centralized in `/state/theory.types.ts`:

### Core Types

```typescript
// Musical key definition
type BlockKey = {
  tonic: string;              // 'C', 'F#', 'Bb'
  mode: Mode;                 // 'major', 'minor', 'dorian', etc.
  minorVariant?: MinorVariant;
};

// Application state
type Block = {
  key: BlockKey;
  progression: BlockChord[];
  palette: PaletteOptions;
  // ...
};
```

### Analysis Types

```typescript
type ChordClassification = {
  origin: 'diatonic' | 'borrowed' | 'secondary' | 'chromatic-mediant';
  degree: number;
  quality: ChordQuality;
  description: string;
  // ...
};

type ProgressionAnalysis = {
  functions: FunctionLabel[];  // ['T', 'SD', 'D', ...]
  cadenceHints: string[];
  tension: number[];
  borrowedCount: number;
  secondaryCount: number;
};
```

### Circle of Fifths Types

```typescript
type CircleNote = {
  note: string;
  position: number;    // 0-11
  isDiatonic: boolean;
};

type CircleDegree = {
  position: number;
  roman: string;
  isTonic: boolean;
};

type CircleChordQuality = {
  position: number;
  quality: ChordQuality;
};
```

## Adding New Features

Follow this pattern when adding functionality:

### 1. Add Core Logic First

```typescript
// lib/theory-core/myfeature.ts
export function analyzeMyFeature(input: string): Result {
  // Pure function implementation
  // Uses Tonal.js for music primitives
  return { /* result */ };
}
```

### 2. Export from API Facade

```typescript
// lib/theory-core/index.ts
import { analyzeMyFeature } from './myfeature';

export interface TheoryCore {
  // ... existing methods
  analyzeMyFeature(input: string): Result;
}

export function createTheoryCore(): TheoryCore {
  return {
    // ... existing methods
    analyzeMyFeature,
  };
}
```

### 3. Add to React Hook (if needed)

```typescript
// state/useTheory.ts
export function useTheory(block: Block) {
  const theoryCore = useMemo(() => createTheoryCore(), []);

  const myFeature = useMemo(
    () => theoryCore.analyzeMyFeature(block.someProperty),
    [theoryCore, block.someProperty]
  );

  return {
    // ... existing values
    myFeature,
  };
}
```

### 4. Use in UI Component

```typescript
// components/theory/MyComponent.tsx
export function MyComponent({ block }: Props) {
  const { myFeature } = useTheory(block);

  return <div>{myFeature.result}</div>;
}
```

## Testing Strategy

### Unit Testing (Theory Core)

Test pure functions directly:

```typescript
import { analyzeMyFeature } from '@/lib/theory-core/myfeature';

test('analyzes feature correctly', () => {
  const result = analyzeMyFeature('input');
  expect(result).toEqual({ /* expected */ });
});
```

### Integration Testing (Playwright)

Test full application flow:

```typescript
test('user can add chord to progression', async ({ page }) => {
  await page.goto('/');
  await page.getByText('IV').click();

  const progression = await page.locator('.progression');
  await expect(progression).toContainText('IV');
});
```

## Performance Considerations

### Memoization Strategy

The `useTheory` hook uses React's memoization to prevent unnecessary recomputation:

```typescript
// Only recomputes when key or palette options change
const palette = useMemo(
  () => theoryCore.buildPalette(block.key, { sevenths: block.palette.includeSevenths }),
  [theoryCore, block.key, block.palette.includeSevenths]
);

// Only recomputes when progression changes
const analysis = useMemo(
  () => theoryCore.analyzeProgression(block.progression.map(p => p.roman), block.key),
  [theoryCore, block.progression, block.key]
);
```

### Avoiding Props Drilling

Use composition and React Context if needed (not yet implemented):

```typescript
// Potential future pattern
const TheoryContext = createContext<ReturnType<typeof useTheory>>();

function TheoryProvider({ block, children }: Props) {
  const theory = useTheory(block);
  return <TheoryContext.Provider value={theory}>{children}</TheoryContext.Provider>;
}
```

## Extending to Other Platforms

The architecture makes it easy to use theory-core in other contexts:

### Node.js CLI

```typescript
#!/usr/bin/env node
import { createTheoryCore } from './lib/theory-core';

const theory = createTheoryCore();
const key = { tonic: process.argv[2], mode: 'major' };
const palette = theory.buildPalette(key, { sevenths: false });

console.log(`Chords in ${key.tonic} ${key.mode}:`, palette.join(', '));
```

### REST API

```typescript
// api/analyze/route.ts
import { createTheoryCore } from '@/lib/theory-core';

export async function POST(request: Request) {
  const { key, progression } = await request.json();

  const theory = createTheoryCore();
  const analysis = theory.analyzeProgression(progression, key);

  return Response.json({ analysis });
}
```

### WebSocket Server

```typescript
import { WebSocketServer } from 'ws';
import { createTheoryCore } from './lib/theory-core';

const wss = new WebSocketServer({ port: 8080 });
const theory = createTheoryCore();

wss.on('connection', ws => {
  ws.on('message', data => {
    const { command, payload } = JSON.parse(data);

    if (command === 'analyze') {
      const result = theory.analyzeProgression(payload.progression, payload.key);
      ws.send(JSON.stringify({ result }));
    }
  });
});
```

## Common Patterns

### Pattern 1: Derived State

Always derive state from theory-core rather than storing analysis results:

```typescript
// ✅ Good: Derive from source of truth
function Component({ block }: Props) {
  const { analysis } = useTheory(block);  // Recomputes when block changes
  return <div>{analysis.functions.join(', ')}</div>;
}

// ❌ Bad: Storing derived state
function Component({ block }: Props) {
  const [analysis, setAnalysis] = useState(null);  // Can get out of sync
  useEffect(() => {
    const theory = createTheoryCore();
    setAnalysis(theory.analyzeProgression(/* ... */));
  }, [block]);
  return <div>{analysis?.functions.join(', ')}</div>;
}
```

### Pattern 2: Event Handlers

Keep event handlers in parent components, pass as props:

```typescript
// ✅ Good: Handler in parent
function Parent() {
  const [progression, setProgression] = useState([]);

  const handleAdd = (chord: string) => {
    setProgression(prev => [...prev, chord]);
  };

  return <Child onAdd={handleAdd} />;
}

function Child({ onAdd }: Props) {
  return <button onClick={() => onAdd('IV')}>Add IV</button>;
}
```

### Pattern 3: Conditional Rendering

Use early returns for loading/error states:

```typescript
function Component({ block }: Props) {
  if (!block) {
    return <LoadingSpinner />;
  }

  const { palette, analysis } = useTheory(block);

  if (palette.length === 0) {
    return <EmptyState />;
  }

  return <MainContent palette={palette} analysis={analysis} />;
}
```

## Dependencies

### Production Dependencies

- **Next.js**: React framework with App Router
- **React**: UI library
- **TypeScript**: Type safety
- **Tonal.js**: Music theory primitives (scales, chords, notes)

### Development Dependencies

- **Playwright**: End-to-end testing
- **TypeScript**: Compilation and type checking

## Future Enhancements

Potential areas for expansion while maintaining architecture:

1. **Audio Playback**: Add Web Audio API integration in UI layer
2. **MIDI Support**: Add MIDI I/O in UI layer, convert to/from theory-core formats
3. **Voice Leading**: Add voice leading analysis to theory-core
4. **Counterpoint**: Add species counterpoint rules to theory-core
5. **Jazz Harmony**: Extend classify.ts with jazz chord substitutions
6. **Saving/Loading**: Add persistence layer (separate from theory-core)

All enhancements should:
- Keep theory-core pure and framework-agnostic
- Add UI integration in React components
- Update types in theory.types.ts
- Add tests for new functionality

---

**Theory Engine** • Architectured for clarity, maintainability, and extensibility
