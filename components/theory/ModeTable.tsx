"use client";

import { useState } from 'react';
import { MODE_ORDER } from '@/lib/theory-core';
import type { BlockKey } from '@/state/theory.types';

interface ModeTableProps {
  selectedMode: BlockKey['mode'];
  onModeChange: (mode: BlockKey['mode']) => void;
  onDragRotate: (direction: 'up' | 'down') => void;
}

/**
 * Mode selection table with drag-to-rotate.
 * Ordered from brightest (lydian) to darkest (locrian).
 */
export function ModeTable({ selectedMode, onModeChange, onDragRotate }: ModeTableProps) {
  const [dragStart, setDragStart] = useState<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStart(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStart === null) return;

    const delta = dragStart - e.clientY;
    if (Math.abs(delta) > 30) {
      // Drag up = brighter (add sharps)
      // Drag down = darker (add flats)
      onDragRotate(delta > 0 ? 'up' : 'down');
      setDragStart(e.clientY);
    }
  };

  const handleMouseUp = () => {
    setDragStart(null);
  };

  const getModeName = (mode: BlockKey['mode']) => {
    return mode.charAt(0).toUpperCase() + mode.slice(1);
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
        Mode
      </div>

      <div>
        {MODE_ORDER.map((mode) => {
          const isSelected = mode === selectedMode;

          return (
            <div
              key={mode}
              onClick={() => onModeChange(mode)}
              style={{
                padding: '0.5rem 1rem',
                background: isSelected ? '#2196F3' : 'white',
                color: isSelected ? 'white' : '#333',
                borderBottom: '1px solid #ddd',
                cursor: 'pointer',
                fontWeight: isSelected ? '600' : '400',
                fontSize: '0.875rem',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = '#f5f5f5';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'white';
                }
              }}
            >
              {getModeName(mode)}
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
        Drag ↑ = brighter, ↓ = darker
      </div>
    </div>
  );
}
