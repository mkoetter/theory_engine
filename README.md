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

**Milestone 1 (In Progress)**: MVP implementation with basic palette generation and roman numeral conversion.

See `docs/theory_assistant_plan.md` for complete implementation plan.

## Theory Core API

The `TheoryCore` interface provides:

- `buildPalette()` - Generate diatonic chord palettes
- `romansToAbsolute()` - Convert roman numerals to chord names
- `absoluteToRomans()` - Convert chord names to roman numerals
- `classifyChord()` - Classify chord origin (diatonic/borrowed/etc)
- `analyzeProgression()` - Functional analysis (coming in Milestone 2)
- `suggestNext()` - Context-aware chord suggestions (coming in Milestone 2)
- `planTransition()` - Block-to-block transitions (coming in Milestone 2)

## Development

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run linter
```

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Architecture guide for Claude Code
- [Theory Assistant Plan](./docs/theory_assistant_plan.md) - Complete specifications
