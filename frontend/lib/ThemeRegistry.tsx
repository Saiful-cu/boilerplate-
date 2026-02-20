'use client';

import * as React from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';

// This component ensures proper Emotion style injection for Next.js App Router SSR
export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [cache] = React.useState(() => {
    const c = createCache({ key: 'mui' });
    c.compat = true;
    return c;
  });

  useServerInsertedHTML(() => {
    const entries = Object.entries(cache.inserted);
    if (entries.length === 0) return null;

    let styles = '';
    const dataEmotionAttribute = cache.key;
    const names: string[] = [];

    entries.forEach(([name, value]) => {
      if (typeof value === 'string') {
        names.push(name);
        styles += value;
      }
    });

    return (
      <style
        key={dataEmotionAttribute}
        data-emotion={`${dataEmotionAttribute} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
