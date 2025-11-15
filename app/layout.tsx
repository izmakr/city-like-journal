import type { Metadata, Viewport } from 'next';

import { Header } from '@/components/Header';
import { SearchProvider } from '@/contexts/SearchContext';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '東京のカフェ・バー案内',
    template: '%s｜City Like Journal',
  },
  description: '都市の&ldquo;好き&rdquo;を、気ままにアーカイブする',
  metadataBase: new URL('https://citylikejournal.com'),
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'City Like Journal',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen" style={{ backgroundColor: '#0B0E13', color: '#E6EAF2' }}>
        <SearchProvider>
          <Header />
          <div className="pt-16">
            {children}
          </div>
        </SearchProvider>
      </body>
    </html>
  );
}
