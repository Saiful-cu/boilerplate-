import type { ReactNode } from 'react';
import Link from 'next/link';

/**
 * Not Found page for 404 errors
 */
export default function NotFound(): ReactNode {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'sans-serif',
        padding: '20px',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '500px' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>404</h1>
        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Page Not Found</h2>
        <p style={{ fontSize: '16px', marginBottom: '24px', color: '#666' }}>
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: '#0070f3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
