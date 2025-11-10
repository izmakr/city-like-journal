"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import type { MapViewProps } from "@/components/MapView";

const MapViewSkeleton = () => (
  <div className="space-y-4">
    <div className="space-y-3">
      <div className="h-5 w-32 rounded bg-slate-800 animate-pulse" />
      <div className="h-12 rounded-2xl border border-slate-800 bg-slate-900" />
    </div>
    <div className="relative h-[420px] w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
      <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
        マップを読み込み中…
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
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldRender) return;
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px 0px",
        threshold: 0.1,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [shouldRender]);

  return (
    <div ref={containerRef}>
      {shouldRender ? <DynamicMapView {...props} /> : <MapViewSkeleton />}
    </div>
  );
};


