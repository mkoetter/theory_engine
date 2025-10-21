'use client';

import { useEffect, useState } from 'react';
import { createTheoryCore } from '@/lib/theory-core';

/**
 * Test API Page
 *
 * This page exposes the theory-core API to the browser window object
 * for Playwright E2E testing. It should NOT be included in production builds.
 */
export default function TestApiPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Expose theory-core API to window for testing
    try {
      if (typeof window !== 'undefined') {
        (window as any).theoryCore = createTheoryCore();
        (window as any).theoryApiReady = true;
        setReady(true);
        console.log('Theory API loaded successfully');
      }
    } catch (error) {
      console.error('Failed to load theory API:', error);
    }
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Theory Engine Test API</h1>
      {ready ? (
        <div data-testid="api-ready">✓ API Ready</div>
      ) : (
        <div>Loading...</div>
      )}
      <p>This page exposes the theory-core API to window.theoryCore for E2E testing.</p>
      <p>Check the browser console to access the API.</p>

      <h2>Available Methods:</h2>
      <ul>
        <li>window.theoryCore.parseExtendedChord(symbol)</li>
        <li>window.theoryCore.createSlashChord(chord, bass)</li>
        <li>window.theoryCore.validateChordSymbol(symbol)</li>
        <li>window.theoryCore.extendedRomanToAbsolute(roman, tonic)</li>
        <li>window.theoryCore.getChordVoicings(symbol, options)</li>
        <li>window.theoryCore.getExtendedChordNotes(extended, octave)</li>
      </ul>
    </div>
  );
}
