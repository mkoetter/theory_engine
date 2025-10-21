import { TheoryPanel } from '@/components/theory/TheoryPanel';
import type { Block } from '@/state/theory.types';

// Example block for demonstration
const exampleBlock: Block = {
  id: 'verse-1',
  role: 'Verse',
  key: {
    tonic: 'C',
    mode: 'major',
  },
  palette: {
    source: 'mode',
    includeSevenths: false,
    romans: [],
    extras: [],
  },
  progression: [
    { roman: 'I', bars: 2 },
    { roman: 'V', bars: 1 },
    { roman: 'vi', bars: 1 },
    { roman: 'IV', bars: 2 },
  ],
};

export default function Home() {
  return (
    <main>
      <TheoryPanel initialBlock={exampleBlock} />
    </main>
  );
}
