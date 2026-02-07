import type { ReactNode } from 'react';
import { config } from '@/config';

/**
 * Home page
 */
export default function Home(): ReactNode {
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'sans-serif',
        padding: '20px',
        backgroundColor: '#f9f9f9',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>Welcome</h1>
        <p style={{ fontSize: '16px', marginBottom: '24px', color: '#666' }}>
          This is a production-grade boilerplate with strict engineering standards.
        </p>

        <div
          style={{
            backgroundColor: '#fff',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'left',
            marginBottom: '24px',
          }}
        >
          <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Configuration</h2>
          <p style={{ fontSize: '14px', margin: '8px 0' }}>
            <strong>Environment:</strong> {config.environment}
          </p>
          <p style={{ fontSize: '14px', margin: '8px 0' }}>
            <strong>API Base URL:</strong> {config.apiBaseUrl}
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#f0f7ff',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#0070f3',
          }}
        >
          <p>
            Check the frontend README for instructions on getting started with development.
          </p>
        </div>
      </div>
    </main>
  );
}
