"use client";

interface TonicTableProps {
  selectedTonic: string;
  onTonicChange: (tonic: string) => void;
}

/**
 * TonicTable - Displays the list of tonic notes for selection.
 * White rows are classic key signatures, gray rows are less common.
 */
export function TonicTable({ selectedTonic, onTonicChange }: TonicTableProps) {
  // Classic key signatures (white background)
  const classicTonics = ['B', 'E', 'A', 'D', 'G', 'C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];

  // Less common tonics (gray background)
  const rareTonics = ['B#', 'E#', 'A#', 'D#', 'G#', 'C#', 'F#'];

  const allTonics = [...classicTonics, ...rareTonics];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: '120px' }}>
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
        Tonic
      </div>
      <div
        style={{
          border: '1px solid #333',
          maxHeight: '400px',
          overflowY: 'auto',
        }}
      >
        {allTonics.map((tonic) => {
          const isRare = rareTonics.includes(tonic);
          const isSelected = tonic === selectedTonic;

          return (
            <div
              key={tonic}
              onClick={() => onTonicChange(tonic)}
              style={{
                padding: '0.5rem',
                background: isSelected
                  ? '#FFA500'
                  : isRare
                  ? '#E0E0E0'
                  : 'white',
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
                  e.currentTarget.style.background = isRare ? '#E0E0E0' : 'white';
                }
              }}
            >
              {tonic}
            </div>
          );
        })}
      </div>
    </div>
  );
}
