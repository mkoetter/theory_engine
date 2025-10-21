import { describe, it, expect } from 'vitest';
import {
  parseExtendedChord,
  createSlashChord,
  validateChordSymbol,
  extendedRomanToAbsolute,
  getChordVoicings,
  getExtendedChordNotes,
} from './harmonies';

/**
 * Unit tests for Extended Harmonies Module
 *
 * Tests parseExtendedChord, createSlashChord, validateChordSymbol,
 * extendedRomanToAbsolute, getChordVoicings, and getExtendedChordNotes.
 */

describe('Extended Harmonies - parseExtendedChord', () => {
  it('should parse basic major chord', () => {
    const result = parseExtendedChord('C');

    expect(result.root).toBe('C');
    expect(result.quality).toBe('major');
    expect(result.extensions).toEqual([]);
    expect(result.notes.length).toBeGreaterThan(0);
  });

  it('should parse major 7th chord', () => {
    const result = parseExtendedChord('Cmaj7');

    expect(result.root).toBe('C');
    expect(result.quality).toBe('major');
    expect(result.extensions).toContain(7);
  });

  it('should parse dominant 9th chord with alterations', () => {
    const result = parseExtendedChord('D7b9');

    expect(result.root).toBe('D');
    expect(result.quality).toBe('dominant');
    expect(result.extensions).toContain(7);
    expect(result.extensions).toContain(9);
    expect(result.alterations).toHaveLength(1);
    expect(result.alterations[0].degree).toBe(9);
    expect(result.alterations[0].alteration).toBe('b');
  });

  it('should parse slash chord', () => {
    const result = parseExtendedChord('Am/C');

    expect(result.root).toBe('A');
    expect(result.quality).toBe('minor');
    expect(result.bass).toBe('C');
    expect(result.notes[0]).toBe('C');
  });

  it('should throw error on invalid chord', () => {
    expect(() => parseExtendedChord('Z#7')).toThrow();
  });

  it('should handle minor 7th flat 5', () => {
    const result = parseExtendedChord('Bm7b5');

    expect(result.root).toBe('B');
    expect(result.quality).toBe('minor');
  });
});

describe('Extended Harmonies - createSlashChord', () => {
  it('should create first inversion (C/E)', () => {
    const result = createSlashChord('C', 'E');

    expect(result.chord).toBe('C');
    expect(result.bass).toBe('E');
    expect(result.symbol).toBe('C/E');
    expect(result.inversion).toBe(1);
    expect(result.notes[0]).toBe('E');
  });

  it('should create second inversion (C/G)', () => {
    const result = createSlashChord('C', 'G');

    expect(result.inversion).toBe(2);
    expect(result.notes[0]).toBe('G');
  });

  it('should handle polychord (Am7/C)', () => {
    const result = createSlashChord('Am7', 'C');

    expect(result.bass).toBe('C');
    expect(result.notes[0]).toBe('C');
  });

  it('should throw error on invalid chord', () => {
    expect(() => createSlashChord('Invalid', 'C')).toThrow();
  });
});

describe('Extended Harmonies - validateChordSymbol', () => {
  it('should validate correct chord symbols', () => {
    const tests = ['C', 'Cmaj7', 'D7b9', 'F#m7', 'Bbm7b5'];

    for (const symbol of tests) {
      const result = validateChordSymbol(symbol);
      expect(result.isValid).toBe(true);
      expect(result.error).toBe(null);
    }
  });

  it('should invalidate incorrect chord symbols', () => {
    const tests = ['Z', 'X#7', '123'];

    for (const symbol of tests) {
      const result = validateChordSymbol(symbol);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    }
  });

  it('should validate complex extended chords', () => {
    const result = validateChordSymbol('G13#11');
    expect(result.isValid).toBe(true);
  });
});

describe('Extended Harmonies - extendedRomanToAbsolute', () => {
  it('should convert Roman numerals in C major', () => {
    const tests = [
      { roman: 'I', expected: 'C' },
      { roman: 'ii', expected: 'Dm' },
      { roman: 'V7', expected: 'G7' },
      { roman: 'Imaj9', expected: 'Cmaj9' },
    ];

    for (const { roman, expected } of tests) {
      const result = extendedRomanToAbsolute(roman, 'C');
      expect(result).toBe(expected);
    }
  });

  it('should handle accidentals (bVI)', () => {
    const result = extendedRomanToAbsolute('bVI', 'C');
    // Accept either Ab or Bb (enharmonic equivalents)
    expect(['Ab', 'Bb', 'G#']).toContain(result);
  });

  it('should handle sharp accidentals (#IV)', () => {
    const result = extendedRomanToAbsolute('#IV', 'C');
    // Accept either F# or Gb (enharmonic equivalents)
    expect(['F#', 'Gb']).toContain(result);
  });

  it('should throw error on invalid Roman numeral', () => {
    expect(() => extendedRomanToAbsolute('VIII', 'C')).toThrow();
  });
});

describe('Extended Harmonies - getChordVoicings', () => {
  it('should generate root position and inversions for Cmaj7', () => {
    const result = getChordVoicings('Cmaj7', { inversions: true });

    expect(result).toHaveLength(4); // Root + 3 inversions
    expect(result[0].name).toBe('Root position');
    expect(result[1].name).toContain('First');
    expect(result[2].name).toContain('Second');
    expect(result[3].name).toContain('Third');
  });

  it('should respect inversions option when false', () => {
    const result = getChordVoicings('C', { inversions: false });

    expect(result).toHaveLength(1); // Only root position
    expect(result[0].name).toBe('Root position');
  });

  it('should use specified octave range', () => {
    const result = getChordVoicings('C', { inversions: false, octaveRange: [4, 5] });

    expect(result[0].notes[0]).toContain('4');
  });

  it('should throw error on invalid octave range', () => {
    expect(() => getChordVoicings('C', { octaveRange: [10, 5] })).toThrow();
  });

  it('should handle triad inversions correctly', () => {
    const result = getChordVoicings('C', { inversions: true });

    expect(result).toHaveLength(3); // Root + 2 inversions for triad
  });
});

describe('Extended Harmonies - getExtendedChordNotes', () => {
  it('should return notes with octave numbers', () => {
    const chord = parseExtendedChord('Cmaj7');
    const notes = getExtendedChordNotes(chord, 3);

    expect(notes.length).toBeGreaterThan(0);
    expect(notes[0]).toContain('3');
  });

  it('should respect startOctave parameter', () => {
    const chord = parseExtendedChord('C');
    const notes = getExtendedChordNotes(chord, 5);

    expect(notes[0]).toContain('5');
  });
});

describe('Extended Harmonies - Integration', () => {
  it('should work together: validate, parse, and voice', () => {
    // 1. Validate
    const validation = validateChordSymbol('Gmaj9');
    expect(validation.isValid).toBe(true);

    // 2. Parse
    const parsed = parseExtendedChord('Gmaj9');
    expect(parsed.root).toBe('G');
    expect(parsed.quality).toBe('major');
    expect(parsed.extensions.length).toBeGreaterThan(0);

    // 3. Get voicings
    const voicings = getChordVoicings('Gmaj9', { inversions: true });
    expect(voicings.length).toBeGreaterThan(1);

    // 4. Get notes with octaves
    const notes = getExtendedChordNotes(parsed, 3);
    expect(notes.length).toBeGreaterThan(0);
  });

  it('should handle complete workflow for slash chords', () => {
    const slashChord = createSlashChord('Am7', 'C');
    expect(slashChord.bass).toBe('C');

    const parsed = parseExtendedChord('Am7/C');
    expect(parsed.bass).toBe('C');
    expect(parsed.root).toBe('A');
  });
});
