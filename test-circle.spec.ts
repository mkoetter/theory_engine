import { test, expect } from '@playwright/test';

test.describe('Circle of Fifths', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/circle');
    // Wait for the circle to be mounted
    await page.waitForTimeout(1000);
  });

  test('C Major should show correct chord qualities', async ({ page }) => {
    // Click C in tonic table
    await page.getByText('C', { exact: true }).first().click();

    // Click Major in mode table
    await page.getByText('Major / Ionian').click();

    await page.waitForTimeout(500);

    // Get all text elements from the SVG
    const chordLabels = await page.locator('svg text').allTextContents();

    console.log('C Major - All text in SVG:', chordLabels);

    // Count chord quality labels
    const majorCount = chordLabels.filter(t => t === 'MAJOR').length;
    const minorCount = chordLabels.filter(t => t === 'MINOR').length;
    const diminishedCount = chordLabels.filter(t => t === 'DIMINISHED').length;

    console.log(`C Major - MAJOR: ${majorCount}, MINOR: ${minorCount}, DIMINISHED: ${diminishedCount}`);

    // C Major should have: 3 major (F, C, G), 3 minor (D, A, E), 1 diminished (B)
    expect(majorCount).toBe(3);
    expect(minorCount).toBe(3);
    expect(diminishedCount).toBe(1);
  });

  test('D Dorian should show correct chord qualities', async ({ page }) => {
    await page.getByText('D', { exact: true }).first().click();
    await page.getByText('Dorian').click();

    await page.waitForTimeout(500);

    const chordLabels = await page.locator('svg text').allTextContents();

    console.log('D Dorian - All text in SVG:', chordLabels);

    const majorCount = chordLabels.filter(t => t === 'MAJOR').length;
    const minorCount = chordLabels.filter(t => t === 'MINOR').length;
    const diminishedCount = chordLabels.filter(t => t === 'DIMINISHED').length;

    console.log(`D Dorian - MAJOR: ${majorCount}, MINOR: ${minorCount}, DIMINISHED: ${diminishedCount}`);

    // Dorian: i(min), ii(min), III(maj), IV(maj), v(min), vi°(dim), VII(maj)
    // D Dorian notes: D E F G A B C
    // Qualities: D=minor, E=minor, F=major, G=major, A=minor, B=diminished, C=major
    expect(majorCount).toBe(3); // F, G, C
    expect(minorCount).toBe(3); // D, E, A
    expect(diminishedCount).toBe(1); // B
  });

  test('G Mixolydian should show correct chord qualities', async ({ page }) => {
    await page.getByText('G', { exact: true }).first().click();
    await page.getByText('Mixolydian').click();

    await page.waitForTimeout(500);

    const chordLabels = await page.locator('svg text').allTextContents();

    console.log('G Mixolydian - All text in SVG:', chordLabels);

    const majorCount = chordLabels.filter(t => t === 'MAJOR').length;
    const minorCount = chordLabels.filter(t => t === 'MINOR').length;
    const diminishedCount = chordLabels.filter(t => t === 'DIMINISHED').length;

    console.log(`G Mixolydian - MAJOR: ${majorCount}, MINOR: ${minorCount}, DIMINISHED: ${diminishedCount}`);

    // Mixolydian: I(maj), ii(min), iii°(dim), IV(maj), v(min), vi(min), VII(maj)
    // G Mixolydian notes: G A B C D E F
    // Qualities: G=major, A=minor, B=diminished, C=major, D=minor, E=minor, F=major
    expect(majorCount).toBe(3); // G, C, F
    expect(minorCount).toBe(3); // A, D, E
    expect(diminishedCount).toBe(1); // B
  });

  test('A Minor should show correct chord qualities', async ({ page }) => {
    await page.getByText('A', { exact: true }).first().click();
    await page.getByText('N. Minor / Aeolian').click();

    await page.waitForTimeout(500);

    const chordLabels = await page.locator('svg text').allTextContents();

    console.log('A Minor - All text in SVG:', chordLabels);

    const majorCount = chordLabels.filter(t => t === 'MAJOR').length;
    const minorCount = chordLabels.filter(t => t === 'MINOR').length;
    const diminishedCount = chordLabels.filter(t => t === 'DIMINISHED').length;

    console.log(`A Minor - MAJOR: ${majorCount}, MINOR: ${minorCount}, DIMINISHED: ${diminishedCount}`);

    // Natural minor: i, ii°, III, iv, v, VI, VII (3 major, 3 minor, 1 diminished)
    expect(majorCount).toBe(3);
    expect(minorCount).toBe(3);
    expect(diminishedCount).toBe(1);
  });

  test('Ab Major should show correct chord qualities', async ({ page }) => {
    await page.getByText('Ab').first().click();
    await page.getByText('Major / Ionian').click();

    await page.waitForTimeout(500);

    const chordLabels = await page.locator('svg text').allTextContents();

    console.log('Ab Major - All text in SVG:', chordLabels);

    const majorCount = chordLabels.filter(t => t === 'MAJOR').length;
    const minorCount = chordLabels.filter(t => t === 'MINOR').length;
    const diminishedCount = chordLabels.filter(t => t === 'DIMINISHED').length;

    console.log(`Ab Major - MAJOR: ${majorCount}, MINOR: ${minorCount}, DIMINISHED: ${diminishedCount}`);

    // Ab Major notes: Ab Bb C Db Eb F G
    // Qualities: Ab=major, Bb=minor, C=minor, Db=major, Eb=major, F=minor, G=diminished
    expect(majorCount).toBe(3); // Ab, Db, Eb
    expect(minorCount).toBe(3); // Bb, C, F
    expect(diminishedCount).toBe(1); // G
  });

  test('Circle should always have 12 outer ring segments', async ({ page }) => {
    // Count path elements in the chord ring (outer ring)
    const outerPaths = await page.locator('svg path').count();

    console.log(`Total path elements: ${outerPaths}`);

    // Should be at least 12 for the outer ring (may be more for middle and inner rings)
    expect(outerPaths).toBeGreaterThanOrEqual(12);
  });
});
