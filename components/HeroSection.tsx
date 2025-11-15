'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const HERO_IMAGES = [
  {
    src: '/images/common/hero1.webp',
    alt: 'レストランの内観',
  },
  {
    src: '/images/common/hero2.webp',
    alt: '最上級のスイーツカフェ',
  },
  {
    src: '/images/common/hero3.webp',
    alt: '照明に照らされた店内の様子',
  },
  {
    src: '/images/common/hero4.webp',
    alt: '綺麗なバーの外観',
  },
] as const;

const TRANSITION_DURATION = 5000; // 5秒ごとに切り替え

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, TRANSITION_DURATION);

    return () => clearInterval(timer);
  }, []);

  const handleScrollToContent = () => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      className="relative overflow-hidden flex items-center justify-center"
      style={{
        height: 'calc(100vh - 56px)', // ヘッダーの高さ(h-14 = 56px)を引く
        minHeight: '500px', // 最小高さを確保
      }}
    >
      {/* 背景画像レイヤー */}
      <div className="absolute inset-0">
        {HERO_IMAGES.map(({ src, alt }, index) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{
              opacity: index === currentIndex ? 1 : 0,
            }}
          >
            <Image
              src={src}
              alt={alt}
              fill
              priority={index === 0}
              fetchPriority={index === 0 ? 'high' : 'auto'}
              loading={index === 0 ? 'eager' : 'lazy'}
              quality={index === 0 ? 100 : 85}
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#13182333] via-[#0b0e1366] to-[#0b0e13e6]" />
          </div>
        ))}
      </div>

      {/* コンテンツ */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto mb-16 sm:mb-20">
        <span className="inline-block text-xs sm:text-sm" style={{ color: '#9AA7B2' }}>
          都市の&ldquo;好き&rdquo;を、気ままにアーカイブする
        </span>
        <h1 
          className="mt-4 sm:mt-6 text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight"
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            lineHeight: '1.3',
            background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 40%, #e0e0e0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: '#ffffff',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.2), 0 4px 20px rgba(0, 0, 0, 0.12), 0 8px 40px rgba(0, 0, 0, 0.08)',
            filter: 'drop-shadow(0 2px 10px rgba(0, 0, 0, 0.2)) drop-shadow(0 4px 20px rgba(0, 0, 0, 0.12)) drop-shadow(0 8px 40px rgba(0, 0, 0, 0.08))'
          }}
        >
          City Like Journal
        </h1>
        <p className="mt-4 sm:mt-6 text-sm sm:text-base text-gray-300 max-w-xl mx-auto">
          「行きたい」が、気分で見つかるプレイスセレクション
        </p>
      </div>

      {/* スクロールボタン */}
      <button
        onClick={handleScrollToContent}
        className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 group cursor-pointer"
        aria-label="コンテンツへスクロール"
      >
        <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors tracking-wider">
          Scroll
        </span>
        <div className="flex flex-col gap-1 animate-bounce-slow">
          <svg
            className="w-5 h-5 text-gray-400 group-hover:text-gray-200 transition-colors"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M5 7L10 12L15 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <svg
            className="w-5 h-5 text-gray-400 group-hover:text-gray-200 transition-colors -mt-2"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M5 7L10 12L15 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {/* アニメーション用のスタイル */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateY(4px);
            opacity: 0.6;
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

