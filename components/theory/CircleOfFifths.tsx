"use client";

import { useState, useMemo } from 'react';
import { CircleView } from './CircleView';
import { TonicTable } from './TonicTable';
import { ModeTable } from './ModeTable';
import { createTheoryCore } from '@/lib/theory-core';
import type { BlockKey } from '@/state/theory.types';

interface CircleOfFifthsProps {
  initialKey?: BlockKey;
}

/**
 * Interactive Circle of Fifths - Main Container
 *
 * Combines CircleView, TonicTable, and ModeTable with rotation logic.
 * Demonstrates the theory engine's circle capabilities.
 */
export function CircleOfFifths({ initialKey }: CircleOfFifthsProps) {
  const [key, setKey] = useState<BlockKey>(
    initialKey || {
      tonic: 'C',
      mode: 'major',
    }
  );

  const theoryCore = useMemo(() => createTheoryCore(), []);

  // Get circle data from theory engine
  const circleData = useMemo(() => {
    return theoryCore.getCircleData(key);
  }, [theoryCore, key]);

  // Handle tonic change
  const handleTonicChange = (tonic: string) => {
    setKey((prev) => ({ ...prev, tonic }));
  };

  // Handle mode change
  const handleModeChange = (mode: BlockKey['mode']) => {
    setKey((prev) => ({ ...prev, mode }));
  };

  // Handle drag rotation from tonic table
  const handleTonicDragRotate = (direction: 'up' | 'down') => {
    const rotateDirection = direction === 'up' ? 'clockwise' : 'counterclockwise';
    const newKey = theoryCore.rotateCircle(key, rotateDirection, 'tonic');
    setKey(newKey);
  };

  // Handle drag rotation from mode table
  const handleModeDragRotate = (direction: 'up' | 'down') => {
    const rotateDirection = direction === 'up' ? 'clockwise' : 'counterclockwise';
    const newKey = theoryCore.rotateCircle(key, rotateDirection, 'mode');
    setKey(newKey);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Circle of Fifths</h1>
        <p style={{ color: '#666', marginTop: 0 }}>
          Interactive music theory visualization. Click to select, drag to rotate.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '150px 1fr 150px',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        {/* Tonic Table */}
        <div>
          <TonicTable
            selectedTonic={key.tonic}
            onTonicChange={handleTonicChange}
            onDragRotate={handleTonicDragRotate}
          />
        </div>

        {/* Circle Visualization */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircleView circleData={circleData} />

          {/* Info Panel */}
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#f5f5f5',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '500px',
            }}
          >
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Current Key:</strong> {key.tonic} {key.mode}
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Diatonic Notes:</strong> {circleData.diatonicNotes.join(', ')}
              </div>
              <div>
                <strong>Scale Degrees:</strong>{' '}
                {circleData.degrees.map((d) => d.roman).join(' - ')}
              </div>
            </div>
          </div>
        </div>

        {/* Mode Table */}
        <div>
          <ModeTable
            selectedMode={key.mode}
            onModeChange={handleModeChange}
            onDragRotate={handleModeDragRotate}
          />
        </div>
      </div>

      {/* Instructions */}
      <div
        style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#E3F2FD',
          borderRadius: '8px',
          borderLeft: '4px solid #2196F3',
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1rem' }}>
          How to Use:
        </h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.875rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Click</strong> a tonic or mode to change keys
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Drag up</strong> in either table to add sharps (rotate clockwise)
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Drag down</strong> in either table to add flats (rotate counterclockwise)
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Note Ring (outer):</strong> Shows the 7 diatonic notes for this key
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Degree Ring (middle):</strong> Shows scale degrees with tonic marked by arrow
          </li>
          <li>
            <strong>Chord Ring (inner):</strong> Shows chord qualities for each degree
          </li>
        </ul>
      </div>
    </div>
  );
}
