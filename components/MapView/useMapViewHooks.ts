import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { Feature, FeatureCollection, Point } from 'geojson';
import type {
  GeoJSONSource,
  GeolocateControl,
  Map as MapLibreMap,
  MapLayerMouseEvent,
  Popup as MapLibrePopup,
} from 'maplibre-gl';
import { collapseAttributionControl, preferJapaneseLabels } from '@/lib/mapStyles';
import { POST_MARKER_ICON_SIZE_EXPRESSION } from '@/lib/mapStyleConfig';
import { getMarkerSymbolDataURL, type IconType } from '@/lib/mapMarkers';
import type { Post } from '@/lib/types';

type MapLibreModule = typeof import('maplibre-gl');

export type MarkerStyle = {
  icon: IconType;
  color: string;
};

/**
 * MapLibre の初期化とライフサイクル管理を担当するフック。
 * - コンテナへのマップ生成
 * - ナビゲーション / ジオロケーションコントロールの設置
 * - ラベルの日本語化やアトリビューションの初期状態調整
 * - クリーンアップ時のマップ破棄
 */
export const useMapInstance = (
  containerRef: RefObject<HTMLDivElement | null>,
  mapKey?: string,
) => {
  const mapRef = useRef<MapLibreMap | null>(null);
  const mapModuleRef = useRef<MapLibreModule | null>(null);
  const geolocateControlRef = useRef<GeolocateControl | null>(null);
  const [isReady, setReady] = useState(false);
  const languageAppliedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    let cancelled = false;

    const init = async () => {
      const maplibregl = await import('maplibre-gl');
      if (cancelled || !containerRef.current) return;

      mapModuleRef.current = maplibregl;

      const styleUrl = mapKey
        ? `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${mapKey}&language=ja`
        : 'https://demotiles.maplibre.org/style.json';

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: styleUrl,
        center: [139.767052, 35.681167],
        zoom: 11,
        attributionControl: false,
      });

      map.addControl(new maplibregl.AttributionControl({ compact: true }));
      collapseAttributionControl(map);
      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

      if ('geolocation' in navigator) {
        const geolocateControl = new maplibregl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
            maximumAge: 1000 * 10,
          },
          trackUserLocation: false,
          showUserLocation: true,
          fitBoundsOptions: {
            maxZoom: 15,
          },
        });
        geolocateControlRef.current = geolocateControl;
        map.addControl(geolocateControl, 'top-right');
      }

      languageAppliedRef.current = false;

      const applyLanguageOnce = () => {
        if (languageAppliedRef.current) return;
        languageAppliedRef.current = true;
        try {
          preferJapaneseLabels(map);
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[MapView] ラベル適用処理でエラー', error);
          }
        }
      };

      const ensureCollapsedAttribution = () => {
        collapseAttributionControl(map);
      };

      map.on('styledata', applyLanguageOnce);
      map.on('styledata', ensureCollapsedAttribution);

      map.once('load', () => {
        languageAppliedRef.current = false;
        applyLanguageOnce();
        ensureCollapsedAttribution();
        setReady(true);
        map.off('styledata', applyLanguageOnce);
        map.off('styledata', ensureCollapsedAttribution);
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
      geolocateControlRef.current = null;
      languageAppliedRef.current = false;
      setReady(false);
    };
  }, [containerRef, mapKey]);

  return {
    mapRef,
    mapModuleRef,
    geolocateControlRef,
    isReady,
  };
};

/**
 * 投稿ごとのマーカー SVG を MapLibre のスプライトへ登録するフック。
 * - 既に登録済みのアイコンはスキップ
 * - 新規追加があった場合のみ `spritesVersion` を更新して上位へ通知
 */
export const useMarkerSprites = (
  mapRef: RefObject<MapLibreMap | null>,
  markerStyles: Map<string, MarkerStyle>,
  isReady: boolean,
) => {
  const [spritesVersion, setSpritesVersion] = useState(0);

  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    const map = mapRef.current;
    let cancelled = false;

    const loadSprites = async () => {
      const entries = Array.from(markerStyles.entries());
      let hasNewImage = false;

      const loadImage = (iconKey: string, style: MarkerStyle) =>
        new Promise<void>((resolve, reject) => {
          if (map.hasImage(iconKey)) {
            resolve();
            return;
          }
          const image = new Image();
          image.crossOrigin = 'anonymous';
          image.onload = () => {
            try {
              if (!map.hasImage(iconKey)) {
                map.addImage(iconKey, image, { pixelRatio: 2 });
                hasNewImage = true;
              }
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          image.onerror = (error) => reject(error);
          image.src = getMarkerSymbolDataURL(style.icon, style.color);
        });

      for (const [iconKey, style] of entries) {
        if (map.hasImage(iconKey)) continue;
        try {
          await loadImage(iconKey, style);
        } catch (error) {
          console.error('[MapView] marker sprite load failed', error);
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

    loadSprites().catch((error) => {
      console.error('[MapView] failed to load marker sprites', error);
    });

    return () => {
      cancelled = true;
    };
  }, [mapRef, markerStyles, isReady]);

  return spritesVersion;
};

type UsePostsLayerParams = {
  mapRef: RefObject<MapLibreMap | null>;
  mapModuleRef: RefObject<MapLibreModule | null>;
  featureCollection: FeatureCollection<Point, FeatureProperties>;
  featureKey: string;
  spritesVersion: number;
  resolvePost: (id: string) => Post | undefined;
  isReady: boolean;
};

export type FeatureProperties = {
  id: string;
  iconKey: string;
};

/**
 * 投稿を描画するシンボルレイヤーを生成・更新するフック。
 * - GeoJSON ソースと `posts-layer` レイヤーを追加
 * - クリック時ポップアップ、カーソルの変化などのイベントをバインド
 * - `featureKey` が変わった場合のみ `setData` で差分更新
 * - アンマウント時にはレイヤー / ソース / ポップアップを安全に破棄
 */
export const usePostsLayer = ({
  mapRef,
  mapModuleRef,
  featureCollection,
  featureKey,
  spritesVersion,
  resolvePost,
  isReady,
}: UsePostsLayerParams) => {
  const sourceFeatureKeyRef = useRef<string | null>(null);
  const popupRef = useRef<MapLibrePopup | null>(null);

  useEffect(() => {
    if (!isReady || !mapRef.current || spritesVersion === 0) return;

    const map = mapRef.current;
    const maplibregl = mapModuleRef.current;
    if (!maplibregl) return;

    const source = map.getSource('posts') as GeoJSONSource | undefined;

    const cleanup = () => {
      if (!mapRef.current) return;
      const targetMap = mapRef.current;
      const style = (targetMap as MapLibreMap & { style?: unknown }).style;
      if (!style) return;

      const safeRemoveLayer = (layerId: string) => {
        try {
          if (targetMap.getLayer(layerId)) {
            targetMap.removeLayer(layerId);
          }
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[MapView] レイヤー削除に失敗しました', layerId, error);
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
            console.warn('[MapView] ソース削除に失敗しました', sourceId, error);
          }
        }
      };

      safeRemoveLayer('posts-layer');
      safeRemoveSource('posts');
      sourceFeatureKeyRef.current = null;
    };

    if (!source) {
      map.addSource('posts', {
        type: 'geojson',
        data: featureCollection,
      });
      sourceFeatureKeyRef.current = featureKey;

      map.addLayer({
        id: 'posts-layer',
        type: 'symbol',
        source: 'posts',
        layout: {
          'icon-image': ['get', 'iconKey'],
          'icon-anchor': 'bottom',
          'icon-allow-overlap': true,
          'icon-size': POST_MARKER_ICON_SIZE_EXPRESSION,
        },
      });

      const clickHandler = (e: MapLayerMouseEvent) => {
        const rawFeature = e.features?.[0];
        if (!rawFeature) return;
        const feature = rawFeature as unknown as Feature<Point, FeatureProperties>;
        const post = resolvePost(feature.properties?.id ?? '');
        if (!post) return;

        const coordinates = feature.geometry.coordinates.slice() as [number, number];
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        const popupHtml = `
          <div class="citylike-popup__body">
            <h3 class="citylike-popup__title">${post.title}</h3>
            <p class="citylike-popup__meta">${post.area}${post.address ? ` ｜ ${post.address}` : ''}</p>
            <a class="citylike-popup__link" href="/posts/${post.slug}">記事を見る</a>
          </div>
        `.trim();

        if (popupRef.current) {
          popupRef.current.remove();
        }

        popupRef.current = new maplibregl.Popup({ offset: 18, anchor: 'bottom', className: 'citylike-popup' })
          .setLngLat(coordinates)
          .setHTML(popupHtml)
          .addTo(map);
      };

      const enterHandler = () => {
        map.getCanvas().style.cursor = 'pointer';
      };

      const leaveHandler = () => {
        map.getCanvas().style.cursor = '';
      };

      map.on('click', 'posts-layer', clickHandler);
      map.on('mouseenter', 'posts-layer', enterHandler);
      map.on('mouseleave', 'posts-layer', leaveHandler);

      return () => {
        map.off('click', 'posts-layer', clickHandler);
        map.off('mouseenter', 'posts-layer', enterHandler);
        map.off('mouseleave', 'posts-layer', leaveHandler);
        if (popupRef.current) {
          popupRef.current.remove();
          popupRef.current = null;
        }
        cleanup();
      };
    }

    if (sourceFeatureKeyRef.current !== featureKey) {
      source.setData(featureCollection);
      sourceFeatureKeyRef.current = featureKey;
    }

    return cleanup;
  }, [mapRef, mapModuleRef, featureCollection, featureKey, spritesVersion, resolvePost, isReady]);
};

type UseAutoFitBoundsParams = {
  mapRef: RefObject<MapLibreMap | null>;
  mapModuleRef: RefObject<MapLibreModule | null>;
  featureCollection: FeatureCollection<Point, FeatureProperties>;
  featureKey: string;
  isReady: boolean;
};

export const useAutoFitBounds = ({
  mapRef,
  mapModuleRef,
  featureCollection,
  featureKey,
  isReady,
}: UseAutoFitBoundsParams) => {
  const previousFitKeyRef = useRef<string | null>(null);

  /**
   * 投稿集合に応じてマップ位置とズームを自動調整する。
   * - 0 件: 何もしない
   * - 1 件: ゆるやかに中心へズーム
   * - 複数件: 全スポットが収まるように `fitBounds`
   * - 同じ `featureKey` の連続適用は避け、ユーザー操作を尊重
   */
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const map = mapRef.current;
    const maplibregl = mapModuleRef.current;
    if (!maplibregl) return;

    const coordinates = featureCollection.features.map((feature) => feature.geometry.coordinates);

    if (coordinates.length === 0) {
      previousFitKeyRef.current = null;
      return;
    }

    if (previousFitKeyRef.current === featureKey) {
      return;
    }
    previousFitKeyRef.current = featureKey;

    if (coordinates.length === 1) {
      const [longitude, latitude] = coordinates[0] as [number, number];
      map.easeTo({
        center: [longitude, latitude],
        zoom: 15,
        duration: 600,
      });
      return;
    }

    const bounds = new maplibregl.LngLatBounds();
    coordinates.forEach(([longitude, latitude]) => bounds.extend([longitude, latitude]));
    map.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 600 });
  }, [mapRef, mapModuleRef, featureCollection, featureKey, isReady]);
};
