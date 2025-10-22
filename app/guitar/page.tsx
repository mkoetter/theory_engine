'use client';

import { createTheoryCore } from '@/lib/theory-core';
import { useState, useEffect } from 'react';

/**
 * Organized chord library with categories
 */
const CHORD_LIBRARY = {
  'Open Position': [
    'C', 'D', 'E', 'G', 'A',
    'Em', 'Am', 'Dm',
    'C7', 'D7', 'E7', 'G7', 'A7',
    'Cmaj7', 'Dmaj7', 'Emaj7', 'Gmaj7', 'Amaj7',
  ],
  'Barre Chords': [
    'F', 'Fm', 'F7', 'Fmaj7', 'Fm7',
    'Bb', 'Bm', 'B7', 'Bmaj7', 'Bm7',
    'Eb', 'Gm', 'Cm',
    'Ab', 'Db', 'Gb',
  ],
  'Seventh Chords': [
    'C7', 'D7', 'E7', 'F7', 'G7', 'A7', 'B7',
    'Cmaj7', 'Dmaj7', 'Emaj7', 'Fmaj7', 'Gmaj7', 'Amaj7', 'Bmaj7',
    'Cm7', 'Dm7', 'Em7', 'Fm7', 'Gm7', 'Am7', 'Bm7',
  ],
  'Sus & Special': [
    'Csus2', 'Dsus2', 'Asus2',
    'Dsus4', 'Asus4', 'Esus4',
    'Edim', 'Caug',
  ],
};

// Flatten all chords for display
const ALL_CHORDS = Array.from(
  new Set(Object.values(CHORD_LIBRARY).flat())
);

interface ChordDisplay {
  symbol: string;
  svg: string | null;
  fingeringCount: number;
}

export default function GuitarChordsPage() {
  const [chords, setChords] = useState<ChordDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Chords');

  useEffect(() => {
    const theory = createTheoryCore();

    const chordData = ALL_CHORDS.map(symbol => {
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

  // Filter chords by category
  const filteredChords = selectedCategory === 'All Chords'
    ? chords
    : chords.filter(chord =>
        CHORD_LIBRARY[selectedCategory as keyof typeof CHORD_LIBRARY]?.includes(chord.symbol)
      );

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
            {chords.length} chords with interactive fingering diagrams
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Root notes highlighted in <span className="font-semibold" style={{ color: '#D4A574' }}>gold</span> • Powered by TheoryCore
          </p>
        </header>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['All Chords', ...Object.keys(CHORD_LIBRARY)].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredChords.length} chord{filteredChords.length !== 1 ? 's' : ''}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredChords.map((chord) => (
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
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>Diagram Features:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Root notes highlighted in <span className="font-semibold" style={{ color: '#D4A574' }}>gold color</span></li>
              <li>Open position chords start from the nut (fret 0)</li>
              <li>Barre chords shown with rounded bars and finger numbers</li>
              <li>Open strings (○) and muted strings (×) clearly marked</li>
              <li>Finger numbers displayed on fretted notes</li>
            </ul>
            <p className="mt-4">
              <strong>Categories:</strong> Use the filter buttons above to view specific chord types including dedicated barre chord section.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
