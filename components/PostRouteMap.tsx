"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FeatureCollection, Point } from 'geojson';
import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';
import type { Post } from '@/lib/types';
import { getMarkerSymbolDataURL, getMarkerVisual } from '@/lib/mapMarkers';
import { collapseAttributionControl } from '@/lib/mapStyles';
import { ROUTE_MARKER_ICON_SIZE_EXPRESSION } from '@/lib/mapStyleConfig';

import 'maplibre-gl/dist/maplibre-gl.css';

type MapLibreModule = typeof import('maplibre-gl');

export type PostRouteMapProps = {
  post: Post;
};

const SOURCE_ID = 'post-route-source';
const LAYER_ID = 'post-route-layer';

export function PostRouteMap({ post }: PostRouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const mapModuleRef = useRef<MapLibreModule | null>(null);
  const [isReady, setReady] = useState(false);
  const [spritesVersion, setSpritesVersion] = useState(0);

  const hasLocation =
    post.latitude !== undefined && Number.isFinite(post.latitude) && post.longitude !== undefined &&
    Number.isFinite(post.longitude);

  const { featureCollection, styles } = useMemo(() => {
    const featureCollection: FeatureCollection<Point, { id: string; iconKey: string; role: 'spot' }> = {
      type: 'FeatureCollection',
      features: [],
    };
    const markerStyles = new Map<string, { iconKey: string; color: string; iconType: ReturnType<typeof getMarkerVisual>['icon']; dataUrl: string }>();

    if (!hasLocation) {
      return { featureCollection, styles: markerStyles };
    }

    const spotStyle = getMarkerVisual(post);
    const spotIconKey = `post-${post.id}-spot`;
    markerStyles.set(spotIconKey, {
      iconKey: spotIconKey,
      iconType: spotStyle.icon,
      color: spotStyle.color,
      dataUrl: getMarkerSymbolDataURL(spotStyle.icon, spotStyle.color),
    });
    featureCollection.features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [post.longitude as number, post.latitude as number] },
      properties: { id: post.id, iconKey: spotIconKey, role: 'spot' },
    });

    return { featureCollection, styles: markerStyles };
  }, [post, hasLocation]);

  useEffect(() => {
    if (!hasLocation) return;
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    const init = async () => {
      const maplibregl = await import('maplibre-gl');
      if (cancelled || !containerRef.current) return;

      mapModuleRef.current = maplibregl;

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: process.env.NEXT_PUBLIC_MAPTILER_API_KEY
          ? `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}&language=ja`
          : 'https://demotiles.maplibre.org/style.json',
        center: [post.longitude as number, post.latitude as number],
        zoom: 15,
        attributionControl: false,
      });

      map.addControl(new maplibregl.AttributionControl({ compact: true }));
      collapseAttributionControl(map);
      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

      map.once('load', () => {
        collapseAttributionControl(map);
        setReady(true);
      });

      mapRef.current = map;
    };

    init();

    return () => {
      cancelled = true;
      const map = mapRef.current;
      if (map) {
        map.remove();
      }
      mapRef.current = null;
      mapModuleRef.current = null;
      setReady(false);
    };
  }, [hasLocation, post.latitude, post.longitude]);

  useEffect(() => {
    if (!mapRef.current || !isReady || !hasLocation) return;
    const map = mapRef.current;
    const maplibregl = mapModuleRef.current;
    if (!map || !maplibregl) return;

    let cancelled = false;

    const loadImages = async () => {
      const entries = Array.from(styles.values());
      let hasNewImage = false;

      const loadImage = (style: (typeof entries)[number]) =>
        new Promise<void>((resolve, reject) => {
          if (map.hasImage(style.iconKey)) {
            resolve();
            return;
          }
          const image = new Image();
          image.crossOrigin = 'anonymous';
          image.onload = () => {
            try {
              if (!map.hasImage(style.iconKey)) {
                map.addImage(style.iconKey, image, { pixelRatio: 2 });
                hasNewImage = true;
              }
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          image.onerror = (error) => reject(error);
          image.src = style.dataUrl;
        });

      for (const style of entries) {
        if (cancelled) return;
        try {
          await loadImage(style);
        } catch (error) {
          console.error('[PostRouteMap] marker sprite load failed', error);
        }
      }
      if (!cancelled) {
        setSpritesVersion((prev) => {
          if (prev === 0) return 1;
          if (hasNewImage) return prev + 1;
          return prev;
        });
      }
    };

    if (map.isStyleLoaded()) {
      loadImages();
    } else {
      const handleStyleData = () => {
        map.off('styledata', handleStyleData);
        loadImages();
      };
      map.on('styledata', handleStyleData);
    }

    return () => {
      cancelled = true;
    };
  }, [hasLocation, styles, isReady, post]);

  useEffect(() => {
    if (!mapRef.current || !isReady || spritesVersion === 0 || !hasLocation) return;

    const map = mapRef.current;

    const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
    const cleanup = () => {
      const targetMap = mapRef.current ?? map;
      if (!targetMap) return;
      const style = (targetMap as MapLibreMap & { style?: unknown }).style;
      if (!style) return;

      const safeRemoveLayer = (layerId: string) => {
        try {
          if (targetMap.getLayer(layerId)) {
            targetMap.removeLayer(layerId);
          }
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[PostRouteMap] レイヤー削除に失敗しました', layerId, error);
          }
        }
      };

      const safeRemoveSource = (sourceId: string) => {
        try {
          if (targetMap.getSource(sourceId)) {
            targetMap.removeSource(sourceId);
          }
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[PostRouteMap] ソース削除に失敗しました', sourceId, error);
          }
        }
      };

      safeRemoveLayer(LAYER_ID);
      safeRemoveSource(SOURCE_ID);
    };

    if (!source) {
      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: featureCollection,
      });

      map.addLayer({
        id: LAYER_ID,
        type: 'symbol',
        source: SOURCE_ID,
        layout: {
          'icon-image': ['get', 'iconKey'],
          'icon-anchor': 'bottom',
          'icon-allow-overlap': true,
          'icon-size': ROUTE_MARKER_ICON_SIZE_EXPRESSION,
        },
      });

      map.easeTo({
        center: [post.longitude as number, post.latitude as number],
        zoom: 15.5,
        duration: 800,
      });

      return cleanup;
    }

    source.setData(featureCollection);
    if (!map.getLayer(LAYER_ID)) {
      map.addLayer({
        id: LAYER_ID,
        type: 'symbol',
        source: SOURCE_ID,
        layout: {
          'icon-image': ['get', 'iconKey'],
          'icon-anchor': 'bottom',
          'icon-allow-overlap': true,
          'icon-size': ROUTE_MARKER_ICON_SIZE_EXPRESSION,
        },
      });
    }

    map.easeTo({
      center: [post.longitude as number, post.latitude as number],
      zoom: 15.5,
      duration: 800,
    });

    return cleanup;
  }, [featureCollection, hasLocation, isReady, spritesVersion, post]);

  if (!hasLocation) {
    return null;
  }

  // Google Maps用のURL（店名と住所を使用）
  const searchQuery = post.address 
    ? `${post.storeName} ${post.address}`.trim()
    : post.storeName;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-white">アクセスマップ</h2>
      <div
        ref={containerRef}
        className="relative h-[360px] w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900"
      >
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
            マップを読み込み中…
          </div>
        )}
        {isReady && (
          <div 
            className="absolute top-4 left-4 max-w-xs z-10 rounded-2xl p-4 shadow-xl border backdrop-blur-md"
            style={{ 
              background: 'rgba(15, 22, 36, 0.95)', 
              borderColor: 'rgba(127, 180, 255, 0.25)',
              boxShadow: '0 24px 40px rgba(7, 10, 16, 0.55)'
            }}
          >
            <h3 className="font-semibold text-[#E6EAF2] text-sm mb-2">{post.storeName}</h3>
            {post.address && (
              <p className="text-xs text-[#9AA7B2] mb-3 leading-relaxed">{post.address}</p>
            )}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#7FB4FF] text-xs font-medium hover:text-[#93c6ff] transition-colors inline-flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              拡大地図を表示
            </a>
          </div>
        )}
      </div>
    </div>
  );
}


