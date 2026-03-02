# Photop — 個人フォトポートフォリオ & 月間ベストアプリ

自分の写真を投稿し、毎月ベストショットを選ぶ個人ポートフォリオWebアプリです。
写真の記録と振り返りを習慣化するためのシンプルなツールとして設計されています。

## 主な機能

- **写真投稿** — JPEG / PNG / WebP（最大10MB）をキャプション付きで投稿
- **フィード** — 自分の写真を時系列で一覧表示
- **月間ベスト選出** — 今月の写真の中からベスト1枚を選択（月末まで変更可能）
- **アーカイブ** — 過去の月間ベストを月送りで振り返り
- **プロフィール編集** — 表示名の変更

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フレームワーク | Next.js (Pages Router) + TypeScript |
| UI | MUI (Material UI) v6 |
| 状態管理 | TanStack Query + React Context |
| フォーム | React Hook Form + Zod |
| 認証・DB・Storage | Supabase (Auth / PostgreSQL / Storage) |
| ホスティング | Vercel |

## 開発プロセス

このプロジェクトは **スペック駆動開発 (SDD)** で構築されています。

1. **仕様策定** → `docs/requirement.md`
2. **DB設計 & API仕様** → `supabase/migrations/`, `docs/api-spec.md`, `docs/db-design.md`
3. **テスト仕様** → `docs/test-spec-*.md`
4. **実装** → `src/`, `pages/`

## セットアップ

### 前提条件

- Node.js 18+
- Supabase プロジェクト（または Supabase CLI でローカル起動）

### インストール

```bash
npm install
```

### 環境変数

`.env.example` をコピーして `.env.local` を作成し、Supabase の URL と anon key を設定してください。

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### DB マイグレーション

Supabase SQL Editor または CLI で `supabase/migrations/` 内の SQL を順番に実行してください。

```
00001_create_tables.sql
00002_create_rls_policies.sql
00003_create_functions.sql
00004_create_storage.sql
```

### 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアプリが開きます。

## ページ構成

| パス | 画面 |
|---|---|
| `/` | ランディング（ログイン / サインアップ） |
| `/feed` | 写真フィード |
| `/post` | 写真投稿 |
| `/photos/[photoId]` | 写真詳細 |
| `/best` | 月間ベスト選出 |
| `/archive` | 月別アーカイブ |
| `/settings` | プロフィール編集・ログアウト |

## プロジェクト構成

```
src/
├── lib/           # Supabaseクライアント、バリデーション、ユーティリティ
├── types/         # データベース型定義
├── contexts/      # AuthContext
├── hooks/         # useAuth, usePhotos, useMonthlyBest, useArchive
├── components/    # UI コンポーネント
│   ├── layout/    # Layout, BottomNav, AuthGuard
│   ├── auth/      # LoginForm, SignUpForm
│   ├── photos/    # PostForm, PhotoCard, FeedList, PhotoDetail
│   ├── best/      # BestGrid
│   ├── archive/   # ArchiveCard, MonthNavigator
│   └── settings/  # ProfileEditForm
└── theme.ts       # MUI カスタムテーマ

pages/             # Next.js Pages Router
supabase/
├── migrations/    # SQL マイグレーション（4ファイル）
├── functions/     # Edge Function（月次ベスト自動確定）
└── config.toml    # Supabase ローカル設定
docs/              # 仕様書・設計書
```

## ビルド

```bash
npm run build
```
