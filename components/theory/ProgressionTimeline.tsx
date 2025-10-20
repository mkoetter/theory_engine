"use client";

import type { Block, FunctionalLabel } from '@/state/theory.types';

interface ProgressionTimelineProps {
  block: Block;
  absoluteChords: string[];
  analysis: {
    functions: FunctionalLabel[];
    cadenceHints: string[];
  };
  onRemoveChord: (index: number) => void;
}

/**
 * Display the chord progression as a timeline with functional labels.
 */
export function ProgressionTimeline({
  block,
  absoluteChords,
  analysis,
  onRemoveChord,
}: ProgressionTimelineProps) {
  const getFunctionColor = (func: FunctionalLabel) => {
    switch (func) {
      case 'T':
        return '#4CAF50'; // Tonic - green
      case 'SD':
        return '#FF9800'; // Subdominant - orange
      case 'D':
        return '#2196F3'; // Dominant - blue
      default:
        return '#757575';
    }
  };

  const getFunctionLabel = (func: FunctionalLabel) => {
    switch (func) {
      case 'T':
        return 'Tonic';
      case 'SD':
        return 'Subdominant';
      case 'D':
        return 'Dominant';
      default:
        return 'Unknown';
    }
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Progression</h3>
        <div style={{ fontSize: '0.875rem', color: '#666' }}>
          {block.progression.length} chord{block.progression.length !== 1 ? 's' : ''}
        </div>
      </div>

      {block.progression.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#999', fontStyle: 'italic' }}>
          No chords in progression. Add chords from the palette above.
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              overflowX: 'auto',
              paddingBottom: '1rem',
            }}
          >
            {block.progression.map((item, idx) => {
              const func = analysis.functions[idx] || 'T';
              const absoluteChord = absoluteChords[idx] || '?';

              return (
                <div
                  key={`${item.roman}-${idx}`}
                  style={{
                    minWidth: '120px',
                    padding: '1rem',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    background: 'white',
                    position: 'relative',
                    borderTopColor: getFunctionColor(func),
                    borderTopWidth: '4px',
                  }}
                >
                  <button
                    onClick={() => onRemoveChord(idx)}
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      lineHeight: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Remove chord"
                  >
                    ×
                  </button>

                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                      {item.roman}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      {absoluteChord}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: getFunctionColor(func),
                      fontWeight: '600',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {func} - {getFunctionLabel(func)}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#999' }}>
                    {item.bars} bar{item.bars !== 1 ? 's' : ''}
                  </div>

                  {item.origin && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        fontSize: '0.7rem',
                        color: '#666',
                        background: '#f5f5f5',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                      }}
                    >
                      {item.origin}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {analysis.cadenceHints.length > 0 && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: '#E3F2FD',
                borderRadius: '4px',
                borderLeft: '4px solid #2196F3',
              }}
            >
              <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Cadence Hints:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.875rem' }}>
                {analysis.cadenceHints.map((hint, idx) => (
                  <li key={idx}>{hint}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f5f5f5', borderRadius: '4px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Function Legend:
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#4CAF50', borderRadius: '2px' }} />
            <span>T (Tonic) - Stable/Home</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#FF9800', borderRadius: '2px' }} />
            <span>SD (Subdominant) - Moving Away</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#2196F3', borderRadius: '2px' }} />
            <span>D (Dominant) - Tension/Return</span>
          </div>
        </div>
      </div>
    </div>
  );
}
