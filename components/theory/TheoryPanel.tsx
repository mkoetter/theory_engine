"use client";

import { useState } from 'react';
import { useTheory } from '@/state/useTheory';
import { PalettePanel } from './PalettePanel';
import { ProgressionTimeline } from './ProgressionTimeline';
import type { Block } from '@/state/theory.types';

interface TheoryPanelProps {
  initialBlock: Block;
}

/**
 * Main container for the theory assistant UI.
 * Manages block state and coordinates between palette and timeline.
 */
export function TheoryPanel({ initialBlock }: TheoryPanelProps) {
  const [block, setBlock] = useState<Block>(initialBlock);

  // Use the theory hook to get all functionality
  const { palette, analysis, absoluteChords, classifyChord } = useTheory(block);

  // Add a chord to the progression
  const handleAddToProgression = (roman: string) => {
    setBlock((prev) => ({
      ...prev,
      progression: [
        ...prev.progression,
        {
          roman,
          bars: 1,
          origin: classifyChord(roman).origin,
        },
      ],
    }));
  };

  // Remove a chord from the progression
  const handleRemoveChord = (index: number) => {
    setBlock((prev) => ({
      ...prev,
      progression: prev.progression.filter((_, idx) => idx !== index),
    }));
  };

  // Update key
  const handleKeyChange = (tonic: string) => {
    setBlock((prev) => ({
      ...prev,
      key: { ...prev.key, tonic },
      progression: [], // Clear progression when changing key
    }));
  };

  // Update mode
  const handleModeChange = (mode: Block['key']['mode']) => {
    setBlock((prev) => ({
      ...prev,
      key: { ...prev.key, mode },
      progression: [], // Clear progression when changing mode
    }));
  };

  // Toggle seventh chords
  const handleToggleSevenths = () => {
    setBlock((prev) => ({
      ...prev,
      palette: {
        ...prev.palette,
        includeSevenths: !prev.palette.includeSevenths,
      },
    }));
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Theory Engine</h1>
        <p style={{ color: '#666', marginTop: 0 }}>
          Build chord progressions using roman numeral analysis
        </p>
      </div>

      {/* Key and Mode Controls */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          padding: '1rem',
          background: '#f5f5f5',
          borderRadius: '8px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
            Key:
          </label>
          <select
            value={block.key.tonic}
            onChange={(e) => handleKeyChange(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '0.875rem',
            }}
          >
            {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
            Mode:
          </label>
          <select
            value={block.key.mode}
            onChange={(e) => handleModeChange(e.target.value as Block['key']['mode'])}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '0.875rem',
            }}
          >
            <option value="major">Major</option>
            <option value="minor">Minor</option>
            <option value="dorian">Dorian</option>
            <option value="phrygian">Phrygian</option>
            <option value="lydian">Lydian</option>
            <option value="mixolydian">Mixolydian</option>
            <option value="aeolian">Aeolian</option>
            <option value="locrian">Locrian</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
            Section:
          </label>
          <select
            value={block.role}
            onChange={(e) =>
              setBlock((prev) => ({ ...prev, role: e.target.value as Block['role'] }))
            }
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '0.875rem',
            }}
          >
            <option value="Intro">Intro</option>
            <option value="Verse">Verse</option>
            <option value="Pre">Pre-Chorus</option>
            <option value="Chorus">Chorus</option>
            <option value="Bridge">Bridge</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <label style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={block.palette.includeSevenths}
              onChange={handleToggleSevenths}
              style={{ marginRight: '0.5rem' }}
            />
            Include 7th chords
          </label>
        </div>
      </div>

      {/* Progression Timeline */}
      <div style={{ marginBottom: '2rem' }}>
        <ProgressionTimeline
          block={block}
          absoluteChords={absoluteChords}
          analysis={analysis}
          onRemoveChord={handleRemoveChord}
        />
      </div>

      {/* Chord Palette */}
      <div>
        <PalettePanel
          block={block}
          palette={palette}
          onAddToProgression={handleAddToProgression}
          classifyChord={classifyChord}
        />
      </div>

      {/* Export Section (Placeholder) */}
      <div
        style={{
          marginTop: '2rem',
          padding: '1rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
          background: '#f9f9f9',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Export (Coming Soon)</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            disabled
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: '1px solid #ddd',
              background: '#e0e0e0',
              cursor: 'not-allowed',
              fontSize: '0.875rem',
            }}
          >
            Export MIDI
          </button>
          <button
            disabled
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: '1px solid #ddd',
              background: '#e0e0e0',
              cursor: 'not-allowed',
              fontSize: '0.875rem',
            }}
          >
            Export Chord Chart
          </button>
        </div>
      </div>
    </div>
  );
}
