'use client';

import { createTheoryCore } from '@/lib/theory-core';
import { useState, useEffect } from 'react';

/**
 * Common chords to display (50 chords covering various types)
 */
const COMMON_CHORDS = [
  // Major chords
  'C', 'D', 'E', 'F', 'G', 'A', 'B',
  'Bb', 'Eb', 'Ab', 'Db', 'Gb',

  // Minor chords
  'Cm', 'Dm', 'Em', 'Fm', 'Gm', 'Am', 'Bm',

  // Seventh chords
  'C7', 'D7', 'E7', 'F7', 'G7', 'A7', 'B7',

  // Major seventh chords
  'Cmaj7', 'Dmaj7', 'Emaj7', 'Fmaj7', 'Gmaj7', 'Amaj7', 'Bmaj7',

  // Minor seventh chords
  'Cm7', 'Dm7', 'Em7', 'Fm7', 'Gm7', 'Am7', 'Bm7',

  // Suspended chords
  'Csus2', 'Dsus2', 'Asus2', 'Dsus4', 'Asus4', 'Esus4',

  // Diminished and Augmented
  'Edim', 'Caug',
];

interface ChordDisplay {
  symbol: string;
  svg: string | null;
  fingeringCount: number;
}

export default function GuitarChordsPage() {
  const [chords, setChords] = useState<ChordDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const theory = createTheoryCore();

    const chordData = COMMON_CHORDS.map(symbol => {
      const svg = theory.generateChordDiagram(symbol, {
        width: 160,
        height: 200,
        fretCount: 5,
      });

      const fingerings = theory.getChordFingerings(symbol);

      return {
        symbol,
        svg,
        fingeringCount: fingerings.length,
      };
    });

    setChords(chordData);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Loading Guitar Chords...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Guitar Chord Library
          </h1>
          <p className="text-lg text-gray-600">
            {chords.length} common guitar chords with fingering diagrams
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Powered by TheoryCore guitar-chords module
          </p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {chords.map((chord) => (
            <div
              key={chord.symbol}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="text-center mb-3">
                <h2 className="text-2xl font-bold text-gray-800">
                  {chord.symbol}
                </h2>
                <p className="text-xs text-gray-500">
                  {chord.fingeringCount} voicing{chord.fingeringCount !== 1 ? 's' : ''}
                </p>
              </div>

              {chord.svg ? (
                <div
                  className="flex justify-center"
                  dangerouslySetInnerHTML={{ __html: chord.svg }}
                />
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                  No diagram available
                </div>
              )}
            </div>
          ))}
        </div>

        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              <strong>Note:</strong> Diagrams show placeholder information.
              Full fretboard rendering with SVGuitar integration coming soon.
            </p>
            <p>
              Each chord displays: chord symbol, position, fret positions for each string,
              and barre information where applicable.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
