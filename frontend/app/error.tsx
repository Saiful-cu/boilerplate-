'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { getUserFriendlyMessage, isAppError, type AppError } from '@/lib/errors';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary for the application
 *
 * This component catches:
 * - Uncaught exceptions in child components
 * - Errors during Next.js rendering
 * - Errors during data fetching
 *
 * It displays user-friendly error messages and provides a reset button.
 * Internal error details are logged for debugging but not shown to users.
 */
export default function GlobalError({ error, reset }: ErrorProps): ReactNode {
  useEffect(() => {
    // Log error details for debugging (server-side logging)
    console.error('Application error:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  // Determine user-friendly message
  let userMessage = 'Something went wrong. Please try again.';

  if (isAppError(error as unknown as AppError)) {
    const appError = error as unknown as AppError;
    userMessage = getUserFriendlyMessage(appError.code);
  }

  return (
    <html lang="en">
      <body>
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
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Error</h1>
            <p style={{ fontSize: '16px', marginBottom: '24px', color: '#666' }}>
              {userMessage}
            </p>
            <button
              onClick={reset}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                backgroundColor: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
