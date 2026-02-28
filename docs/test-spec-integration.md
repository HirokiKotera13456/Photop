# Photop 統合テスト仕様書

テスト環境: **Supabase ローカル環境** (`supabase start`) + **Vitest**

---

## 前提条件

- `supabase start` でローカル Supabase を起動
- マイグレーション適用済み（`supabase db reset`）
- テスト用ユーザーは `supabase.auth.admin.createUser()` で作成
- 各テストスイートの前に関連データをセットアップ、後にクリーンアップ

---

## 1. RLSポリシーテスト

### 1.1 profiles テーブル

#### SELECT

| # | テストケース | 実行ユーザー | 操作 | 期待結果 |
|---|------------|------------|------|---------|
| 1 | 自分のプロフィールを取得 | UserA | `SELECT * FROM profiles WHERE id = UserA.id` | 取得成功 |
| 2 | ペア相手のプロフィールを取得 | UserA | `SELECT * FROM profiles WHERE id = UserB.id`（ペア済み） | 取得成功 |
| 3 | ペア外ユーザーのプロフィール取得 | UserA | `SELECT * FROM profiles WHERE id = UserC.id`（ペア外） | 0件（RLSで除外） |
| 4 | 未認証でのアクセス | anon | `SELECT * FROM profiles` | 0件 |

#### UPDATE

| # | テストケース | 実行ユーザー | 操作 | 期待結果 |
|---|------------|------------|------|---------|
| 5 | 自分のプロフィールを更新 | UserA | `UPDATE profiles SET display_name = 'New Name' WHERE id = UserA.id` | 更新成功 |
| 6 | 相手のプロフィールを更新 | UserA | `UPDATE profiles SET display_name = 'Hacked' WHERE id = UserB.id` | 更新0件（RLS違反） |

#### INSERT

| # | テストケース | 実行ユーザー | 操作 | 期待結果 |
|---|------------|------------|------|---------|
| 7 | 自分のIDでプロフィール作成 | UserA | `INSERT INTO profiles (id, display_name)` | 成功 |
| 8 | 他人のIDでプロフィール作成 | UserA | `INSERT INTO profiles (id = UserB.id)` | RLS違反 |

---

### 1.2 pairs テーブル

#### SELECT

| # | テストケース | 実行ユーザー | 操作 | 期待結果 |
|---|------------|------------|------|---------|
| 1 | 自分がuser_aのペアを取得 | UserA | `SELECT * FROM pairs WHERE user_a_id = UserA.id` | 取得成功 |
| 2 | 自分がuser_bのペアを取得 | UserB | `SELECT * FROM pairs WHERE user_b_id = UserB.id` | 取得成功 |
| 3 | 無関係なペアの取得 | UserC | `SELECT * FROM pairs WHERE id = pairAB.id` | 0件 |

#### INSERT

| # | テストケース | 実行ユーザー | 操作 | 期待結果 |
|---|------------|------------|------|---------|
| 4 | 自分がuser_aとしてペア作成 | UserA | `INSERT INTO pairs (user_a_id = UserA.id)` | 成功 |
| 5 | 他人をuser_aとしてペア作成 | UserA | `INSERT INTO pairs (user_a_id = UserB.id)` | RLS違反 |

#### UPDATE

| # | テストケース | 実行ユーザー | 操作 | 期待結果 |
|---|------------|------------|------|---------|
| 6 | 当事者がペアステータスを更新 | UserA | `UPDATE pairs SET status = 'dissolved'` | 成功 |
| 7 | 非当事者がペアステータスを更新 | UserC | `UPDATE pairs SET status = 'dissolved'` | 更新0件 |

---

### 1.3 photos テーブル

#### SELECT

| # | テストケース | 実行ユーザー | 操作 | 期待結果 |
|---|------------|------------|------|---------|
| 1 | ペア内の写真を取得 | UserA | `SELECT * FROM photos WHERE pair_id = pairAB.id` | 取得成功 |
| 2 | ペア外の写真を取得 | UserC | `SELECT * FROM photos WHERE pair_id = pairAB.id` | 0件 |
| 3 | 相手の写真を取得 | UserA | `SELECT * FROM photos WHERE user_id = UserB.id` | 取得成功（同ペア内） |

#### INSERT

| # | テストケース | 実行ユーザー | 操作 | 期待結果 |
|---|------------|------------|------|---------|
| 4 | 自分のpair_idで写真投稿 | UserA | `INSERT INTO photos (user_id=A, pair_id=pairAB)` | 成功 |
| 5 | 他人のuser_idで写真投稿 | UserA | `INSERT INTO photos (user_id=B, pair_id=pairAB)` | RLS違反 |
| 6 | 他人のpair_idで写真投稿 | UserA | `INSERT INTO photos (user_id=A, pair_id=pairCD)` | RLS違反 |

#### DELETE

| # | テストケース | 実行ユーザー | 操作 | 期待結果 |
|---|------------|------------|------|---------|
| 7 | 自分の写真を削除 | UserA | `DELETE FROM photos WHERE id = photoA.id` | 成功 |
| 8 | 相手の写真を削除 | UserA | `DELETE FROM photos WHERE id = photoB.id` | 削除0件 |

---

### 1.4 likes テーブル

#### SELECT

| # | テストケース | 実行ユーザー | 操作 | 期待結果 |
|---|------------|------------|------|---------|
| 1 | ペア内の写真のいいねを取得 | UserA | `SELECT * FROM likes WHERE photo_id = pairPhoto.id` | 取得成功 |
| 2 | ペア外の写真のいいねを取得 | UserC | `SELECT * FROM likes WHERE photo_id = pairPhoto.id` | 0件 |

#### INSERT

| # | テストケース | 実行ユーザー | 操作 | 期待結果 |
|---|------------|------------|------|---------|
| 3 | 相手の写真にいいね | UserA | `INSERT INTO likes (user_id=A, photo_id=photoB)` | 成功 |
| 4 | 自分の写真にいいね（不可） | UserA | `INSERT INTO likes (user_id=A, photo_id=photoA)` | RLS違反 |
| 5 | ペア外の写真にいいね | UserC | `INSERT INTO likes (user_id=C, photo_id=photoA)` | RLS違反 |
| 6 | 同じ写真に2回いいね | UserA | 2回目の `INSERT` | 一意制約違反（`23505`） |

#### DELETE

| # | テストケース | 実行ユーザー | 操作 | 期待結果 |
|---|------------|------------|------|---------|
| 7 | 自分のいいねを取り消し | UserA | `DELETE FROM likes WHERE id = likeA.id` | 成功 |
| 8 | 相手のいいねを取り消し | UserA | `DELETE FROM likes WHERE id = likeB.id` | 削除0件 |

---

### 1.5 comments テーブル

#### SELECT

| # | テストケース | 実行ユーザー | 操作 | 期待結果 |
|---|------------|------------|------|---------|
| 1 | ペア内の写真のコメント取得 | UserA | `SELECT * FROM comments WHERE photo_id = pairPhoto.id` | 取得成功 |
| 2 | ペア外の写真のコメント取得 | UserC | `SELECT * FROM comments WHERE photo_id = pairPhoto.id` | 0件 |

#### INSERT

| # | テストケース | 実行ユーザー | 操作 | 期待結果 |
|---|------------|------------|------|---------|
| 3 | ペア内の写真にコメント（自分の写真） | UserA | `INSERT INTO comments (user_id=A, photo_id=photoA)` | 成功 |
| 4 | ペア内の写真にコメント（相手の写真） | UserA | `INSERT INTO comments (user_id=A, photo_id=photoB)` | 成功 |
| 5 | ペア外の写真にコメント | UserC | `INSERT INTO comments (user_id=C, photo_id=photoA)` | RLS違反 |
| 6 | 他人のuser_idでコメント | UserA | `INSERT INTO comments (user_id=B, photo_id=photoA)` | RLS違反 |

#### UPDATE

| # | テストケース | 実行ユーザー | 操作 | 期待結果 |
|---|------------|------------|------|---------|
| 7 | 自分のコメントを編集 | UserA | `UPDATE comments SET body = '...' WHERE id = commentA.id` | 成功 |
| 8 | 相手のコメントを編集 | UserA | `UPDATE comments SET body = '...' WHERE id = commentB.id` | 更新0件 |

#### DELETE

| # | テストケース | 実行ユーザー | 操作 | 期待結果 |
|---|------------|------------|------|---------|
| 9 | 自分のコメントを削除 | UserA | `DELETE FROM comments WHERE id = commentA.id` | 成功 |
| 10 | 相手のコメントを削除 | UserA | `DELETE FROM comments WHERE id = commentB.id` | 削除0件 |

---

### 1.6 monthly_bests テーブル

#### SELECT

| # | テストケース | 実行ユーザー | 操作 | 期待結果 |
|---|------------|------------|------|---------|
| 1 | 確定済みベストを取得（ペア当事者） | UserA | `SELECT * FROM monthly_bests WHERE is_confirmed = true` | 取得成功 |
| 2 | 未確定の自分の選出を取得 | UserA | `SELECT * FROM monthly_bests WHERE selector_id = A AND is_confirmed = false` | 取得成功 |
| 3 | 未確定の相手の選出を取得（不可） | UserA | `SELECT * FROM monthly_bests WHERE selector_id = B AND is_confirmed = false` | 0件 |
| 4 | ペア外のユーザーが取得 | UserC | `SELECT * FROM monthly_bests WHERE pair_id = pairAB.id` | 0件 |

#### INSERT

| # | テストケース | 実行ユーザー | 操作 | 期待結果 |
|---|------------|------------|------|---------|
| 5 | 自分のペアで自分がselectorとして選出 | UserA | `INSERT INTO monthly_bests (pair_id=pairAB, selector_id=A)` | 成功 |
| 6 | 他人をselectorとして選出 | UserA | `INSERT INTO monthly_bests (pair_id=pairAB, selector_id=B)` | RLS違反 |

#### UPDATE

| # | テストケース | 実行ユーザー | 操作 | 期待結果 |
|---|------------|------------|------|---------|
| 7 | 未確定の自分の選出を変更 | UserA | `UPDATE monthly_bests SET photo_id = ...` | 成功 |
| 8 | 確定済みの選出を変更 | UserA | `UPDATE monthly_bests SET photo_id = ... WHERE is_confirmed = true` | 更新0件 |
| 9 | 相手の選出を変更 | UserA | `UPDATE monthly_bests SET photo_id = ... WHERE selector_id = B` | 更新0件 |

#### DELETE

| # | テストケース | 実行ユーザー | 操作 | 期待結果 |
|---|------------|------------|------|---------|
| 10 | 未確定の自分の選出を削除 | UserA | `DELETE FROM monthly_bests WHERE selector_id = A AND is_confirmed = false` | 成功 |
| 11 | 確定済みの選出を削除 | UserA | `DELETE FROM monthly_bests WHERE is_confirmed = true` | 削除0件 |

---

## 2. RPC関数テスト

### 2.1 `generate_invite_code()`

| # | テストケース | 前提条件 | 期待結果 |
|---|------------|---------|---------|
| 1 | 正常系: コード生成 | ペアなし | `{ pair_id, invite_code(6桁英数字), expires_at }` が返る |
| 2 | 正常系: 生成されたコードが6桁英数字 | - | `invite_code` が `/^[A-Z0-9]{6}$/` にマッチ |
| 3 | 正常系: 有効期限が24時間後 | - | `expires_at` が現在時刻 + 約24時間 |
| 4 | 正常系: pairs テーブルにレコード作成 | - | `status = 'pending'`, `user_a_id = 実行ユーザー` |
| 5 | 正常系: 既存のpendingペアが削除される | pending ペアあり | 古いペアが削除され新しいペアが作成 |
| 6 | 異常系: 既にアクティブなペアがある | active ペアあり | エラー「すでにペアが存在します」 |
| 7 | 異常系: 未認証 | anon | 認証エラー |

### 2.2 `join_pair(code)`

| # | テストケース | 前提条件 | 期待結果 |
|---|------------|---------|---------|
| 1 | 正常系: ペア参加 | 有効な招待コード | `{ pair_id, partner_id }` が返る |
| 2 | 正常系: ペアがactiveになる | - | `pairs.status = 'active'`, `user_b_id` がセット |
| 3 | 正常系: 招待コードがクリアされる | - | `invite_code = null`, `invite_expires_at = null` |
| 4 | 正常系: 小文字コードでも参加可能 | コード `"abc123"` | 大文字変換されてマッチ |
| 5 | 異常系: 既にアクティブなペアがある | 参加者がペア済み | エラー「すでにペアが存在します」 |
| 6 | 異常系: 無効な招待コード | 存在しないコード | エラー「無効または期限切れの招待コードです」 |
| 7 | 異常系: 期限切れの招待コード | 24時間超過 | エラー「無効または期限切れの招待コードです」 |
| 8 | 異常系: 自分の招待コード | 自分が生成したコード | エラー「自分の招待コードは使用できません」 |
| 9 | 異常系: 未認証 | anon | 認証エラー |

### 2.3 `select_monthly_best(p_photo_id)`

| # | テストケース | 前提条件 | 期待結果 |
|---|------------|---------|---------|
| 1 | 正常系: 初回選出 | 相手の今月の写真 | `{ best_id, photo_id, month }` が返る |
| 2 | 正常系: monthly_bestsにレコード作成 | - | `selector_id = 実行ユーザー`, `is_confirmed = false` |
| 3 | 正常系: 選出変更（UPSERT） | 既に選出済み | `photo_id` が新しい写真に更新 |
| 4 | 正常系: monthが現在のJST月 | - | `month` が `YYYY-MM` 形式の今月 |
| 5 | 異常系: アクティブなペアがない | ペアなし | エラー「アクティブなペアがありません」 |
| 6 | 異常系: 自分の写真を選出 | 自分の写真ID | エラー「対象の写真が見つかりません」 |
| 7 | 異常系: 先月の写真を選出 | 先月の写真ID | エラー「対象の写真が見つかりません」 |
| 8 | 異常系: ペア外の写真を選出 | 別ペアの写真ID | エラー「対象の写真が見つかりません」 |
| 9 | 異常系: 存在しない写真ID | ランダムUUID | エラー「対象の写真が見つかりません」 |
| 10 | 異常系: 未認証 | anon | 認証エラー |

### 2.4 `confirm_monthly_bests()`

| # | テストケース | 前提条件 | 期待結果 |
|---|------------|---------|---------|
| 1 | 正常系: 前月の未確定レコードを確定 | 前月の未確定レコードあり | `{ month, confirmed_count }` が返る |
| 2 | 正常系: is_confirmedがtrueに更新 | - | 該当レコードの `is_confirmed = true`, `confirmed_at` がセット |
| 3 | 正常系: 確定済みレコードは変更されない | 前月の確定済み + 未確定あり | `confirmed_count` は未確定分のみ |
| 4 | 正常系: 対象レコードなし | 前月のレコードなし | `confirmed_count = 0` |
| 5 | 正常系: 今月の未確定レコードは対象外 | 今月の未確定あり | 変更されない |
| 6 | エッジケース: 月初1日に実行 | 前月最終日にデータあり | 正しく前月が対象になる |

---

## 3. トリガーテスト

### 3.1 `handle_new_user` トリガー

| # | テストケース | 操作 | 期待結果 |
|---|------------|------|---------|
| 1 | サインアップ時にprofiles自動作成 | `auth.signUp({ email, password, data: { display_name: 'テスト' } })` | `profiles` にレコードが作成される |
| 2 | display_nameがメタデータから設定 | `display_name: 'カスタム名'` | `profiles.display_name = 'カスタム名'` |
| 3 | display_name未指定時はメールのローカル部 | `display_name` なし、`email: 'test@example.com'` | `profiles.display_name = 'test'` |
| 4 | avatar_urlがメタデータから設定 | `avatar_url: 'https://...'` | `profiles.avatar_url = 'https://...'` |
| 5 | avatar_url未指定時はnull | `avatar_url` なし | `profiles.avatar_url = null` |

---

## 4. Storageポリシーテスト

### 4.1 アップロード（INSERT）

| # | テストケース | 実行ユーザー | 操作 | 期待結果 |
|---|------------|------------|------|---------|
| 1 | 自分のパスにJPEGアップロード | UserA | `upload('photos/{A_id}/test.jpg', jpegFile)` | 成功 |
| 2 | 自分のパスにPNGアップロード | UserA | `upload('photos/{A_id}/test.png', pngFile)` | 成功 |
| 3 | 自分のパスにWebPアップロード | UserA | `upload('photos/{A_id}/test.webp', webpFile)` | 成功 |
| 4 | 他人のパスにアップロード | UserA | `upload('photos/{B_id}/test.jpg', file)` | ポリシー違反 |
| 5 | 非対応MIMEタイプ | UserA | `upload('photos/{A_id}/test.gif', gifFile)` | 拒否 |
| 6 | 10MB超過 | UserA | `upload('photos/{A_id}/big.jpg', 11MBFile)` | サイズ超過エラー |
| 7 | 10MBちょうど | UserA | `upload('photos/{A_id}/max.jpg', 10MBFile)` | 成功 |
| 8 | 未認証 | anon | `upload(...)` | 認証エラー |

### 4.2 閲覧（SELECT）

| # | テストケース | 実行ユーザー | 操作 | 期待結果 |
|---|------------|------------|------|---------|
| 1 | 自分のファイルを閲覧 | UserA | `createSignedUrl('photos/{A_id}/test.jpg')` | 署名付きURL取得 |
| 2 | ペア相手のファイルを閲覧 | UserA | `createSignedUrl('photos/{B_id}/test.jpg')` | 署名付きURL取得 |
| 3 | ペア外のファイルを閲覧 | UserC | `createSignedUrl('photos/{A_id}/test.jpg')` | ポリシー違反 |

### 4.3 削除（DELETE）

| # | テストケース | 実行ユーザー | 操作 | 期待結果 |
|---|------------|------------|------|---------|
| 1 | 自分のファイルを削除 | UserA | `remove(['photos/{A_id}/test.jpg'])` | 成功 |
| 2 | 相手のファイルを削除 | UserA | `remove(['photos/{B_id}/test.jpg'])` | ポリシー違反 |

---

## 5. CASCADE削除テスト

| # | テストケース | 操作 | 期待結果 |
|---|------------|------|---------|
| 1 | 写真削除時にlikesが自動削除 | `DELETE FROM photos WHERE id = photoX.id` | 関連 likes が全て削除される |
| 2 | 写真削除時にcommentsが自動削除 | `DELETE FROM photos WHERE id = photoX.id` | 関連 comments が全て削除される |
| 3 | 写真削除時にmonthly_bestsが自動削除 | `DELETE FROM photos WHERE id = photoX.id` | 関連 monthly_bests が全て削除される |

---

## 6. 制約テスト

| # | テストケース | 操作 | 期待結果 |
|---|------------|------|---------|
| 1 | likes 一意制約 | 同じ `(user_id, photo_id)` で2回INSERT | 2回目が `23505` エラー |
| 2 | monthly_bests 一意制約 | 同じ `(pair_id, selector_id, month)` で2回INSERT | 2回目が `23505` エラー |
| 3 | caption 200文字超過 | `INSERT INTO photos (caption = 201文字)` | CHECK制約違反 `23514` |
| 4 | comments body 200文字超過 | `INSERT INTO comments (body = 201文字)` | CHECK制約違反 `23514` |

---

## 7. テストファイル構成（想定）

```
__tests__/integration/
├── setup.ts                    # テスト用Supabaseクライアント初期化
├── helpers.ts                  # ユーザー作成・ペア作成などのヘルパー
├── rls/
│   ├── profiles.test.ts        # 1.1
│   ├── pairs.test.ts           # 1.2
│   ├── photos.test.ts          # 1.3
│   ├── likes.test.ts           # 1.4
│   ├── comments.test.ts        # 1.5
│   └── monthly-bests.test.ts   # 1.6
├── rpc/
│   ├── generate-invite-code.test.ts    # 2.1
│   ├── join-pair.test.ts               # 2.2
│   ├── select-monthly-best.test.ts     # 2.3
│   └── confirm-monthly-bests.test.ts   # 2.4
├── triggers/
│   └── handle-new-user.test.ts         # 3.1
├── storage/
│   └── photos-bucket.test.ts           # 4
├── cascade.test.ts             # 5
└── constraints.test.ts         # 6
```

---

## 8. テストヘルパー仕様

```ts
// テスト用ユーザーの作成
async function createTestUser(email: string, displayName: string): Promise<{
  id: string;
  client: SupabaseClient;  // そのユーザーとしてログイン済みクライアント
}>

// テスト用ペアの作成（active状態）
async function createTestPair(userAClient: SupabaseClient, userBClient: SupabaseClient): Promise<{
  pairId: string;
}>

// テスト用写真の投稿
async function createTestPhoto(client: SupabaseClient, pairId: string, month?: string): Promise<{
  photoId: string;
  storagePath: string;
}>

// テスト用クリーンアップ
async function cleanupTestData(): Promise<void>
```
