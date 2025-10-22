'use client';

import { createTheoryCore } from '@/lib/theory-core';
import { useEffect, useState } from 'react';

export default function TestGuitarPage() {
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    const theory = createTheoryCore();
    const testChords = ['C', 'Cmaj7', 'Am', 'D', 'G'];

    const results = testChords.map(symbol => {
      const fingerings = theory.getChordFingerings(symbol);
      const svg = theory.generateChordDiagram(symbol);

      return {
        symbol,
        fingeringCount: fingerings.length,
        fingerings: fingerings,
        svg: svg,
        svgLength: svg?.length || 0,
      };
    });

    setTestResults(results);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Guitar Chords Debug Test</h1>

      {testResults.map((result, idx) => (
        <div key={idx} className="mb-8 p-4 border rounded">
          <h2 className="text-xl font-bold">{result.symbol}</h2>
          <p>Fingering count: {result.fingeringCount}</p>
          <p>SVG generated: {result.svg ? 'Yes' : 'No'}</p>
          <p>SVG length: {result.svgLength}</p>

          {result.fingerings.length > 0 && (
            <div className="mt-2">
              <strong>First fingering:</strong>
              <pre className="text-xs bg-gray-100 p-2 mt-1">
                {JSON.stringify(result.fingerings[0], null, 2)}
              </pre>
            </div>
          )}

          {result.svg && (
            <div className="mt-4">
              <strong>SVG Preview:</strong>
              <div dangerouslySetInnerHTML={{ __html: result.svg }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
