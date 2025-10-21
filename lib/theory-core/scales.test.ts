import { describe, it, expect } from 'vitest';
import {
  getScaleInfo,
  getScaleNotes,
  getScaleIntervals,
  getExoticScales,
  getCompatibleScales,
  analyzeScale,
  getScalesContainingNotes,
  EXOTIC_SCALES,
} from './scales';

/**
 * Unit tests for Scale Enhancements Module
 *
 * Tests getScaleInfo, getScaleNotes, getScaleIntervals, getExoticScales,
 * getCompatibleScales, analyzeScale, and getScalesContainingNotes.
 */

describe('Scale Enhancements - getScaleInfo', () => {
  it('should get info for C major scale', () => {
    const result = getScaleInfo('C', 'major');

    expect(result.tonic).toBe('C');
    expect(result.notes).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    expect(result.noteCount).toBe(7);
    expect(result.characteristics.isHeptatonic).toBe(true);
    expect(result.characteristics.isPentatonic).toBe(false);
  });

  it('should get info for exotic scale (blues)', () => {
    const result = getScaleInfo('C', 'blues');

    expect(result.tonic).toBe('C');
    expect(result.noteCount).toBe(6);
    expect(result.notes).toContain('C');
    expect(result.notes).toContain('Eb');
  });

  it('should get info for pentatonic scale', () => {
    const result = getScaleInfo('G', 'major pentatonic');

    expect(result.tonic).toBe('G');
    expect(result.noteCount).toBe(5);
    expect(result.characteristics.isPentatonic).toBe(true);
  });

  it('should throw error for invalid scale', () => {
    expect(() => getScaleInfo('C', 'invalid-scale-name')).toThrow();
  });

  it('should throw error for empty tonic', () => {
    expect(() => getScaleInfo('', 'major')).toThrow();
  });

  it('should handle harmonic minor', () => {
    const result = getScaleInfo('A', 'harmonic minor');

    expect(result.tonic).toBe('A');
    expect(result.noteCount).toBe(7);
  });
});

describe('Scale Enhancements - getScaleNotes', () => {
  it('should return notes array for C major', () => {
    const notes = getScaleNotes('C', 'major');

    expect(notes).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    expect(notes.length).toBe(7);
  });

  it('should return notes for whole tone scale', () => {
    const notes = getScaleNotes('C', 'whole tone');

    expect(notes.length).toBe(6);
    expect(notes[0]).toBe('C');
  });
});

describe('Scale Enhancements - getScaleIntervals', () => {
  it('should return intervals for C major', () => {
    const intervals = getScaleIntervals('C', 'major');

    expect(intervals).toContain('1P');
    expect(intervals).toContain('2M');
    expect(intervals).toContain('3M');
    expect(intervals).toContain('4P');
    expect(intervals).toContain('5P');
    expect(intervals).toContain('6M');
    expect(intervals).toContain('7M');
  });

  it('should return intervals for minor pentatonic', () => {
    const intervals = getScaleIntervals('A', 'minor pentatonic');

    expect(intervals.length).toBe(5);
    expect(intervals).toEqual(['1P', '3m', '4P', '5P', '7m']);
  });
});

describe('Scale Enhancements - getExoticScales', () => {
  it('should return array of exotic scale names', () => {
    const scales = getExoticScales();

    expect(Array.isArray(scales)).toBe(true);
    expect(scales.length).toBeGreaterThan(20);
    expect(scales).toContain('blues');
    expect(scales).toContain('whole tone');
    expect(scales).toContain('major pentatonic');
  });

  it('should include Japanese scales', () => {
    const scales = getExoticScales();

    expect(scales).toContain('hirajoshi');
    expect(scales).toContain('in sen');
    expect(scales).toContain('iwato');
  });

  it('should include Middle Eastern scales', () => {
    const scales = getExoticScales();

    expect(scales).toContain('phrygian dominant');
    expect(scales).toContain('double harmonic');
  });
});

describe('Scale Enhancements - getCompatibleScales', () => {
  it('should find compatible scales for C major', () => {
    const compatible = getCompatibleScales('C', 'major');

    expect(Array.isArray(compatible)).toBe(true);
    expect(compatible.length).toBeGreaterThan(0);

    // Should contain pentatonic (subset)
    const pentatonic = compatible.find(s => s.type === 'major pentatonic');
    expect(pentatonic).toBeDefined();
    expect(pentatonic?.commonNotesCount).toBeGreaterThan(0);
  });

  it('should find compatible scales for A minor', () => {
    const compatible = getCompatibleScales('A', 'minor');

    expect(compatible.length).toBeGreaterThan(0);

    // Minor pentatonic should be compatible
    const minorPenta = compatible.find(s => s.type === 'minor pentatonic');
    expect(minorPenta).toBeDefined();
  });

  it('should sort by commonNotesCount descending', () => {
    const compatible = getCompatibleScales('C', 'major');

    for (let i = 1; i < compatible.length; i++) {
      expect(compatible[i - 1].commonNotesCount).toBeGreaterThanOrEqual(
        compatible[i].commonNotesCount
      );
    }
  });

  it('should exclude the source scale itself', () => {
    const compatible = getCompatibleScales('C', 'major');

    const hasSourceScale = compatible.some(s => s.type === 'major');
    expect(hasSourceScale).toBe(false);
  });
});

describe('Scale Enhancements - analyzeScale', () => {
  it('should detect symmetrical scale (whole tone)', () => {
    const analysis = analyzeScale('C', 'whole tone');

    expect(analysis.isSymmetrical).toBe(true);
    expect(analysis.hasAugmentedIntervals).toBe(true);
  });

  it('should detect pentatonic', () => {
    const analysis = analyzeScale('C', 'major pentatonic');

    expect(analysis.isPentatonic).toBe(true);
    expect(analysis.isHeptatonic).toBe(false);
  });

  it('should detect heptatonic', () => {
    const analysis = analyzeScale('C', 'major');

    expect(analysis.isHeptatonic).toBe(true);
    expect(analysis.isPentatonic).toBe(false);
  });

  it('should detect diminished intervals', () => {
    const analysis = analyzeScale('C', 'locrian');

    expect(analysis.hasDiminishedIntervals).toBe(true);
  });
});

describe('Scale Enhancements - getScalesContainingNotes', () => {
  it('should find scales containing C major triad', () => {
    const scales = getScalesContainingNotes(['C', 'E', 'G']);

    expect(scales.length).toBeGreaterThan(0);
    expect(scales).toContain('C major');
    expect(scales).toContain('G major'); // G major contains C, E, G
  });

  it('should find scales containing C, E, G, B (Cmaj7)', () => {
    const scales = getScalesContainingNotes(['C', 'E', 'G', 'B']);

    expect(scales.length).toBeGreaterThan(0);
    expect(scales).toContain('C major');
    expect(scales).toContain('C lydian');
  });

  it('should throw error for empty notes array', () => {
    expect(() => getScalesContainingNotes([])).toThrow();
  });

  it('should handle single note', () => {
    const scales = getScalesContainingNotes(['C']);

    // Every scale should contain its tonic
    expect(scales.length).toBeGreaterThan(0);
  });

  it('should handle enharmonic equivalents', () => {
    const scalesSharp = getScalesContainingNotes(['F#']);
    const scalesFlat = getScalesContainingNotes(['Gb']);

    // Should return similar results (different spellings of same pitch)
    expect(scalesSharp.length).toBeGreaterThan(0);
    expect(scalesFlat.length).toBeGreaterThan(0);
  });
});

describe('Scale Enhancements - Integration', () => {
  it('should work together: get scale, analyze, find compatible', () => {
    // 1. Get scale info
    const scaleInfo = getScaleInfo('C', 'major');
    expect(scaleInfo.notes.length).toBe(7);

    // 2. Analyze it
    const analysis = analyzeScale('C', 'major');
    expect(analysis.isHeptatonic).toBe(true);

    // 3. Find compatible scales
    const compatible = getCompatibleScales('C', 'major');
    expect(compatible.length).toBeGreaterThan(0);
  });

  it('should handle exotic scale workflow', () => {
    // Get list of exotic scales
    const exoticList = getExoticScales();
    expect(exoticList).toContain('blues');

    // Get info for one
    const bluesInfo = getScaleInfo('C', 'blues');
    expect(bluesInfo.noteCount).toBe(6);

    // Analyze it
    const analysis = analyzeScale('C', 'blues');
    expect(analysis.isPentatonic).toBe(false);
    expect(analysis.isHeptatonic).toBe(false);
  });

  it('should find scales for chord tones workflow', () => {
    // Start with chord tones
    const chordTones = ['D', 'F#', 'A'];

    // Find scales
    const scales = getScalesContainingNotes(chordTones);
    expect(scales).toContain('D major');
    expect(scales).toContain('A major'); // Also contains D, F#, A

    // Get info for one of them
    const dMajorInfo = getScaleInfo('D', 'major');
    expect(dMajorInfo.notes).toContain('D');
    expect(dMajorInfo.notes).toContain('F#');
    expect(dMajorInfo.notes).toContain('A');
  });
});

describe('Scale Enhancements - EXOTIC_SCALES constant', () => {
  it('should be frozen (immutable)', () => {
    expect(Object.isFrozen(EXOTIC_SCALES)).toBe(true);
  });

  it('should have expected scale categories', () => {
    const scales = Object.keys(EXOTIC_SCALES);

    // Pentatonic
    expect(scales).toContain('major pentatonic');
    expect(scales).toContain('minor pentatonic');

    // Blues
    expect(scales).toContain('blues');

    // Symmetrical
    expect(scales).toContain('whole tone');
    expect(scales).toContain('diminished');

    // Japanese
    expect(scales).toContain('hirajoshi');

    // Middle Eastern
    expect(scales).toContain('phrygian dominant');
  });

  it('should have valid interval arrays', () => {
    Object.entries(EXOTIC_SCALES).forEach(([name, intervals]) => {
      expect(Array.isArray(intervals)).toBe(true);
      expect(intervals.length).toBeGreaterThan(0);
      expect(intervals.length).toBeLessThanOrEqual(12);

      // First interval should be root
      expect(intervals[0]).toBe('1P');
    });
  });
});
