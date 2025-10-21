# Packaging Theory Engine as NPM Package

## Overview

The theory engine is designed to be packaged as a standalone npm package that can be used in any JavaScript/TypeScript project (React, Node.js, CLI, etc.).

## Package Structure

### Recommended Package Name
```
@your-scope/music-theory-engine
```
or
```
music-theory-engine
```

### Files to Include

**Core Library** (all in `lib/theory-core/`):
- `index.ts` - Main API facade
- `convert.ts` - Roman ↔ Absolute conversion
- `classify.ts` - Chord classification
- `analysis.ts` - Functional analysis
- `tension.ts` - Tension calculation
- `transition.ts` - Key modulation
- `palette.ts` - Chord palette generation
- `circle.ts` - Circle of Fifths logic
- `README.md` - API documentation

**Types** (from `state/`):
- `theory.types.ts` - All TypeScript definitions

**Optional React Hook** (from `state/`):
- `useTheory.ts` - React integration (mark as optional peerDependency)

## Option A: Publish to npm Registry

### Step 1: Create package.json

```json
{
  "name": "@your-scope/music-theory-engine",
  "version": "1.0.0",
  "description": "Framework-agnostic music theory engine with functional harmony analysis",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./react": {
      "import": "./dist/react.mjs",
      "require": "./dist/react.js",
      "types": "./dist/react.d.ts"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsup src/index.ts src/react.ts --format cjs,esm --dts",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "music-theory",
    "harmony",
    "chords",
    "circle-of-fifths",
    "tonal",
    "progression",
    "analysis"
  ],
  "author": "Your Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/mkoetter/theory_engine.git",
    "directory": "packages/music-theory-engine"
  },
  "dependencies": {
    "tonal": "^6.0.1"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true
    }
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Step 2: Create tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2020"],
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 3: Reorganize Files

Create a `packages/music-theory-engine/` structure:

```
packages/music-theory-engine/
├── src/
│   ├── index.ts              # Export { createTheoryCore, types, ... }
│   ├── react.ts              # Export { useTheory }
│   ├── convert.ts
│   ├── classify.ts
│   ├── analysis.ts
│   ├── tension.ts
│   ├── transition.ts
│   ├── palette.ts
│   ├── circle.ts
│   └── types.ts
├── package.json
├── tsconfig.json
├── README.md
└── LICENSE
```

### Step 4: Build & Publish

```bash
# Build the package
npm run build

# Test locally first
npm pack
# This creates music-theory-engine-1.0.0.tgz

# Test in another project
cd /path/to/other/project
npm install /path/to/music-theory-engine-1.0.0.tgz

# Publish to npm (when ready)
npm login
npm publish --access public
```

### Step 5: Use in Other Projects

```bash
npm install @your-scope/music-theory-engine
```

```typescript
// In any JavaScript/TypeScript project
import { createTheoryCore } from '@your-scope/music-theory-engine';

const theory = createTheoryCore();
const palette = theory.buildPalette({ tonic: 'C', mode: 'major' }, { sevenths: false });

// In React projects (optional)
import { useTheory } from '@your-scope/music-theory-engine/react';

function MyComponent({ block }) {
  const { palette, analysis } = useTheory(block);
  // ...
}
```

## Option B: Use as Local Package (No Publishing)

If you don't want to publish publicly, use npm workspaces or local package:

### Method 1: NPM Workspaces (Monorepo)

```json
// Root package.json
{
  "name": "theory-projects",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```

Structure:
```
theory-projects/
├── packages/
│   └── music-theory-engine/  # The core library
│       ├── src/
│       └── package.json
├── apps/
│   ├── web-app/              # Next.js demo app
│   └── cli-tool/             # CLI application
└── package.json
```

Each app can use:
```json
{
  "dependencies": {
    "@your-scope/music-theory-engine": "*"
  }
}
```

### Method 2: Local Package via package.json

```json
{
  "dependencies": {
    "music-theory-engine": "file:../path/to/package"
  }
}
```

### Method 3: Private npm Registry

Use services like:
- GitHub Packages
- npm private packages
- Verdaccio (self-hosted)

## Recommended Setup for Your Use Case

### Short-term (Development):
1. Keep current structure
2. Use `npm link` for local development:
   ```bash
   cd /path/to/theory_engine/lib/theory-core
   npm link

   cd /path/to/other-project
   npm link music-theory-engine
   ```

### Long-term (Production):
1. Create npm package from `lib/theory-core`
2. Publish to npm (public or private)
3. Version with semantic versioning
4. Keep current Next.js app as demo/documentation site

## Migration Steps

1. **Extract Core Library**
   ```bash
   mkdir -p packages/music-theory-engine/src
   cp -r lib/theory-core/* packages/music-theory-engine/src/
   cp state/theory.types.ts packages/music-theory-engine/src/types.ts
   ```

2. **Setup Package**
   - Create package.json (see above)
   - Create tsconfig.json (see above)
   - Add build script with tsup or tsc

3. **Update Imports**
   - Update path aliases in current app
   - Change from `@/lib/theory-core` to `@your-scope/music-theory-engine`

4. **Test**
   - Build package: `npm run build`
   - Test locally: `npm pack` and install in test project
   - Run all tests

5. **Publish**
   - Create npm account
   - Run `npm publish`

## Bundle Size Considerations

The theory engine should be lightweight:
- Core: ~50KB minified
- With Tonal.js: ~150KB total
- Tree-shakeable with ESM exports

## Example Projects Using the Package

### React App
```typescript
import { createTheoryCore } from '@your-scope/music-theory-engine';
import { useTheory } from '@your-scope/music-theory-engine/react';
```

### Node.js CLI
```typescript
import { createTheoryCore } from '@your-scope/music-theory-engine';

const theory = createTheoryCore();
const key = { tonic: 'G', mode: 'major' };
console.log(theory.buildPalette(key, { sevenths: false }));
```

### Express API
```typescript
import express from 'express';
import { createTheoryCore } from '@your-scope/music-theory-engine';

const app = express();
const theory = createTheoryCore();

app.post('/analyze', (req, res) => {
  const analysis = theory.analyzeProgression(req.body.progression, req.body.key);
  res.json(analysis);
});
```

## Versioning Strategy

Use semantic versioning:
- **1.0.0** - Initial stable release
- **1.1.0** - Add new features (e.g., jazz chord substitutions)
- **1.0.1** - Bug fixes (e.g., fix enharmonic handling)
- **2.0.0** - Breaking changes (e.g., API restructure)

## Documentation

Include in npm package:
- README.md with API overview
- TypeScript definitions (.d.ts files)
- Link to full documentation site (your Next.js app)

---

## TL;DR - Quick Recommendation

**For Production Use:**
1. Create npm package from `/lib/theory-core`
2. Publish to npm registry
3. Install in projects with `npm install @your-scope/music-theory-engine`
4. Version properly with semver

**For Development/Testing:**
1. Use `npm link` to test locally
2. Or use `file:` protocol in package.json
3. Transition to published package when stable

The theory engine's clean architecture makes it perfect for npm packaging! 🎵
