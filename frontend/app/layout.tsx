import type { Metadata } from 'next';
import type { ReactNode } from 'react';
// import { Inter, Poppins } from 'next/font/google';
import Providers from './providers';
import LayoutWrapper from '@/components/LayoutWrapper';
import './globals.css';

// Temporarily disable Google Fonts due to network connectivity issues
// const inter = Inter({
//   subsets: ['latin'],
//   variable: '--font-inter',
//   display: 'swap',
//   fallback: ['system-ui', 'arial'],
// });

// const poppins = Poppins({
//   subsets: ['latin'],
//   weight: ['400', '500', '600', '700', '800'],
//   variable: '--font-poppins',
//   display: 'swap',
//   fallback: ['system-ui', 'arial'],
// });

export const metadata: Metadata = {
  title: 'Noboraz - Your Trusted Ecommerce Store',
  description: 'Discover amazing products at great prices with fast delivery across Bangladesh.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: ReactNode }): ReactNode {
  return (
    <html lang="en" className="font-sans">
      <body className="font-primary antialiased">
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
