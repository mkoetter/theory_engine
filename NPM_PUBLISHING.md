# NPM Publishing Guide for Theory Engine

This guide explains how to publish Theory Engine to npm.

## Prerequisites

1. **npm Account**: Create an account at [npmjs.com](https://www.npmjs.com/)
2. **npm CLI**: Ensure npm is installed and updated
3. **Authentication**: Log in to npm via CLI

```bash
npm login
```

Enter your username, password, and email when prompted.

## Pre-Publishing Checklist

### 1. Run Tests

Ensure all tests pass before publishing:

```bash
npm test
```

### 2. Verify Package Contents

Check what will be included in the package:

```bash
npm pack --dry-run
```

Expected files:
- `LICENSE` - MIT license
- `README.md` - Main documentation
- `lib/theory-core/**/*.ts` - All core library files
- `state/**/*.ts` - Type definitions
- `package.json` - Package metadata

Should NOT include:
- `app/` - Next.js demo application
- `*.test.ts` - Test files
- `.next/` - Build artifacts
- `node_modules/` - Dependencies
- Documentation files (docs/, CLAUDE.md, context/)

### 3. Update Version Number

Follow [Semantic Versioning](https://semver.org/):

```bash
# Patch release (bug fixes): 1.0.0 → 1.0.1
npm version patch

# Minor release (new features): 1.0.0 → 1.1.0
npm version minor

# Major release (breaking changes): 1.0.0 → 2.0.0
npm version major
```

This updates `package.json` and creates a git tag.

### 4. Update Repository URLs

Before first publish, update these fields in `package.json`:

```json
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/YOUR-USERNAME/theory-engine.git"
  },
  "bugs": {
    "url": "https://github.com/YOUR-USERNAME/theory-engine/issues"
  },
  "homepage": "https://github.com/YOUR-USERNAME/theory-engine#readme"
}
```

Replace `YOUR-USERNAME` with your actual GitHub username.

## Publishing to npm

### First-Time Publication

```bash
# Run tests (automatically runs via prepublishOnly script)
npm test

# Publish to npm registry
npm publish
```

For scoped packages (e.g., `@yourname/theory-engine`):

```bash
npm publish --access public
```

### Subsequent Publications

1. Make your changes
2. Update version: `npm version patch|minor|major`
3. Commit changes: `git add . && git commit -m "Release v1.0.x"`
4. Publish: `npm publish`
5. Push to git: `git push && git push --tags`

## Package Configuration

### Entry Points

The package exports two main entry points:

```typescript
// Main API (all modules)
import { createTheoryCore } from 'theory-engine';

// Guitar chords submodule
import { generateChordDiagram } from 'theory-engine/guitar-chords';
```

### TypeScript Usage

Theory Engine distributes TypeScript source files (`.ts`). Users' TypeScript projects will compile these automatically.

For JavaScript projects, users may need to configure their bundler to handle TypeScript files or we could provide pre-compiled JavaScript in future versions.

## Testing After Publication

### Test Installation

Create a test project to verify the package works:

```bash
mkdir test-theory-engine
cd test-theory-engine
npm init -y
npm install theory-engine
```

### Test Import

Create `test.js`:

```javascript
const { createTheoryCore } = require('theory-engine');

const theory = createTheoryCore();
const palette = theory.buildPalette(
  { tonic: 'C', mode: 'major' },
  { sevenths: false }
);

console.log('Palette:', palette);
// Expected: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
```

Run it:

```bash
node test.js
```

## npm Registry Information

After publishing, your package will be available at:

- **npm**: https://www.npmjs.com/package/theory-engine
- **unpkg CDN**: https://unpkg.com/theory-engine@1.0.0/
- **jsDelivr CDN**: https://cdn.jsdelivr.net/npm/theory-engine@1.0.0/

## Version Management Best Practices

### Semantic Versioning Guidelines

- **Patch (1.0.x)**: Bug fixes, documentation updates, internal refactoring
- **Minor (1.x.0)**: New features, new APIs, backward-compatible changes
- **Major (x.0.0)**: Breaking API changes, removed features, incompatible updates

### Changelog

Maintain a `CHANGELOG.md` to document changes:

```markdown
# Changelog

## [1.0.0] - 2025-01-XX

### Added
- Initial release
- Chord analysis API
- Extended harmonies (Group 1)
- Scale enhancements (Group 2)
- Circle of Fifths visualization
- Guitar chord diagrams (Group 6)

### Features
- 50+ guitar chord fingerings
- 25+ exotic scales
- SVG diagram generation
- Interval-based color coding
```

## Unpublishing (Caution!)

You can unpublish within 72 hours of publication:

```bash
npm unpublish theory-engine@1.0.0
```

**Warning**: Unpublishing is permanent and discouraged. Instead:
- Use `npm deprecate` for deprecated versions
- Publish a patch version to fix issues
- Contact npm support for serious problems

## Package Maintenance

### Updating Dependencies

Keep Tonal.js up to date:

```bash
npm update tonal
npm test  # Verify still works
npm version patch
npm publish
```

### Security Updates

Monitor for security vulnerabilities:

```bash
npm audit
npm audit fix
```

### Deprecating Versions

If a version has critical bugs:

```bash
npm deprecate theory-engine@1.0.0 "Critical bug in chord analysis. Please upgrade to 1.0.1"
```

## CI/CD Integration (Future)

For automated publishing, consider:

1. **GitHub Actions**: Auto-publish on tag push
2. **Semantic Release**: Automated versioning based on commit messages
3. **npm Provenance**: Add supply chain security

Example GitHub Action (`.github/workflows/publish.yml`):

```yaml
name: Publish to npm
on:
  push:
    tags:
      - 'v*'
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm test
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Support and Documentation

After publishing, users will find:

- **README.md**: Quick start and API documentation
- **lib/theory-core/README.md**: Detailed API reference
- **GitHub Issues**: Bug reports and feature requests
- **npm page**: Package information and stats

## Troubleshooting

### "You do not have permission to publish"

- Verify you're logged in: `npm whoami`
- Check package name isn't taken: `npm view theory-engine`
- Use a scoped package: `@yourusername/theory-engine`

### "prepublishOnly script failed"

- Tests are failing
- Run `npm test` locally to debug
- Fix issues before publishing

### "Package size too large"

- Check `.npmignore` is excluding properly
- Run `npm pack --dry-run` to verify
- Remove unnecessary files from `files` array in `package.json`

## Resources

- [npm Documentation](https://docs.npmjs.com/)
- [Semantic Versioning](https://semver.org/)
- [npm package.json reference](https://docs.npmjs.com/cli/v8/configuring-npm/package-json)
- [Publishing packages](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)

---

**Note**: Before first publication, ensure you have the rights to publish under the "theory-engine" name or choose an alternative name/scope.
