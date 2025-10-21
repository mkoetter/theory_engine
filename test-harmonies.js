/**
 * Quick test script for Extended Harmonies module
 * Run with: node test-harmonies.js
 */

// Since this is ESM and we're in development, we'll use a workaround
// In production, this would be proper imports

const { parseExtendedChord, createSlashChord, validateChordSymbol, extendedRomanToAbsolute } = require('./lib/theory-core/harmonies.ts');

console.log('Testing Extended Harmonies Module\n');
console.log('='.repeat(50));

// Test 1: Parse basic extended chords
console.log('\n1. Testing parseExtendedChord():');
console.log('-'.repeat(50));

try {
  const tests = [
    'Cmaj9',
    'D7b9',
    'Am7',
    'Gmaj13',
    'F#m7b5',
    'Am/C'
  ];

  tests.forEach(symbol => {
    try {
      const result = parseExtendedChord(symbol);
      console.log(`✓ ${symbol}:`);
      console.log(`  Root: ${result.root}, Quality: ${result.quality}`);
      console.log(`  Extensions: [${result.extensions.join(', ')}]`);
      if (result.bass) console.log(`  Bass: ${result.bass}`);
    } catch (e) {
      console.log(`✗ ${symbol}: ${e.message}`);
    }
  });
} catch (e) {
  console.log('Module not yet available - this is expected in development');
  console.log('Extended harmonies will be available after build');
}

console.log('\n' + '='.repeat(50));
console.log('\nNote: For full testing, run: npm test (when Playwright tests are added)');
console.log('Or use the development server to test interactively.\n');
