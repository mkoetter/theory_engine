# Theory Engine

Music theory assistant component for Next.js/React/TypeScript applications. Built with [Tonal.js](https://github.com/tonaljs/tonal).

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

- `/app` - Next.js app directory (pages and layouts)
- `/lib/theory-core` - Core music theory logic using Tonal.js
- `/state` - TypeScript type definitions
- `/components/theory` - React components (coming soon)
- `/docs` - Project documentation and planning

## Current Status

**Implemented Features:**
- ✅ Group 1: Extended Harmonies & Inversions (extended chords, slash chords, voicings)
- ✅ Group 2: Scale & Mode Enhancements (exotic scales, compatibility analysis)
- 🚧 Group 6: Guitar Chord Diagrams (in progress)

**Future Considerations:**
- Group 3: Common Progressions Library
- Group 4: Advanced Substitutions & Modulations
- Group 5: Voice Leading Analysis
- Group 7: Export Formats & Analysis Scoring

See `docs/theory_assistant_plan.md` for complete specifications.

## Theory Core API

The `TheoryCore` interface provides:

**Core Functionality:**
- `buildPalette()` - Generate diatonic chord palettes
- `romansToAbsolute()` - Convert roman numerals to chord names
- `absoluteToRomans()` - Convert chord names to roman numerals
- `classifyChord()` - Classify chord origin (diatonic/borrowed/etc)

**Extended Harmonies (Group 1):**
- `parseExtendedChord()` - Parse complex chord symbols (9, 11, 13, alterations)
- `createSlashChord()` - Create and analyze slash chords
- `getChordVoicings()` - Generate chord voicings with octave positions
- `extendedRomanToAbsolute()` - Convert extended roman numerals to absolute chords

**Scale Enhancements (Group 2):**
- `getScaleInfo()` - Get comprehensive scale information
- `getExoticScales()` - Access 25+ exotic scales (blues, pentatonic, world scales)
- `getCompatibleScales()` - Find compatible scales for improvisation
- `analyzeScale()` - Analyze scale characteristics and patterns
- `getScalesContainingNotes()` - Find scales matching specific notes

**Guitar Chords (Group 6 - In Progress):**
- `getChordFingerings()` - Get guitar fingerings for any chord
- `generateChordDiagram()` - Generate SVG fretboard diagrams
- `findAlternativeVoicings()` - Find alternative guitar voicings

## Development

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run linter
```

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Architecture guide for Claude Code
- [Theory Assistant Plan](./docs/theory_assistant_plan.md) - Complete specifications
