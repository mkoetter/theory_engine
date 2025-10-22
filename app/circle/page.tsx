"use client";

import { useState, useMemo, useEffect } from 'react';
import { CircleView } from '@/components/theory/CircleView';
import { TonicTable } from '@/components/theory/TonicTable';
import { ModeTable } from '@/components/theory/ModeTable';
import { createTheoryCore } from '@/lib/theory-core';
import type { BlockKey } from '@/state/theory.types';

/**
 * Interactive Circle of Fifths page.
 * Displays the three-ring circle visualization with tonic and mode selection.
 */
export default function CirclePage() {
  const [currentKey, setCurrentKey] = useState<BlockKey>({
    tonic: 'C',
    mode: 'major',
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const theoryCore = useMemo(() => createTheoryCore(), []);

  // Get circle data for current key
  const circleData = useMemo(() => {
    return theoryCore.getCircleOfFifthsData(currentKey);
  }, [theoryCore, currentKey]);

  const handleTonicChange = (tonic: string) => {
    setCurrentKey((prev) => ({ ...prev, tonic }));
  };

  const handleModeChange = (mode: BlockKey['mode']) => {
    setCurrentKey((prev) => ({ ...prev, mode }));
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>
          Interactive Circle of Fifths
        </h1>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>
          Visualize key relationships and diatonic chord qualities
        </p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Left panel: Tonic and Mode tables */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <TonicTable
            selectedTonic={currentKey.tonic}
            onTonicChange={handleTonicChange}
          />
          <ModeTable
            selectedMode={currentKey.mode}
            onModeChange={handleModeChange}
          />
        </div>

        {/* Right panel: Circle visualization */}
        <div>
          {mounted ? (
            <CircleView circleData={circleData} currentKey={currentKey} />
          ) : (
            <div style={{ width: '600px', height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd', borderRadius: '8px' }}>
              Loading circle...
            </div>
          )}

          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#f5f5f5',
              borderRadius: '8px',
              fontSize: '0.875rem',
            }}
          >
            <h3 style={{ marginTop: 0, fontSize: '1rem' }}>Current Key</h3>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Tonic:</strong> {currentKey.tonic}
            </p>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Mode:</strong> {currentKey.mode}
            </p>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Diatonic Notes:</strong>{' '}
              {circleData.notes
                .filter((n) => n.isDiatonic)
                .map((n) => n.note)
                .join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* Info panel */}
      <div
        style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginTop: 0 }}>How to Use</h3>
        <ul style={{ lineHeight: '1.6' }}>
          <li>
            <strong>Tonic:</strong> Click a note in the Tonic table to change the tonic/root note
          </li>
          <li>
            <strong>Mode:</strong> Click a mode in the Mode table to change the scale mode
          </li>
          <li>
            <strong>Degree Ring (Inner):</strong> Shows Roman numeral scale degrees. The arrow
            points to the tonic.
          </li>
          <li>
            <strong>Note Ring (Middle):</strong> Shows all 12 chromatic notes. White = diatonic to
            the key, Gray = chromatic.
          </li>
          <li>
            <strong>Chord Ring (Outer):</strong> Shows chord qualities for diatonic triads
            (Major/Minor/Diminished).
          </li>
        </ul>
      </div>
    </main>
  );
}
