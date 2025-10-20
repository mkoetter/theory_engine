"use client";

import type { BlockKey } from '@/state/theory.types';

interface ModeTableProps {
  selectedMode: BlockKey['mode'];
  onModeChange: (mode: BlockKey['mode']) => void;
}

/**
 * ModeTable - Displays the list of modes for selection.
 */
export function ModeTable({ selectedMode, onModeChange }: ModeTableProps) {
  const modes: Array<{ value: BlockKey['mode']; label: string }> = [
    { value: 'lydian', label: 'Lydian' },
    { value: 'major', label: 'Major / Ionian' },
    { value: 'mixolydian', label: 'Mixolydian' },
    { value: 'dorian', label: 'Dorian' },
    { value: 'minor', label: 'N. Minor / Aeolian' },
    { value: 'phrygian', label: 'Phrygian' },
    { value: 'locrian', label: 'Locrian' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: '180px' }}>
      <div
        style={{
          padding: '0.5rem',
          background: '#000',
          color: 'white',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '0.875rem',
        }}
      >
        Mode
      </div>
      <div style={{ border: '1px solid #333' }}>
        {modes.map(({ value, label }) => {
          const isSelected = value === selectedMode;

          return (
            <div
              key={value}
              onClick={() => onModeChange(value)}
              style={{
                padding: '0.5rem',
                background: isSelected ? '#FFA500' : 'white',
                borderBottom: '1px solid #ddd',
                cursor: 'pointer',
                textAlign: 'center',
                fontWeight: isSelected ? 'bold' : 'normal',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = '#FFE4B5';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'white';
                }
              }}
            >
              {label}
            </div>
          );
        })}
      </div>

      <a
        href="#"
        style={{
          display: 'block',
          padding: '0.5rem',
          background: '#B0E0E6',
          textAlign: 'center',
          textDecoration: 'none',
          color: '#000',
          fontSize: '0.875rem',
          borderTop: '1px solid #333',
        }}
      >
        User's Guide
      </a>
    </div>
  );
}
