import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond } from 'next/font/google';

import { Header } from '@/components/Header';
import { BookmarkProvider } from '@/contexts/BookmarkContext';
import { SearchProvider } from '@/contexts/SearchContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthWrapper } from '@/components/AuthWrapper';
import './globals.css';

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-cormorant',
});

export const metadata: Metadata = {
  title: {
    default: '東京のカフェ・バー案内',
    template: '%s｜City Like Journal',
  },
  description: '「行きたい」が、気分で見つかるプレイスセレクション',
  metadataBase: new URL('https://citylikejournal.com'),
  openGraph: {
    title: 'City Like Journal｜東京のカフェ・バー案内',
    description: '「行きたい」が、気分で見つかるプレイスセレクション',
    url: 'https://citylikejournal.com',
    siteName: 'City Like Journal',
    images: [
      {
        url: '/images/common/CLJ_OGP.png',
        width: 1200,
        height: 630,
        alt: 'City Like Journal',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'City Like Journal｜東京のカフェ・バー案内',
    description: '「行きたい」が、気分で見つかるプレイスセレクション',
    images: ['/images/common/CLJ_OGP.png'],
  },
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
    <html lang="ja" className={cormorant.variable} suppressHydrationWarning>
      <body className="min-h-screen" style={{ backgroundColor: '#0B0E13', color: '#E6EAF2' }} suppressHydrationWarning>
        <AuthProvider>
          <BookmarkProvider>
            <SearchProvider>
              <AuthWrapper>
                <Header />
                <div className="pt-14">
                  {children}
                </div>
              </AuthWrapper>
            </SearchProvider>
          </BookmarkProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
