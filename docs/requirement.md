# 📸 Photop — 2人のための月間ベストフォトアプリ

## Product Spec v2.0

---

## 1. プロダクト概要

### 1.1 コンセプト
2人で写真を投稿し合い、毎月お互いのベストショットを選び合うInstagramライクなWebアプリ。
パートナー、親友、家族など、大切な1人との写真を通じたコミュニケーションツール。

### 1.2 ターゲットユーザー
- カップル・夫婦
- 親友同士
- 家族（親子など）
- 2人で何かを記録したい人たち

### 1.3 コアバリュー
- **2人だけの空間**: 完全プライベートな写真共有
- **月次ベスト**: 毎月のベスト1枚を選ぶことで振り返りが楽しくなる
- **Instagramライク**: 馴染みのあるUI/UXで直感的に使える

---

## 2. ユーザーフロー

```
1. メール/パスワードでサインアップ or ログイン
2. 招待コードを作成 or 受け取った招待コードを入力してペアリング
3. 写真を投稿（Instagramのように）
4. 相手の写真にいいね・コメント
5. 月末に、相手の写真から今月のベスト1枚を選ぶ
6. お互いのベストが揃ったら、月間ベストとして確定・表示
```

---

## 3. 機能仕様

### 3.1 認証

| 項目 | 仕様 |
|------|------|
| 認証基盤 | Supabase Auth |
| ログイン方式 | メール/パスワード認証 |
| セッション管理 | Supabase Auth（JWT + リフレッシュトークン） |
| プロフィール | 表示名、アバター画像（サインアップ時に設定） |

### 3.2 ペアリング（2人の紐付け）

| 項目 | 仕様 |
|------|------|
| ペア作成 | ユーザーAが招待コード（6桁英数字）を生成 |
| ペア参加 | ユーザーBが招待コードを入力して参加 |
| 招待コード有効期限 | 24時間 |
| ペア上限 | 1ユーザーにつき1ペアのみ |
| ペア解除 | 設定画面から解除可能（双方のデータは保持） |

### 3.3 写真投稿（Instagramライク）

| 項目 | 仕様 |
|------|------|
| 対応形式 | JPEG, PNG, WebP |
| ファイルサイズ上限 | 10MB/枚 |
| 投稿上限 | なし（自由に投稿可能） |
| キャプション | 任意、最大200文字 |
| 投稿フロー | 写真選択 → プレビュー → キャプション入力 → 投稿 |
| フィード表示 | 新しい順（時系列降順） |
| 画像表示 | 正方形クロップ（フィード）/ オリジナル比率（詳細） |
| ストレージ | Supabase Storage |

### 3.4 いいね機能

| 項目 | 仕様 |
|------|------|
| いいね対象 | 相手の写真（自分の写真にはいいね不可） |
| いいね方法 | ❤️ アイコンタップ or ダブルタップ |
| 取り消し | トグル式で取り消し可能 |
| 表示 | 写真下に ❤️ アイコン + いいね済み状態 |

### 3.5 コメント機能

| 項目 | 仕様 |
|------|------|
| コメント対象 | 全写真（自分・相手どちらも） |
| 文字数制限 | 最大200文字 |
| 編集・削除 | 自分のコメントのみ |
| 表示順 | 投稿日時の昇順（古い順） |

### 3.6 月間ベスト選出

| 項目 | 仕様 |
|------|------|
| 選出方法 | 相手の写真の中から今月のベスト1枚を選ぶ |
| 選出期間 | 当月中いつでも選出・変更可能 |
| 確定タイミング | 翌月1日 00:00 (JST) に自動確定 |
| 未選出の場合 | 該当月はベストなしとして記録 |
| 選出UI | 相手の今月の写真一覧から1枚をタップして選出 |
| 通知 | ベストに選ばれたことは確定後に表示（選出中は非公開） |
| 過去の閲覧 | 月別アーカイブで過去のベストを一覧表示 |

### 3.7 月間ベストアーカイブ

| 項目 | 仕様 |
|------|------|
| 表示形式 | 月ごとに2枚（お互いが選んだベスト）を並べて表示 |
| 表示内容 | 写真、キャプション、選ばれた月、投稿者名 |
| ナビゲーション | 月送り（← →）で過去月を閲覧 |

---

## 4. 画面一覧

| 画面名 | ファイルパス | URL | 概要 |
|--------|-------------|-----|------|
| ランディング | `pages/index.tsx` | `/` | サービス紹介 + ログイン/サインアップ |
| ペアリング | `pages/pairing.tsx` | `/pairing` | 招待コード生成 / 入力 |
| フィード | `pages/feed.tsx` | `/feed` | Instagram風の写真フィード（メイン画面） |
| 写真投稿 | `pages/post.tsx` | `/post` | 写真選択 → プレビュー → キャプション → 投稿 |
| 写真詳細 | `pages/photos/[photoId].tsx` | `/photos/[photoId]` | 写真拡大 + いいね + コメント |
| ベスト選出 | `pages/best.tsx` | `/best` | 相手の今月の写真から1枚を選ぶ |
| アーカイブ | `pages/archive.tsx` | `/archive` | 月別ベストフォト一覧 |
| プロフィール | `pages/profile/[userId].tsx` | `/profile/[userId]` | ユーザーの投稿一覧（グリッド表示） |
| 設定 | `pages/settings.tsx` | `/settings` | プロフィール編集、ペア解除 |

---

## 5. UI/UXデザイン方針

### Instagramに倣う要素（MUIコンポーネントマッピング）
- **ボトムナビゲーション**: `BottomNavigation` — フィード / 投稿 / ベスト選出 / アーカイブ / プロフィール
- **フィード**: `Card` + `CardMedia` + `CardActions`（アバター + ユーザー名 → 写真 → いいね・コメントボタン → キャプション）
- **プロフィール画面**: `Avatar` + `Typography` → `ImageList`（グリッド表示）
- **ダブルタップいいね**: 写真をダブルタップで ❤️ アニメーション
- **写真投稿フロー**: 写真選択 → フィルター/クロップ（v1ではスキップ）→ キャプション → シェア
- **ダイアログ**: `Dialog` でコメント一覧、写真詳細を表示

### Photopオリジナル要素
- **ベスト選出バナー**: `Alert` or `Banner` — 月末が近づくと「今月のベストを選ぼう」表示
- **アーカイブ**: 2人のベストが並ぶ月別タイムライン
- **ペアアイコン**: `AppBar` に相手のアバターを常時表示

### MUIテーマ設定
- カスタムテーマでInstagram風の色調（白基調 + アクセントカラー）
- ダークモード対応（v1では任意）
- レスポンシブ: `useMediaQuery` + ブレークポイントでモバイルファースト

---

## 6. 技術構成

### 6.1 フロントエンド
- **フレームワーク**: Next.js 15 (Pages Router)
- **言語**: TypeScript (strict mode)
- **UIライブラリ**: MUI (Material UI) v6
- **状態管理**: TanStack Query（サーバー状態）+ React Context（グローバル状態）
- **フォーム**: React Hook Form + Zod
- **テスト**: Vitest + React Testing Library + Playwright (E2E)

### 6.2 バックエンド（Supabase）
- **認証**: Supabase Auth（メール/パスワード認証）
- **DB**: Supabase PostgreSQL
- **クライアント**: `@supabase/supabase-js` + `supabase gen types`
- **API**: Next.js API Routes（`/pages/api/*`）
- **ストレージ**: Supabase Storage（写真）
- **画像処理**: Supabase Image Transformation
- **RLS**: 全テーブルにRow Level Securityを適用
- **Edge Functions**: 月次ベスト確定処理（Cron）

### 6.3 インフラ
- **ホスティング**: Vercel
- **BaaS**: Supabase
- **CI/CD**: GitHub Actions

### 6.4 アーキテクチャ

```
┌──────────────────────────────────┐
│       Next.js Pages Router       │
│          (Vercel)                │
│  ┌────────────┐ ┌─────────────┐  │
│  │   Pages    │ │ API Routes  │  │
│  │ + MUI SSR  │ │ /api/*      │  │
│  └─────┬──────┘ └──────┬──────┘  │
│        │               │         │
│   createBrowser    createServer  │
│   Client()         Client()     │
└────────┬───────────────┬─────────┘
         │               │
         ▼               ▼
┌──────────────────────────────────┐
│            Supabase              │
│  ┌─────┐ ┌────┐ ┌────────────┐  │
│  │Auth │ │ DB │ │  Storage   │  │
│  │(JWT)│ │+RLS│ │  (photos)  │  │
│  └─────┘ └────┘ └────────────┘  │
│         ┌──────────────┐         │
│         │Edge Functions│         │
│         │  (月次Cron)  │         │
│         └──────────────┘         │
└──────────────────────────────────┘
```

**MUI SSR設定**: Pages Routerでは `_document.tsx` と `_app.tsx` でEmotionキャッシュを設定し、サーバーサイドでのスタイル適用を行う。

---

## 7. データモデル

```
-- Supabase auth.users を参照する公開プロフィール
profiles
├── id: UUID → auth.users(id) [PK]
├── display_name: text
├── avatar_url: text?
└── created_at: timestamptz
└── RLS: 自分のみ更新可、ペア相手も閲覧可

pairs
├── id: UUID [PK, default gen_random_uuid()]
├── user_a_id: UUID → profiles(id)
├── user_b_id: UUID → profiles(id)?  ← 参加前はNULL
├── invite_code: text (unique, 6桁英数字)
├── invite_expires_at: timestamptz
├── status: text ('pending' | 'active' | 'dissolved')
├── created_at: timestamptz
└── RLS: ペアの当事者のみ閲覧・操作可

photos
├── id: UUID [PK, default gen_random_uuid()]
├── user_id: UUID → profiles(id)
├── pair_id: UUID → pairs(id)
├── storage_path: text
├── caption: text? (max 200)
├── month: text (YYYY-MM)
├── created_at: timestamptz
└── RLS: ペアの2人のみ閲覧可、投稿者のみ削除可

likes
├── id: UUID [PK, default gen_random_uuid()]
├── user_id: UUID → profiles(id)
├── photo_id: UUID → photos(id)
├── created_at: timestamptz
├── UNIQUE(user_id, photo_id)
└── RLS: 相手の写真にのみいいね可

comments
├── id: UUID [PK, default gen_random_uuid()]
├── user_id: UUID → profiles(id)
├── photo_id: UUID → photos(id)
├── body: text (max 200)
├── created_at: timestamptz
├── updated_at: timestamptz
└── RLS: ペアの2人のみ閲覧・投稿可、自分のコメントのみ編集・削除可

monthly_bests
├── id: UUID [PK, default gen_random_uuid()]
├── pair_id: UUID → pairs(id)
├── selector_id: UUID → profiles(id)  ← 選んだ人
├── photo_id: UUID → photos(id)       ← 選ばれた写真
├── month: text (YYYY-MM)
├── is_confirmed: boolean (default false)
├── created_at: timestamptz
├── confirmed_at: timestamptz?
├── UNIQUE(pair_id, selector_id, month)
└── RLS: ペアの当事者のみ、確定前は選出者のみ閲覧可
```

---

## 8. スペック駆動開発プロセス

### フェーズ1: 仕様策定
- [x] プロダクト仕様書の作成（本ドキュメント）

### フェーズ2: DB設計 & API仕様
- [x] Supabase マイグレーションSQL（テーブル + RLSポリシー）
- [x] Supabase RPC関数（ベスト確定処理など）
- [x] Storage バケット & ポリシー
- [x] API仕様書（クライアント呼び出し定義）
- [x] DB設計書（ER図・テーブル定義・RLS概要）
- [x] 画面設計書（ワイヤーフレーム・画面遷移図・MUIコンポーネント対応）
- [x] シーケンス図（主要ユーザーフロー）

### フェーズ3: テスト仕様
- [ ] ユニットテスト仕様（Vitest — バリデーション・ビジネスロジック）
- [ ] 統合テスト仕様（Supabase ローカル環境でのRLSテスト）
- [ ] E2Eテスト仕様（Playwright）

### フェーズ4: 実装
- [ ] Supabase プロジェクトセットアップ（メール/パスワード認証設定）
- [ ] DBマイグレーション適用 & RLS設定
- [ ] 認証フロー（メール/パスワード認証 + profiles連携）
- [ ] ペアリング機能
- [ ] 写真投稿機能（Supabase Storage）
- [ ] フィード画面（Instagramライク）
- [ ] いいね機能
- [ ] コメント機能
- [ ] ベスト選出機能
- [ ] アーカイブ画面
- [ ] Edge Function（月次ベスト確定 Cron）

### フェーズ5: デプロイ & ドキュメント
- [ ] Vercel デプロイ + Supabase本番連携
- [ ] README.md（スペック駆動開発プロセスの説明）

---

## 9. 非機能要件

| 項目 | 要件 |
|------|------|
| レスポンス | フィード初期表示: 2秒以内 |
| 画像最適化 | next/image + Supabase Image Transformation |
| アクセシビリティ | WCAG 2.1 AA準拠（基本レベル） |
| レスポンシブ | モバイルファースト（スマホメイン利用を想定） |
| セキュリティ | RLSによるデータアクセス制御、画像バリデーション |
| プライバシー | ペア以外には一切データが見えない設計 |

---

## 10. 将来の拡張（v2以降）

- 月間テーマ設定（例:「今月のテーマ: 食べ物」）
- 写真フィルター / 簡易編集
- PWA対応（ホーム画面に追加）
- プッシュ通知（新しい投稿・ベスト確定）
- 年間ベスト（12枚の中からベスト・オブ・ベスト）
- 思い出カレンダー表示