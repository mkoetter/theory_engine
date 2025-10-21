import { test, expect } from '@playwright/test';

/**
 * Tests for Extended Harmonies Module
 *
 * Tests the parseExtendedChord, createSlashChord, validateChordSymbol,
 * extendedRomanToAbsolute, and getChordVoicings functions.
 */

// Helper function to wait for API to be ready
async function waitForApi(page: any) {
  await page.goto('http://localhost:3000/test-api');
  await page.waitForSelector('[data-testid="api-ready"]', { state: 'visible' });
}

test.describe('Extended Harmonies - parseExtendedChord', () => {
  test('should parse basic major chord', async ({ page }) => {
    await waitForApi(page);

    const result = await page.evaluate(() => {
      return (window as any).theoryCore.parseExtendedChord('C');
    });

    expect(result.root).toBe('C');
    expect(result.quality).toBe('major');
  });

  test('should parse major 7th chord', async ({ page }) => {
    await waitForApi(page);

    const result = await page.evaluate(() => {
      return (window as any).theoryCore.parseExtendedChord('Cmaj7');
    });

    expect(result.root).toBe('C');
    expect(result.quality).toBe('major');
    expect(result.extensions).toContain(7);
  });

  test('should parse dominant 9th chord', async ({ page }) => {
    await waitForApi(page);

    const result = await page.evaluate(() => {
      return (window as any).theoryCore.parseExtendedChord('D7b9');
    });

    expect(result.root).toBe('D');
    expect(result.quality).toBe('dominant');
    expect(result.extensions).toContain(7);
    expect(result.extensions).toContain(9);
    expect(result.alterations).toHaveLength(1);
    expect(result.alterations[0].degree).toBe(9);
    expect(result.alterations[0].alteration).toBe('b');
  });

  test('should parse slash chord', async ({ page }) => {
    await waitForApi(page);

    const result = await page.evaluate(() => {
      return (window as any).theoryCore.parseExtendedChord('Am/C');
    });

    expect(result.root).toBe('A');
    expect(result.quality).toBe('minor');
    expect(result.bass).toBe('C');
    expect(result.notes[0]).toBe('C');
  });

  test('should throw error on invalid chord', async ({ page }) => {
    await waitForApi(page);

    const error = await page.evaluate(() => {
      try {
        (window as any).theoryCore.parseExtendedChord('Z#7');
        return null;
      } catch (e: any) {
        return e.message;
      }
    });

    expect(error).toBeTruthy();
    expect(error).toContain('Invalid');
  });
});

test.describe('Extended Harmonies - createSlashChord', () => {
  test('should create first inversion (C/E)', async ({ page }) => {
    await waitForApi(page);

    const result = await page.evaluate(() => {
      return (window as any).theoryCore.createSlashChord('C', 'E');
    });

    expect(result.chord).toBe('C');
    expect(result.bass).toBe('E');
    expect(result.symbol).toBe('C/E');
    expect(result.inversion).toBe(1);
    expect(result.notes[0]).toBe('E');
  });

  test('should create second inversion (C/G)', async ({ page }) => {
    await waitForApi(page);

    const result = await page.evaluate(() => {
      return (window as any).theoryCore.createSlashChord('C', 'G');
    });

    expect(result.inversion).toBe(2);
    expect(result.notes[0]).toBe('G');
  });

  test('should handle polychord (Am7/C)', async ({ page }) => {
    await waitForApi(page);

    const result = await page.evaluate(() => {
      return (window as any).theoryCore.createSlashChord('Am7', 'C');
    });

    expect(result.bass).toBe('C');
    expect(result.notes[0]).toBe('C');
  });
});

test.describe('Extended Harmonies - validateChordSymbol', () => {
  test('should validate correct chord symbols', async ({ page }) => {
    await waitForApi(page);

    const tests = ['C', 'Cmaj7', 'D7b9', 'F#m7', 'Bbm7b5'];

    for (const symbol of tests) {
      const result = await page.evaluate((sym) => {
        return (window as any).theoryCore.validateChordSymbol(sym);
      }, symbol);

      expect(result.isValid).toBe(true);
      expect(result.error).toBe(null);
    }
  });

  test('should invalidate incorrect chord symbols', async ({ page }) => {
    await waitForApi(page);

    const tests = ['Z', 'X#7', '123'];

    for (const symbol of tests) {
      const result = await page.evaluate((sym) => {
        return (window as any).theoryCore.validateChordSymbol(sym);
      }, symbol);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    }
  });
});

test.describe('Extended Harmonies - extendedRomanToAbsolute', () => {
  test('should convert Roman numerals in C major', async ({ page }) => {
    await waitForApi(page);

    const tests = [
      { roman: 'I', expected: 'C' },
      { roman: 'ii', expected: 'Dm' },
      { roman: 'V7', expected: 'G7' },
      { roman: 'Imaj9', expected: 'Cmaj9' },
    ];

    for (const { roman, expected } of tests) {
      const result = await page.evaluate((r) => {
        return (window as any).theoryCore.extendedRomanToAbsolute(r, 'C');
      }, roman);

      expect(result).toBe(expected);
    }
  });

  test('should handle accidentals', async ({ page }) => {
    await waitForApi(page);

    const result = await page.evaluate(() => {
      return (window as any).theoryCore.extendedRomanToAbsolute('bVI', 'C');
    });

    // bVI in C major should be Ab
    expect(result).toBe('Ab');
  });
});

test.describe('Extended Harmonies - getChordVoicings', () => {
  test('should generate root position and inversions', async ({ page }) => {
    await waitForApi(page);

    const result = await page.evaluate(() => {
      return (window as any).theoryCore.getChordVoicings('Cmaj7', { inversions: true });
    });

    expect(result).toHaveLength(4); // Root + 3 inversions
    expect(result[0].name).toBe('Root position');
    expect(result[1].name).toContain('First');
    expect(result[2].name).toContain('Second');
    expect(result[3].name).toContain('Third');
  });

  test('should respect inversions option', async ({ page }) => {
    await waitForApi(page);

    const result = await page.evaluate(() => {
      return (window as any).theoryCore.getChordVoicings('C', { inversions: false });
    });

    expect(result).toHaveLength(1); // Only root position
    expect(result[0].name).toBe('Root position');
  });

  test('should use specified octave range', async ({ page }) => {
    await waitForApi(page);

    const result = await page.evaluate(() => {
      return (window as any).theoryCore.getChordVoicings('C', { inversions: false, octaveRange: [4, 5] });
    });

    expect(result[0].notes[0]).toContain('4');
  });
});

test.describe('Extended Harmonies - Integration', () => {
  test('should work together: parse, validate, and voice', async ({ page }) => {
    await waitForApi(page);

    const result = await page.evaluate(() => {
      const theory = (window as any).theoryCore;

      // 1. Validate
      const validation = theory.validateChordSymbol('Gmaj9');
      if (!validation.isValid) throw new Error('Should be valid');

      // 2. Parse
      const parsed = theory.parseExtendedChord('Gmaj9');

      // 3. Get voicings
      const voicings = theory.getChordVoicings('Gmaj9', { inversions: true });

      return {
        parsed: {
          root: parsed.root,
          quality: parsed.quality,
          extensionsCount: parsed.extensions.length,
        },
        voicingsCount: voicings.length,
      };
    });

    expect(result.parsed.root).toBe('G');
    expect(result.parsed.quality).toBe('major');
    expect(result.parsed.extensionsCount).toBeGreaterThan(0);
    expect(result.voicingsCount).toBeGreaterThan(1);
  });
});
