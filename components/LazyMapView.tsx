"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import type { MapViewProps } from "@/components/MapView";

const MapViewSkeleton = () => (
  <div className="relative h-[420px] w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
    {/* スケルトングリッド */}
    <div className="absolute inset-0 opacity-20">
      <div className="grid grid-cols-8 grid-rows-6 h-full gap-0.5 p-4">
        {Array.from({ length: 48 }).map((_, i) => (
          <div
            key={i}
            className="bg-slate-700 rounded"
            style={{
              animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
              animationDelay: `${(i % 12) * 0.1}s`,
            }}
          />
        ))}
      </div>
    </div>
    {/* 中央のピンアイコン */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <svg
          className="w-12 h-12 text-slate-600 animate-bounce"
          style={{ animationDuration: '2s' }}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
      </div>
    </div>
  </div>
);

const DynamicMapView = dynamic<MapViewProps>(
  () => import("@/components/MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: MapViewSkeleton,
  },
);

export const LazyMapView = (props: MapViewProps) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldRender) return;
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.intersectionRatio >= 0.35) {
          setShouldRender(true);
          // フェードイン効果用に少し遅延
          setTimeout(() => setIsVisible(true), 100);
          observer.disconnect();
        }
      },
      {
        rootMargin: "0px 0px -25% 0px",
        threshold: [0, 0.25, 0.35, 0.5, 1],
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [shouldRender]);

  return (
    <div 
      ref={containerRef} 
      id="spot-map"
      className="transition-opacity duration-700"
      style={{ opacity: isVisible ? 1 : 0.7 }}
    >
      {shouldRender ? <DynamicMapView {...props} /> : <MapViewSkeleton />}
    </div>
  );
};


