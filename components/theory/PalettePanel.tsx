"use client";

import type { Block } from '@/state/theory.types';

interface PalettePanelProps {
  block: Block;
  palette: string[];
  onAddToProgression: (roman: string) => void;
  classifyChord: (roman: string) => { origin: string; quality: string };
}

/**
 * Display the chord palette for a block with add-to-progression actions.
 */
export function PalettePanel({
  block,
  palette,
  onAddToProgression,
  classifyChord,
}: PalettePanelProps) {
  const getOriginColor = (origin: string) => {
    switch (origin) {
      case 'diatonic':
        return '#4CAF50';
      case 'borrowed':
        return '#FF9800';
      case 'secondary':
        return '#2196F3';
      case 'chromatic-mediant':
        return '#9C27B0';
      default:
        return '#757575';
    }
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0 }}>
        Chord Palette: {block.key.tonic} {block.key.mode}
      </h3>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontSize: '0.875rem', color: '#666' }}>
          <input
            type="checkbox"
            checked={block.palette.includeSevenths}
            onChange={() => {}}
            disabled
            style={{ marginRight: '0.5rem' }}
          />
          Include 7th chords
        </label>
      </div>

      {palette.length === 0 ? (
        <p style={{ color: '#999', fontStyle: 'italic' }}>
          No chords available. Check key configuration.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: '0.5rem',
          }}
        >
          {palette.map((chord, idx) => {
            // Try to derive roman numeral for classification
            // This is simplified - full implementation would track romans properly
            const romanNumeral = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'][idx] || 'I';
            const classification = classifyChord(romanNumeral);

            return (
              <button
                key={`${chord}-${idx}`}
                onClick={() => onAddToProgression(romanNumeral)}
                style={{
                  padding: '0.75rem 0.5rem',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  borderLeftColor: getOriginColor(classification.origin),
                  borderLeftWidth: '4px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = getOriginColor(classification.origin);
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#ddd';
                  e.currentTarget.style.borderLeftColor = getOriginColor(classification.origin);
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                title={`${chord} (${classification.origin})`}
              >
                <div style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>
                  {romanNumeral}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666' }}>{chord}</div>
              </button>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f5f5f5', borderRadius: '4px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Origin Legend:
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#4CAF50', borderRadius: '2px' }} />
            <span>Diatonic</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#FF9800', borderRadius: '2px' }} />
            <span>Borrowed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#2196F3', borderRadius: '2px' }} />
            <span>Secondary</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#9C27B0', borderRadius: '2px' }} />
            <span>Chromatic</span>
          </div>
        </div>
      </div>
    </div>
  );
}
