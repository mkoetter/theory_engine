import Link from 'next/link';

export default function CircleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Navigation */}
      <div style={{ padding: '1rem 2rem', background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
        <nav style={{ display: 'flex', gap: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
          <Link
            href="/"
            style={{
              padding: '0.5rem 1rem',
              background: 'white',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}
          >
            Progression Builder
          </Link>
          <Link
            href="/circle"
            style={{
              padding: '0.5rem 1rem',
              background: '#2196F3',
              color: 'white',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}
          >
            Circle of Fifths
          </Link>
        </nav>
      </div>
      {children}
    </>
  );
}
