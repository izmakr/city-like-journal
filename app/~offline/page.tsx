import type { Metadata } from 'next';

import { ReloadButton } from './ReloadButton';

export const metadata: Metadata = {
  title: 'オフライン',
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <svg
            className="mx-auto h-24 w-24 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
        </div>
        
        <h1 className="mb-4 text-3xl font-bold" style={{ color: '#E6EAF2' }}>
          オフライン
        </h1>
        
        <p className="mb-8 text-lg" style={{ color: '#9BA3B4' }}>
          インターネット接続が利用できません
        </p>
        
        <div className="space-y-4">
          <p className="text-sm" style={{ color: '#6B7280' }}>
            ネットワーク接続を確認してください。
            <br />
            接続が復旧したら、自動的にページが更新されます。
          </p>
          
          <ReloadButton />
        </div>
      </div>
    </div>
  );
}

