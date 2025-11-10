## City Like Journal

東京のスポット情報を静的サイト化する Next.js プロジェクトです。  
マップ描画は MapLibre、記事やカテゴリ情報は Markdown + フロントマターで管理しています。

---

## セットアップ

### 必須要件

- Node.js 20+
- npm (推奨) / pnpm / yarn など
- MapTiler API Key（マップ本番表示用）  
  → `NEXT_PUBLIC_MAPTILER_API_KEY` を `.env.local` に記載

### 初回セットアップ

```bash
npm install
```

開発サーバーは次のコマンドで起動できます。

```bash
npm run dev
```

`http://localhost:3000` にアクセスするとトップページが表示されます。

### よく使うスクリプト

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` / `npm run start` | 本番ビルド／起動 |
| `npm run lint` | ESLint 実行 |
| `npm run test` | Jest + Testing Library によるユニットテスト |

---

## データ構造

### Markdown 記事

- 記事は `content/posts/<area>/<spot>.md` に配置します。
  - 例: `content/posts/shibuya/dra8man.md`
- frontmatter の主要項目
  - `id`: ハイフン区切りの内部 ID
  - `slug`: `エリア/スポット` 形式（公開 URL のもとになる英字スラッグ）  
    - 先頭がエリアスラッグ（例: `shibuya`）、末尾が店舗スラッグ（例: `dra8man`）になります。
  - `storeName`: 店舗名（必須）
  - `storeNameShort`: 任意。店名が 30 文字を超える場合に短縮名を指定（未指定でも自動補完）
  - `title`, `date`, `excerpt`, `cover`, `content`
  - `area`: 表示用エリア名（例: `渋谷`）
  - `kind`: カテゴリ配列（マップ・フィルターで利用）  
    - `lib/categories.ts` に掲載されている名称を使用してください。先頭の要素が URL のカテゴリ階層に反映されます。
  - `nearestStation`: 駅名（座標は `lib/stations.ts` から補完）
  - `latitude`, `longitude`: 任意。スポットの緯度経度（必要に応じて手入力）

`lib/data.ts` が frontmatter を解析し、以下の情報を自動算出します。

- `citySlug`, `areaSlug`, `categorySlug`, `storeSlug`: `/tokyo/<area>/<category>/<store>/` 用のスラッグ
- `permalink`: 新URL（例: `/tokyo/shibuya/cafe/dra8man/`）
- `storeNameShort`: 未設定かつ店名が長い場合は、自動で30文字以内に収まる短縮形を生成

`lib/data.ts` が記事読み込みを担当しており、`gray-matter` で frontmatter を解析 → `isPost` 型ガードで安全性を確認した上で `Post` 型に整形します。

### エリア & カテゴリの定義

- `lib/areas.ts`  
  - `AREA_GROUP_DEFINITIONS` に “恵比寿・代官山・中目黒” などのグループと所属エリアを列挙します。
  - `useMapFilters` などがこの定義を参照してフィルター候補を生成します。

- `lib/categories.ts`  
  - `CATEGORY_DEFINITIONS` に表示用グループ・アイコン・カラーを定義。  
  - マーカー表示やフィルターのグループ／サブカテゴリ候補に利用されます。

### サイトマップ & robots

- `app/sitemap.ts` が `sitemap.xml` を自動生成します。  
  - 新しい記事を追加したらデプロイ後に `https://citylikejournal.com/sitemap.xml` を Search Console へ送信してください。
- `app/robots.ts` は `robots.txt` を出力します。  
  - 追加のクローラー制御が必要になった場合はこのファイルを編集します。

### ページ構成（URL 階層）

- `/tokyo/`：東京全体のハブページ。エリア一覧＋最新スポットを表示。
- `/tokyo/[area]/`：エリア別ページ。カテゴリでフィルタでき、該当記事を PostCard で表示。
- `/tokyo/[area]/[category]/`：エリア×カテゴリの一覧ページ。
- `/tokyo/[area]/[category]/[store]/`：記事詳細ページ。
- `/category/`：カテゴリ一覧ページ。カテゴリごとの記事数を表示。
- `/category/[category]/`：カテゴリ詳細ページ。対象カテゴリの記事一覧を表示。

パンくずナビゲーションは上記階層に合わせて `Home / 東京 / エリア / カテゴリ / 店舗` を表示し、JSON-LD (`BreadcrumbList`) も付与しています。

### 駅座標

`lib/stations.ts` で駅名と座標を集中管理しています。  
`getStationCoordinates` はキャッシュ付き、`findNearestStation` は逆引き用ユーティリティです。  
記事の frontmatter では駅名を指定するだけで OK です。

---

## マップとスタイル

- MapLibre へのスタイル適用は `lib/mapStyles.ts` で行います。  
  ラベル描画や道路の透明度などは `lib/mapStyleConfig.ts` に定数としてまとめてあり、差分調整がしやすい構成です。
- マーカーのアイコンサイズなども `POST_MARKER_ICON_SIZE_EXPRESSION`・`ROUTE_MARKER_ICON_SIZE_EXPRESSION` として集約しています。
- `components/MapView/useMapViewHooks.ts` にマップ関連の副作用をまとめたカスタムフックがあります。

---

## フィルター & ページング

- `lib/hooks/useMapFilters.ts`  
  - カテゴリ／エリアフィルター、検索語での絞り込みをまとめたカスタムフックです。
  - ポップオーバー UI は `components/PostFilters/FilterPopoverSection.tsx` で共通化しています。
- `lib/hooks/usePagination.ts`  
  - ページング状態と URL 同期 (`?page=...`) を担当する再利用可能なフックです。
  - `components/PostList.tsx` で使用しています。

---

## カテゴリ別マーカーの追加方法

1. `lib/categories.ts` の `CATEGORY_DEFINITIONS` にグループ／アイコン／カラー／カテゴリ配列を追記します。
2. マーカー SVG が必要であれば `lib/mapMarkers.ts` の `ICON_CONTENT` に追加します。
3. 新しいカテゴリは `kind` 配列に記載するだけでマップのシンボル・フィルターに反映されます。

---

## テスト

Jest + Testing Library でユニットテストを整備しています。

- `npm run test`  
  主要フック関連（`usePagination`, `useMapFilters`）と型ガード（`isPost`）のテストを実行します。
- テスト環境は `jest.config.ts` / `jest.setup.ts` を参照。
- Next.js のルーターはテスト内でモックしています（新しいフックを追加する際の参考に）。

---

## ディレクトリのポイント

```
components/
  MapView/
    useMapViewHooks.ts      // マップ関連の副作用を集約
  PostFilters/             // フィルター UI コンポーネント
lib/
  data.ts                  // Markdown -> Post 整形
  mapStyleConfig.ts        // MapLibre スタイル定数
  mapStyles.ts             // スタイル適用ロジック
  hooks/
    useMapFilters.ts
    usePagination.ts
__tests__/                 // Jest テスト
```

---

## 運用メモ

- 新しい記事を追加したら `npm run dev` で内容確認 → `npm run test` で回帰チェック。
- MapTiler の API キーが未設定の場合、デモスタイルで表示されます（`PostRouteMap.tsx` に注意書きあり）。
- 住所ベースで座標を補完したい場合は `latitude` / `longitude` を手入力、もしくは `lib/stations.ts` を更新してください。

これで、このリポジトリの基本的な開発フロー・設定場所・拡張方法をすぐに思い出せるはずです。困ったときは `lib/` と `components/` の該当ファイルを参照してください。

