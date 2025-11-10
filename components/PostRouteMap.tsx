"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FeatureCollection, Point } from 'geojson';
import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';
import type { Post } from '@/lib/types';
import { getMarkerSymbolDataURL, getMarkerVisual, getStationSymbolDataURL } from '@/lib/mapMarkers';
import { getStationCoordinates } from '@/lib/stations';
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
  const stationCoordinates = useMemo(
    () => (post.nearestStation ? getStationCoordinates(post.nearestStation) : undefined),
    [post.nearestStation],
  );
  const stationAvailable = hasLocation && post.nearestStation && stationCoordinates;

  const { featureCollection, styles } = useMemo(() => {
    const featureCollection: FeatureCollection<Point, { id: string; iconKey: string; role: 'spot' | 'station' }> = {
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

    if (stationAvailable && stationCoordinates) {
      const stationIconKey = `post-${post.id}-station`;
      markerStyles.set(stationIconKey, {
        iconKey: stationIconKey,
        iconType: 'default',
        color: '#1F2937',
        dataUrl: getStationSymbolDataURL(),
      });
      featureCollection.features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [stationCoordinates.longitude, stationCoordinates.latitude],
        },
        properties: { id: `${post.id}-station`, iconKey: stationIconKey, role: 'station' },
      });
    }

    return { featureCollection, styles: markerStyles };
  }, [post, hasLocation, stationAvailable, stationCoordinates]);

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
        zoom: 15.2,
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
    const maplibregl = mapModuleRef.current;
    if (!maplibregl) return;

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

      safeRemoveLayer(`${LAYER_ID}-station-label`);
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

      if (stationAvailable && stationCoordinates) {
        const bounds = new maplibregl.LngLatBounds();
        bounds.extend([post.longitude as number, post.latitude as number]);
        bounds.extend([stationCoordinates.longitude, stationCoordinates.latitude]);
        map.fitBounds(bounds, { padding: 120, maxZoom: 16 });
      } else {
        map.easeTo({
          center: [post.longitude as number, post.latitude as number],
          zoom: 15.2,
          duration: 800,
        });
      }

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
    if (stationAvailable && !map.getLayer(`${LAYER_ID}-station-label`)) {
      map.addLayer({
        id: `${LAYER_ID}-station-label`,
        type: 'symbol',
        source: SOURCE_ID,
        filter: ['==', ['get', 'role'], 'station'],
        layout: {
          'icon-image': ['get', 'iconKey'],
          'icon-anchor': 'bottom',
          'icon-allow-overlap': true,
          'icon-size': ROUTE_MARKER_ICON_SIZE_EXPRESSION,
        },
      });
    }

    if (stationAvailable && stationCoordinates) {
      const bounds = new maplibregl.LngLatBounds();
      bounds.extend([post.longitude as number, post.latitude as number]);
      bounds.extend([stationCoordinates.longitude, stationCoordinates.latitude]);
      map.fitBounds(bounds, { padding: 120, maxZoom: 16 });
    } else {
      map.easeTo({
        center: [post.longitude as number, post.latitude as number],
        zoom: 15.2,
        duration: 800,
      });
    }

    return cleanup;
  }, [featureCollection, hasLocation, isReady, spritesVersion, stationAvailable, stationCoordinates, post]);

  if (!hasLocation) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">アクセスマップ</h2>
          {post.nearestStation && (
            <p className="text-xs text-gray-400 mt-1">
              {post.nearestStation} とスポットの位置関係を表示しています
            </p>
          )}
        </div>
        {!process.env.NEXT_PUBLIC_MAPTILER_API_KEY && (
          <p className="text-xs text-amber-400">※MapTiler APIキー未設定のため、デモスタイルで表示中</p>
        )}
      </div>
      <div
        ref={containerRef}
        className="relative h-[360px] w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900"
      >
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
            マップを読み込み中…
          </div>
        )}
      </div>
    </div>
  );
}


