"use client";

import { useState } from 'react';
import { CIRCLE_OF_FIFTHS_ORDER, getClassicKeySignatures } from '@/lib/theory-core';

interface TonicTableProps {
  selectedTonic: string;
  onTonicChange: (tonic: string) => void;
  onDragRotate: (direction: 'up' | 'down') => void;
}

/**
 * Tonic selection table with drag-to-rotate.
 * White rows = 15 classic key signatures
 * Gray rows = less common enharmonic keys
 */
export function TonicTable({ selectedTonic, onTonicChange, onDragRotate }: TonicTableProps) {
  const [dragStart, setDragStart] = useState<number | null>(null);

  const classicKeys = getClassicKeySignatures();
  const allKeys = CIRCLE_OF_FIFTHS_ORDER;

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStart(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStart === null) return;

    const delta = dragStart - e.clientY;
    if (Math.abs(delta) > 30) {
      // Drag up = clockwise (add sharps)
      // Drag down = counterclockwise (add flats)
      onDragRotate(delta > 0 ? 'up' : 'down');
      setDragStart(e.clientY);
    }
  };

  const handleMouseUp = () => {
    setDragStart(null);
  };

  return (
    <div
      style={{
        border: '2px solid #333',
        borderRadius: '8px',
        overflow: 'hidden',
        userSelect: 'none',
        cursor: dragStart !== null ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        style={{
          background: '#333',
          color: 'white',
          padding: '0.5rem',
          textAlign: 'center',
          fontWeight: '600',
          fontSize: '0.875rem',
        }}
      >
        Tonic
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {allKeys.map((tonic) => {
          const isClassic = classicKeys.includes(tonic);
          const isSelected = tonic === selectedTonic;

          return (
            <div
              key={tonic}
              onClick={() => onTonicChange(tonic)}
              style={{
                padding: '0.5rem 1rem',
                background: isSelected
                  ? '#2196F3'
                  : isClassic
                  ? 'white'
                  : '#e0e0e0',
                color: isSelected ? 'white' : '#333',
                borderBottom: '1px solid #ddd',
                cursor: 'pointer',
                fontWeight: isSelected ? '600' : '400',
                fontSize: '0.875rem',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = isClassic ? '#f5f5f5' : '#d0d0d0';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = isClassic ? 'white' : '#e0e0e0';
                }
              }}
            >
              {tonic}
            </div>
          );
        })}
      </div>

      <div
        style={{
          padding: '0.5rem',
          background: '#f5f5f5',
          fontSize: '0.75rem',
          color: '#666',
          textAlign: 'center',
          borderTop: '1px solid #ddd',
        }}
      >
        Drag ↑ = sharps, ↓ = flats
      </div>
    </div>
  );
}
