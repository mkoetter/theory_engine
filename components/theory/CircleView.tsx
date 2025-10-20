"use client";

import { useMemo } from 'react';
import type { BlockKey } from '@/state/theory.types';

interface CircleViewProps {
  circleData: {
    key: BlockKey;
    diatonicNotes: string[];
    degrees: Array<{ note: string; roman: string; degree: number }>;
    chordQualities: Array<{ note: string; quality: string; symbol: string }>;
    tonicIndex: number;
  };
}

/**
 * Circle of Fifths SVG Visualization
 *
 * Three concentric rings:
 * - Outer: Note Ring (diatonic notes)
 * - Middle: Degree Ring (roman numerals with tonic arrow)
 * - Inner: Chord Ring (chord qualities)
 */
export function CircleView({ circleData }: CircleViewProps) {
  const { diatonicNotes, degrees, chordQualities, tonicIndex } = circleData;

  // SVG dimensions
  const centerX = 250;
  const centerY = 250;
  const outerRadius = 200;
  const middleRadius = 150;
  const innerRadius = 100;

  // Calculate positions for 7 notes around the circle
  const positions = useMemo(() => {
    const angleStep = (2 * Math.PI) / 7;
    const startAngle = -Math.PI / 2; // Start at top

    return Array.from({ length: 7 }, (_, i) => {
      const angle = startAngle + i * angleStep;
      return {
        outer: {
          x: centerX + outerRadius * Math.cos(angle),
          y: centerY + outerRadius * Math.sin(angle),
        },
        middle: {
          x: centerX + middleRadius * Math.cos(angle),
          y: centerY + middleRadius * Math.sin(angle),
        },
        inner: {
          x: centerX + innerRadius * Math.cos(angle),
          y: centerY + innerRadius * Math.sin(angle),
        },
        angle,
      };
    });
  }, [centerX, centerY, outerRadius, middleRadius, innerRadius]);

  // Get color for chord quality
  const getChordColor = (quality: string) => {
    switch (quality) {
      case 'major': return '#4CAF50'; // Green
      case 'minor': return '#2196F3'; // Blue
      case 'diminished': return '#FF9800'; // Orange
      case 'augmented': return '#9C27B0'; // Purple
      default: return '#757575';
    }
  };

  return (
    <svg
      width="500"
      height="500"
      viewBox="0 0 500 500"
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      {/* Background */}
      <circle cx={centerX} cy={centerY} r={outerRadius + 20} fill="#f5f5f5" />

      {/* Ring backgrounds */}
      <circle cx={centerX} cy={centerY} r={outerRadius} fill="white" stroke="#ddd" strokeWidth="2" />
      <circle cx={centerX} cy={centerY} r={middleRadius} fill="#fafafa" stroke="#ddd" strokeWidth="2" />
      <circle cx={centerX} cy={centerY} r={innerRadius} fill="white" stroke="#ddd" strokeWidth="2" />

      {/* Radial dividers */}
      {positions.map((pos, i) => (
        <line
          key={`divider-${i}`}
          x1={centerX}
          y1={centerY}
          x2={pos.outer.x + (pos.outer.x - centerX) * 0.1}
          y2={pos.outer.y + (pos.outer.y - centerY) * 0.1}
          stroke="#ddd"
          strokeWidth="1"
        />
      ))}

      {/* Note Ring (Outer) */}
      {diatonicNotes.map((note, i) => {
        const pos = positions[i];
        return (
          <g key={`note-${i}`}>
            <circle
              cx={pos.outer.x}
              cy={pos.outer.y}
              r="25"
              fill="white"
              stroke="#333"
              strokeWidth="2"
            />
            <text
              x={pos.outer.x}
              y={pos.outer.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="18"
              fontWeight="600"
              fill="#333"
            >
              {note}
            </text>
          </g>
        );
      })}

      {/* Degree Ring (Middle) with Tonic Arrow */}
      {degrees.map((deg, i) => {
        const pos = positions[i];
        const isTonic = i === tonicIndex;

        return (
          <g key={`degree-${i}`}>
            <circle
              cx={pos.middle.x}
              cy={pos.middle.y}
              r="22"
              fill={isTonic ? '#000' : 'white'}
              stroke={isTonic ? '#000' : '#666'}
              strokeWidth="2"
            />
            <text
              x={pos.middle.x}
              y={pos.middle.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="14"
              fontWeight="600"
              fill={isTonic ? 'white' : '#333'}
            >
              {deg.roman}
            </text>

            {/* Tonic arrow */}
            {isTonic && (
              <g transform={`translate(${pos.middle.x}, ${pos.middle.y - 35})`}>
                <polygon
                  points="0,-10 -8,0 8,0"
                  fill="#000"
                />
              </g>
            )}
          </g>
        );
      })}

      {/* Chord Ring (Inner) */}
      {chordQualities.map((chord, i) => {
        const pos = positions[i];
        const color = getChordColor(chord.quality);

        return (
          <g key={`chord-${i}`}>
            <circle
              cx={pos.inner.x}
              cy={pos.inner.y}
              r="20"
              fill={color}
              stroke="#fff"
              strokeWidth="2"
            />
            <text
              x={pos.inner.x}
              y={pos.inner.y - 1}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="16"
              fontWeight="700"
              fill="white"
            >
              {chord.note}
            </text>
            <text
              x={pos.inner.x}
              y={pos.inner.y + 10}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="10"
              fontWeight="600"
              fill="white"
            >
              {chord.symbol}
            </text>
          </g>
        );
      })}

      {/* Center label */}
      <g>
        <text
          x={centerX}
          y={centerY - 10}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="24"
          fontWeight="700"
          fill="#333"
        >
          {circleData.key.tonic}
        </text>
        <text
          x={centerX}
          y={centerY + 15}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="14"
          fill="#666"
        >
          {circleData.key.mode}
        </text>
      </g>

      {/* Legend */}
      <g transform="translate(20, 430)">
        <text x="0" y="0" fontSize="12" fontWeight="600" fill="#333">
          Chord Qualities:
        </text>
        <circle cx="10" cy="15" r="6" fill="#4CAF50" />
        <text x="20" y="18" fontSize="11" fill="#666">Major</text>

        <circle cx="70" cy="15" r="6" fill="#2196F3" />
        <text x="80" y="18" fontSize="11" fill="#666">Minor</text>

        <circle cx="130" cy="15" r="6" fill="#FF9800" />
        <text x="140" y="18" fontSize="11" fill="#666">Dim</text>

        <circle cx="180" cy="15" r="6" fill="#9C27B0" />
        <text x="190" y="18" fontSize="11" fill="#666">Aug</text>
      </g>
    </svg>
  );
}
