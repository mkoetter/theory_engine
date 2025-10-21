"use client";

import type { BlockKey, CircleOfFifthsData } from '@/state/theory.types';

interface CircleViewProps {
  circleData: CircleOfFifthsData;
  currentKey: BlockKey;
}

/**
 * CircleView - Renders the three concentric rings of the Circle of Fifths.
 *
 * Three rings (from inner to outer):
 * 1. Degree Ring - Roman numeral scale degrees with tonic arrow
 * 2. Note Ring - 12 chromatic notes (diatonic = white, chromatic = gray)
 * 3. Chord Ring - Chord qualities (major/minor/diminished)
 */
export function CircleView({ circleData, currentKey }: CircleViewProps) {
  const { notes, degrees, chordQualities, tonicPosition } = circleData;

  // SVG dimensions
  const centerX = 300;
  const centerY = 300;
  const outerRadius = 280;
  const noteRingRadius = 200;
  const degreeRingRadius = 120;
  const innerRadius = 40;

  // Calculate angle for each position (12 positions, starting at top)
  const angleStep = (2 * Math.PI) / 12;
  const startAngle = -Math.PI / 2; // Start at 12 o'clock

  /**
   * Get polar coordinates for a position on the circle.
   */
  const getPolarPoint = (position: number, radius: number) => {
    const angle = startAngle + position * angleStep;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  /**
   * Create SVG path for a ring segment.
   */
  const createSegmentPath = (
    position: number,
    innerRad: number,
    outerRad: number
  ): string => {
    const angle1 = startAngle + position * angleStep;
    const angle2 = startAngle + (position + 1) * angleStep;

    const x1Outer = centerX + outerRad * Math.cos(angle1);
    const y1Outer = centerY + outerRad * Math.sin(angle1);
    const x2Outer = centerX + outerRad * Math.cos(angle2);
    const y2Outer = centerY + outerRad * Math.sin(angle2);

    const x1Inner = centerX + innerRad * Math.cos(angle1);
    const y1Inner = centerY + innerRad * Math.sin(angle1);
    const x2Inner = centerX + innerRad * Math.cos(angle2);
    const y2Inner = centerY + innerRad * Math.sin(angle2);

    return `
      M ${x1Outer} ${y1Outer}
      A ${outerRad} ${outerRad} 0 0 1 ${x2Outer} ${y2Outer}
      L ${x2Inner} ${y2Inner}
      A ${innerRad} ${innerRad} 0 0 0 ${x1Inner} ${y1Inner}
      Z
    `;
  };

  /**
   * Get color for chord quality.
   */
  const getChordQualityColor = (quality: string): string => {
    switch (quality) {
      case 'major':
        return '#FFB6C1'; // Light pink/red
      case 'minor':
        return '#87CEEB'; // Light blue
      case 'diminished':
        return '#90EE90'; // Light green
      case 'augmented':
        return '#DDA0DD'; // Light purple
      default:
        return '#E0E0E0';
    }
  };

  /**
   * Get label for chord quality.
   */
  const getChordQualityLabel = (quality: string): string => {
    switch (quality) {
      case 'major':
        return 'MAJOR';
      case 'minor':
        return 'MINOR';
      case 'diminished':
        return 'DIMINISHED';
      case 'augmented':
        return 'AUGMENTED';
      default:
        return '';
    }
  };

  return (
    <svg
      width="600"
      height="600"
      viewBox="0 0 600 600"
      style={{ border: '1px solid #ddd', borderRadius: '8px', background: 'white' }}
    >
      {/* Chord Ring (Outer) - Always 12 segments */}
      {Array.from({ length: 12 }).map((_, position) => {
        // Find if there's a chord quality for this position
        const chord = chordQualities.find((c) => c.position === position);

        return (
          <g key={`chord-${position}`}>
            <path
              d={createSegmentPath(position, noteRingRadius + 10, outerRadius)}
              fill={chord ? getChordQualityColor(chord.quality) : '#E0E0E0'}
              stroke="#333"
              strokeWidth="1"
            />
            {chord && (
              <text
                x={getPolarPoint(position + 0.5, (noteRingRadius + outerRadius) / 2).x}
                y={getPolarPoint(position + 0.5, (noteRingRadius + outerRadius) / 2).y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontWeight="600"
                fill="#333"
              >
                {getChordQualityLabel(chord.quality)}
              </text>
            )}
          </g>
        );
      })}

      {/* Note Ring (Middle) */}
      {notes.map((note, idx) => (
        <g key={`note-${idx}-${note.position}`}>
          <path
            d={createSegmentPath(note.position, degreeRingRadius + 10, noteRingRadius)}
            fill={note.isDiatonic ? 'white' : '#E0E0E0'}
            stroke="#333"
            strokeWidth="2"
          />
          <text
            x={getPolarPoint(note.position + 0.5, (degreeRingRadius + noteRingRadius) / 2 + 10).x}
            y={getPolarPoint(note.position + 0.5, (degreeRingRadius + noteRingRadius) / 2 + 10).y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="24"
            fontWeight="bold"
            fill="#000"
          >
            {note.note}
          </text>
        </g>
      ))}

      {/* Degree Ring (Inner) - Always 12 segments */}
      {Array.from({ length: 12 }).map((_, position) => {
        // Find if there's a degree for this position
        const degree = degrees.find((d) => d.position === position);

        return (
          <g key={`degree-${position}`}>
            <path
              d={createSegmentPath(position, innerRadius, degreeRingRadius)}
              fill="white"
              stroke="#333"
              strokeWidth="1"
            />
            {degree && (
              <>
                <text
                  x={getPolarPoint(position + 0.5, (innerRadius + degreeRingRadius) / 2).x}
                  y={getPolarPoint(position + 0.5, (innerRadius + degreeRingRadius) / 2).y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="16"
                  fontWeight="600"
                  fill="#000"
                >
                  {degree.roman}
                </text>

                {/* Tonic arrow */}
                {degree.isTonic && (
                  <polygon
                    points={`
                      ${getPolarPoint(position + 0.5, innerRadius - 15).x},${getPolarPoint(position + 0.5, innerRadius - 15).y}
                      ${getPolarPoint(position + 0.5, innerRadius - 25).x - 5},${getPolarPoint(position + 0.5, innerRadius - 25).y}
                      ${getPolarPoint(position + 0.5, innerRadius - 25).x + 5},${getPolarPoint(position + 0.5, innerRadius - 25).y}
                    `}
                    fill="black"
                  />
                )}
              </>
            )}
          </g>
        );
      })}

      {/* Center circle */}
      <circle cx={centerX} cy={centerY} r={innerRadius} fill="white" stroke="#333" strokeWidth="2" />

      {/* Key label in center */}
      <text
        x={centerX}
        y={centerY}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="20"
        fontWeight="bold"
        fill="#000"
      >
        {currentKey.tonic}
      </text>
      <text
        x={centerX}
        y={centerY + 20}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="12"
        fill="#666"
      >
        {currentKey.mode}
      </text>
    </svg>
  );
}
