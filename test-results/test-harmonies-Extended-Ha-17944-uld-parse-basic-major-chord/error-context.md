# Page snapshot

```yaml
- generic [ref=e2]:
  - heading "Theory Engine Test API" [level=1] [ref=e3]
  - generic [ref=e4]: Loading...
  - paragraph [ref=e5]: This page exposes the theory-core API to window.theoryCore for E2E testing.
  - paragraph [ref=e6]: Check the browser console to access the API.
  - heading "Available Methods:" [level=2] [ref=e7]
  - list [ref=e8]:
    - listitem [ref=e9]: window.theoryCore.parseExtendedChord(symbol)
    - listitem [ref=e10]: window.theoryCore.createSlashChord(chord, bass)
    - listitem [ref=e11]: window.theoryCore.validateChordSymbol(symbol)
    - listitem [ref=e12]: window.theoryCore.extendedRomanToAbsolute(roman, tonic)
    - listitem [ref=e13]: window.theoryCore.getChordVoicings(symbol, options)
    - listitem [ref=e14]: window.theoryCore.getExtendedChordNotes(extended, octave)
```