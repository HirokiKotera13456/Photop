# Photop — 個人フォトポートフォリオ & 月間ベストアプリ

## Product Spec v3.0

---

## 1. プロダクト概要

### 1.1 コンセプト
自分の写真を投稿し、毎月ベストショットを選ぶ個人ポートフォリオWebアプリ。
写真の記録と振り返りを習慣化するためのシンプルなツール。

### 1.2 ターゲットユーザー
- 写真を習慣的に撮る人
- 月ごとの振り返りを楽しみたい人
- シンプルなポートフォリオを作りたい人

### 1.3 コアバリュー
- **シンプル**: ログインして写真を投稿するだけ
- **月次ベスト**: 毎月のベスト1枚を選ぶことで振り返りが楽しくなる
- **Instagramライク**: 馴染みのあるUI/UXで直感的に使える

---

## 2. ユーザーフロー

```
1. メール/パスワードでサインアップ or ログイン
2. 写真を投稿（Instagramのように）
3. 月末に、自分の写真から今月のベスト1枚を選ぶ
4. 翌月1日に自動確定、アーカイブとして蓄積
```

---

## 3. 機能仕様

### 3.1 認証

| 項目 | 仕様 |
|------|------|
| 認証基盤 | Supabase Auth |
| ログイン方式 | メール/パスワード認証 |
| セッション管理 | Supabase Auth（JWT + リフレッシュトークン） |
| プロフィール | 表示名（サインアップ時に設定） |

### 3.2 写真投稿

| 項目 | 仕様 |
|------|------|
| 対応形式 | JPEG, PNG, WebP |
| ファイルサイズ上限 | 10MB/枚 |
| 投稿上限 | なし（自由に投稿可能） |
| キャプション | 任意、最大200文字 |
| 投稿フロー | 写真選択 → プレビュー → キャプション入力 → 投稿 |
| フィード表示 | 新しい順（時系列降順） |
| ストレージ | Supabase Storage |

### 3.3 月間ベスト選出

| 項目 | 仕様 |
|------|------|
| 選出方法 | 自分の今月の写真の中からベスト1枚を選ぶ |
| 選出期間 | 当月中いつでも選出・変更可能 |
| 確定タイミング | 翌月1日 00:00 (JST) に自動確定 |
| 未選出の場合 | 該当月はベストなしとして記録 |
| 選出UI | 今月の写真一覧から1枚をタップして選出 |

### 3.4 月間ベストアーカイブ

| 項目 | 仕様 |
|------|------|
| 表示形式 | 月ごとにベスト写真を表示 |
| 表示内容 | 写真、キャプション、選ばれた月 |
| ナビゲーション | 月送り（← →）で過去月を閲覧 |

---

## 4. 画面一覧

| 画面名 | ファイルパス | URL | 概要 |
|--------|-------------|-----|------|
| ランディング | `pages/index.tsx` | `/` | ログイン/サインアップ |
| フィード | `pages/feed.tsx` | `/feed` | 写真フィード（メイン画面） |
| 写真投稿 | `pages/post.tsx` | `/post` | 写真選択 → プレビュー → キャプション → 投稿 |
| 写真詳細 | `pages/photos/[photoId].tsx` | `/photos/[photoId]` | 写真拡大表示 |
| ベスト選出 | `pages/best.tsx` | `/best` | 今月の写真からベスト1枚を選ぶ |
| アーカイブ | `pages/archive.tsx` | `/archive` | 月別ベストフォト一覧 |
| 設定 | `pages/settings.tsx` | `/settings` | プロフィール編集、ログアウト |

---

## 5. UI/UXデザイン方針

### Instagramに倣う要素（MUIコンポーネント）
- **ボトムナビゲーション**: `BottomNavigation` — フィード / 投稿 / ベスト選出 / アーカイブ
- **フィード**: `Card` + `CardMedia`（写真 → キャプション）
- **写真投稿フロー**: 写真選択 → プレビュー → キャプション → シェア

### Photopオリジナル要素
- **ベスト選出バナー**: 月末が近づくと「今月のベストを選ぼう」表示
- **アーカイブ**: 月別ベストのタイムライン

### MUIテーマ設定
- カスタムテーマ（白基調 + ピンクアクセント）
- レスポンシブ: モバイルファースト

---

## 6. 技術構成

### 6.1 フロントエンド
- **フレームワーク**: Next.js (Pages Router)
- **言語**: TypeScript (strict mode)
- **UIライブラリ**: MUI (Material UI) v6
- **状態管理**: TanStack Query（サーバー状態）+ React Context（グローバル状態）
- **フォーム**: React Hook Form + Zod

### 6.2 バックエンド（Supabase）
- **認証**: Supabase Auth（メール/パスワード認証）
- **DB**: Supabase PostgreSQL
- **ストレージ**: Supabase Storage（写真）
- **RLS**: 全テーブルにRow Level Securityを適用
- **Edge Functions**: 月次ベスト確定処理（Cron）

### 6.3 インフラ
- **ホスティング**: Vercel
- **BaaS**: Supabase

---

## 7. データモデル

```
profiles
├── id: UUID → auth.users(id) [PK]
├── display_name: text
├── avatar_url: text?
└── created_at: timestamptz
└── RLS: 自分のみ閲覧・更新可

photos
├── id: UUID [PK, default gen_random_uuid()]
├── user_id: UUID → profiles(id)
├── storage_path: text
├── caption: text? (max 200)
├── month: text (YYYY-MM)
├── created_at: timestamptz
└── RLS: 自分の写真のみ閲覧・削除可

monthly_bests
├── id: UUID [PK, default gen_random_uuid()]
├── user_id: UUID → profiles(id)
├── photo_id: UUID → photos(id)
├── month: text (YYYY-MM)
├── is_confirmed: boolean (default false)
├── created_at: timestamptz
├── confirmed_at: timestamptz?
├── UNIQUE(user_id, month)
└── RLS: 自分のベストのみ閲覧・操作可
```

---

## 8. スペック駆動開発プロセス

### フェーズ1: 仕様策定
- [x] プロダクト仕様書の作成（本ドキュメント）

### フェーズ2: DB設計 & API仕様
- [x] Supabase マイグレーションSQL（テーブル + RLSポリシー）
- [x] Supabase RPC関数（ベスト確定処理）
- [x] Storage バケット & ポリシー

### フェーズ3: テスト仕様
- [x] テスト仕様書

### フェーズ4: 実装
- [x] 認証フロー（メール/パスワード認証 + profiles連携）
- [x] 写真投稿機能（Supabase Storage）
- [x] フィード画面
- [x] ベスト選出機能
- [x] アーカイブ画面
- [x] Edge Function（月次ベスト確定 Cron）

### フェーズ5: デプロイ & ドキュメント
- [ ] Vercel デプロイ + Supabase本番連携

---

## 9. 非機能要件

| 項目 | 要件 |
|------|------|
| レスポンス | フィード初期表示: 2秒以内 |
| 画像最適化 | next/image + Supabase Image Transformation |
| レスポンシブ | モバイルファースト（スマホメイン利用を想定） |
| セキュリティ | RLSによるデータアクセス制御、画像バリデーション |
