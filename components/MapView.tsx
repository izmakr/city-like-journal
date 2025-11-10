"use client";

import { useMemo, useRef } from 'react';
import type { FeatureCollection, Point } from 'geojson';
import type { Post } from '@/lib/types';
import { getMarkerVisual } from '@/lib/mapMarkers';
import { PostFilters } from '@/components/PostFilters';
import {
  useAutoFitBounds,
  useMapInstance,
  useMarkerSprites,
  usePostsLayer,
  type FeatureProperties,
  type MarkerStyle,
} from '@/components/MapView/useMapViewHooks';

import 'maplibre-gl/dist/maplibre-gl.css';

export type MapViewProps = {
  posts: Post[];
  category?: string;
  categoryGroup?: string;
  categoryGroups?: string[];
  categories?: string[];
  areaGroup?: string;
  areaGroups?: string[];
  areas?: string[];
  area?: string;
  onCategoryGroupChange?: (value: string) => void;
  onCategoryChange?: (value: string) => void;
  onAreaGroupChange?: (value: string) => void;
  onAreaChange?: (value: string) => void;
};

export function MapView({
  posts,
  category,
  categoryGroup,
  categoryGroups,
  categories,
  areaGroup,
  areaGroups,
  areas,
  area,
  onCategoryGroupChange,
  onCategoryChange,
  onAreaGroupChange,
  onAreaChange,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

  const { mapRef, mapModuleRef, isReady } = useMapInstance(containerRef, mapKey);

  const { featureCollection, featureKey, markerStyles, postMap } = useMemo(() => {
    const features: FeatureCollection<Point, FeatureProperties>['features'] = [];
    const styles = new Map<string, MarkerStyle>();
    const map = new Map<string, Post>();
    const selectedKind = category && category !== 'all' ? category : undefined;

    posts.forEach((post) => {
      if (
        post.latitude === undefined ||
        !Number.isFinite(post.latitude) ||
        post.longitude === undefined ||
        !Number.isFinite(post.longitude)
      ) {
        return;
      }

      const preferredKind = selectedKind && post.kind.includes(selectedKind) ? selectedKind : undefined;
      const { icon, color } = getMarkerVisual(post, preferredKind);
      const iconKey = `marker-${icon}-${color.replace(/[^a-zA-Z0-9]/g, '')}`;
      if (!styles.has(iconKey)) {
        styles.set(iconKey, { icon, color });
      }
      map.set(post.id, post);

      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [post.longitude as number, post.latitude as number],
        },
        properties: {
          id: post.id,
          iconKey,
        },
      });
    });

    const featureKey = features
      .map((feature) => {
        const [longitude, latitude] = feature.geometry.coordinates;
        return `${feature.properties?.id ?? ''}:${longitude},${latitude}`;
      })
      .join('|');

    return {
      featureCollection: {
        type: 'FeatureCollection',
        features,
      } as FeatureCollection<Point, FeatureProperties>,
      featureKey,
      markerStyles: styles,
      postMap: map,
    };
  }, [posts, category]);

  const spritesVersion = useMarkerSprites(mapRef, markerStyles, isReady);

  usePostsLayer({
    mapRef,
    mapModuleRef,
    featureCollection,
    featureKey,
    spritesVersion,
    resolvePost: (id) => postMap.get(id),
    isReady,
  });

  useAutoFitBounds({
    mapRef,
    mapModuleRef,
    featureCollection,
    featureKey,
    isReady,
  });

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white">スポットマップ</h2>
        {categoryGroups &&
        categories &&
        areaGroups &&
        areas &&
        onCategoryGroupChange &&
        onCategoryChange &&
        onAreaGroupChange &&
        onAreaChange && (
          <PostFilters
            categoryGroups={categoryGroups}
            categories={categories}
            areaGroups={areaGroups}
            areas={areas}
            categoryGroup={categoryGroup ?? 'all'}
            category={category ?? 'all'}
            areaGroup={areaGroup ?? 'all'}
            area={area ?? 'all'}
            onCategoryGroupChange={onCategoryGroupChange}
            onCategoryChange={onCategoryChange}
            onAreaGroupChange={onAreaGroupChange}
            onAreaChange={onAreaChange}
          />
        )}
      </div>
      <div
        ref={containerRef}
        className="relative h-[420px] w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900"
      >
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
            マップを読み込み中…
          </div>
        )}
        {isReady && featureCollection.features.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
            マップに表示できるスポットがありません
          </div>
        )}
      </div>
    </div>
  );
}

