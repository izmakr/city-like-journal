import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { SearchProvider } from '@/contexts/SearchContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'City Like Journal',
  description: '都市の&ldquo;好き&rdquo;を、気ままにアーカイブする',
  metadataBase: new URL('https://citylikejournal.com'),
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
