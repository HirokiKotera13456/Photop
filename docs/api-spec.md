# Photop API仕様書

Supabase クライアント (`@supabase/supabase-js`) を使用した API 定義。
各エンドポイントについてリクエスト・レスポンス・ステータスコードを記載する。

---

## 1. 認証

### 1.1 サインアップ

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.auth.signUp()` |
| 認証 | 不要 |

**リクエスト**
```ts
{
  email: string,          // メールアドレス
  password: string,       // パスワード（6文字以上）
  options: {
    data: {
      display_name: string  // 表示名
    }
  }
}
```

**レスポンス（成功）**
```ts
// ステータス: 200 OK
{
  user: {
    id: string,           // UUID
    email: string,
    created_at: string
  },
  session: {
    access_token: string,
    refresh_token: string,
    expires_in: number
  }
}
```

**備考**: `profiles` レコードはトリガー (`handle_new_user`) で自動作成される

| ステータス | 条件 |
|-----------|------|
| 200 | サインアップ成功 |
| 400 | パスワードが短すぎる / メール形式不正 |
| 422 | メールアドレスが既に登録済み |
| 429 | レート制限超過 |

---

### 1.2 ログイン

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.auth.signInWithPassword()` |
| 認証 | 不要 |

**リクエスト**
```ts
{
  email: string,
  password: string
}
```

**レスポンス（成功）**
```ts
// ステータス: 200 OK
{
  user: {
    id: string,
    email: string
  },
  session: {
    access_token: string,
    refresh_token: string,
    expires_in: number
  }
}
```

| ステータス | 条件 |
|-----------|------|
| 200 | ログイン成功 |
| 400 | メール/パスワード不正 |
| 429 | レート制限超過 |

---

### 1.3 ログアウト

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.auth.signOut()` |
| 認証 | 必要 |

**リクエスト**: なし

**レスポンス（成功）**
```ts
// ステータス: 200 OK
// (レスポンスボディなし)
```

| ステータス | 条件 |
|-----------|------|
| 200 | ログアウト成功 |
| 401 | 未認証 |

---

### 1.4 セッション取得

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.auth.getSession()` |
| 認証 | 必要 |

**リクエスト**: なし

**レスポンス（成功）**
```ts
// ステータス: 200 OK
{
  session: {
    access_token: string,
    refresh_token: string,
    expires_in: number,
    user: { id: string, email: string }
  } | null
}
```

| ステータス | 条件 |
|-----------|------|
| 200 | セッション取得成功（セッションなしの場合 `session: null`） |

---

## 2. プロフィール

### 2.1 プロフィール取得

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.from('profiles').select().eq('id', userId).single()` |
| 認証 | 必要 |
| RLS | 自分 or ペア相手のみ閲覧可 |

**リクエスト**
```ts
{
  userId: string  // 対象ユーザーの UUID
}
```

**レスポンス（成功）**
```ts
// ステータス: 200 OK
{
  id: string,
  display_name: string,
  avatar_url: string | null,
  created_at: string
}
```

| ステータス | 条件 |
|-----------|------|
| 200 | 取得成功 |
| 401 | 未認証 |
| 404 (`PGRST116`) | ユーザーが見つからない |
| 403 (`42501`) | RLS違反（ペア外のユーザー） |

---

### 2.2 プロフィール更新

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.from('profiles').update().eq('id', userId).select().single()` |
| 認証 | 必要 |
| RLS | 自分のプロフィールのみ更新可 |

**リクエスト**
```ts
{
  display_name?: string,   // 表示名
  avatar_url?: string      // アバター画像URL
}
```

**レスポンス（成功）**
```ts
// ステータス: 200 OK
{
  id: string,
  display_name: string,
  avatar_url: string | null,
  created_at: string
}
```

| ステータス | 条件 |
|-----------|------|
| 200 | 更新成功 |
| 401 | 未認証 |
| 403 (`42501`) | RLS違反（他人のプロフィール） |

---

## 3. ペアリング

### 3.1 招待コード生成

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.rpc('generate_invite_code')` |
| 認証 | 必要 |

**リクエスト**: なし

**レスポンス（成功）**
```ts
// ステータス: 200 OK
{
  pair_id: string,         // 作成されたペアの UUID
  invite_code: string,     // 6桁英数字（例: "ABC123"）
  expires_at: string       // 有効期限（24時間後）
}
```

| ステータス | 条件 |
|-----------|------|
| 200 | コード生成成功 |
| 401 | 未認証 |
| 400 (`P0001`) | 既にアクティブなペアが存在する |

---

### 3.2 招待コードでペア参加

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.rpc('join_pair', { code })` |
| 認証 | 必要 |

**リクエスト**
```ts
{
  code: string  // 6桁英数字の招待コード
}
```

**レスポンス（成功）**
```ts
// ステータス: 200 OK
{
  pair_id: string,       // ペアの UUID
  partner_id: string     // 相手のユーザー UUID
}
```

| ステータス | 条件 |
|-----------|------|
| 200 | ペア参加成功 |
| 401 | 未認証 |
| 400 (`P0001`) | 既にアクティブなペアが存在する |
| 400 (`P0001`) | 無効または期限切れの招待コード |
| 400 (`P0001`) | 自分の招待コードは使用不可 |

---

### 3.3 現在のペア取得

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.from('pairs').select(...).eq('status', 'active').single()` |
| 認証 | 必要 |
| RLS | 当事者のみ閲覧可 |

**リクエスト**
```ts
{
  userId: string  // 自分の UUID（フィルタ条件に使用）
}
```

**レスポンス（成功）**
```ts
// ステータス: 200 OK
{
  id: string,
  user_a_id: string,
  user_b_id: string,
  status: "active",
  created_at: string,
  user_a: { id: string, display_name: string, avatar_url: string | null },
  user_b: { id: string, display_name: string, avatar_url: string | null }
}
```

| ステータス | 条件 |
|-----------|------|
| 200 | 取得成功 |
| 401 | 未認証 |
| 404 (`PGRST116`) | アクティブなペアなし |

---

### 3.4 ペア解除

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.from('pairs').update({ status: 'dissolved' }).eq('id', pairId).select().single()` |
| 認証 | 必要 |
| RLS | 当事者のみ更新可 |

**リクエスト**
```ts
{
  pairId: string  // 対象ペアの UUID
}
```

**レスポンス（成功）**
```ts
// ステータス: 200 OK
{
  id: string,
  status: "dissolved",
  user_a_id: string,
  user_b_id: string,
  created_at: string
}
```

| ステータス | 条件 |
|-----------|------|
| 200 | 解除成功 |
| 401 | 未認証 |
| 403 (`42501`) | RLS違反（当事者でない） |

---

## 4. 写真

### 4.1 写真アップロード（Storage）

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.storage.from('photos').upload(filePath, file, options)` |
| 認証 | 必要 |
| Storageポリシー | 自分のパス (`{userId}/`) にのみ書き込み可 |

**リクエスト**
```ts
{
  filePath: string,        // "{userId}/{uuid}.{ext}"
  file: File,              // 画像ファイル（JPEG/PNG/WebP、10MB以内）
  options: {
    contentType: string,   // "image/jpeg" | "image/png" | "image/webp"
    upsert: false
  }
}
```

**レスポンス（成功）**
```ts
// ステータス: 200 OK
{
  path: string  // アップロードされたファイルパス
}
```

| ステータス | 条件 |
|-----------|------|
| 200 | アップロード成功 |
| 400 | ファイルサイズ超過（10MB）/ MIME type不正 |
| 401 | 未認証 |
| 403 | Storageポリシー違反（他人のパスへのアップロード） |

---

### 4.2 写真投稿（DBレコード作成）

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.from('photos').insert().select().single()` |
| 認証 | 必要 |
| RLS | 自分の user_id + 自分の pair_id のみ |

**リクエスト**
```ts
{
  user_id: string,         // 自分の UUID
  pair_id: string,         // 自分のペア UUID
  storage_path: string,    // Storage上のファイルパス
  caption: string | null,  // キャプション（最大200文字）
  month: string            // "YYYY-MM"
}
```

**レスポンス（成功）**
```ts
// ステータス: 200 OK (201 Created)
{
  id: string,
  user_id: string,
  pair_id: string,
  storage_path: string,
  caption: string | null,
  month: string,
  created_at: string
}
```

| ステータス | 条件 |
|-----------|------|
| 201 | 投稿成功 |
| 400 | caption が200文字超 |
| 401 | 未認証 |
| 403 (`42501`) | RLS違反（他人のpair_idなど） |

---

### 4.3 フィード取得

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.from('photos').select(...).eq('pair_id', pairId).order('created_at', { ascending: false }).range(offset, offset + limit - 1)` |
| 認証 | 必要 |
| RLS | ペアの2人のみ閲覧可 |

**リクエスト**
```ts
{
  pairId: string,   // ペア UUID
  offset: number,   // 開始位置（0〜）
  limit: number     // 取得件数
}
```

**レスポンス（成功）**
```ts
// ステータス: 200 OK
[
  {
    id: string,
    user_id: string,
    pair_id: string,
    storage_path: string,
    caption: string | null,
    month: string,
    created_at: string,
    user: {
      id: string,
      display_name: string,
      avatar_url: string | null
    },
    likes: [
      { id: string, user_id: string }
    ],
    comments: [
      { count: number }
    ]
  }
]
```

| ステータス | 条件 |
|-----------|------|
| 200 | 取得成功（0件の場合は空配列 `[]`） |
| 401 | 未認証 |
| 403 (`42501`) | RLS違反 |

---

### 4.4 写真詳細取得

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.from('photos').select(...).eq('id', photoId).single()` |
| 認証 | 必要 |
| RLS | ペアの2人のみ閲覧可 |

**リクエスト**
```ts
{
  photoId: string  // 写真 UUID
}
```

**レスポンス（成功）**
```ts
// ステータス: 200 OK
{
  id: string,
  user_id: string,
  pair_id: string,
  storage_path: string,
  caption: string | null,
  month: string,
  created_at: string,
  user: {
    id: string,
    display_name: string,
    avatar_url: string | null
  },
  likes: [
    { id: string, user_id: string }
  ],
  comments: [
    {
      id: string,
      body: string,
      created_at: string,
      updated_at: string,
      user: {
        id: string,
        display_name: string,
        avatar_url: string | null
      }
    }
  ]
}
```

| ステータス | 条件 |
|-----------|------|
| 200 | 取得成功 |
| 401 | 未認証 |
| 403 (`42501`) | RLS違反 |
| 404 (`PGRST116`) | 写真が見つからない |

---

### 4.5 写真削除

| 項目 | 値 |
|------|-----|
| メソッド | (1) `supabase.from('photos').delete().eq('id', photoId)` (2) `supabase.storage.from('photos').remove([storagePath])` |
| 認証 | 必要 |
| RLS | 投稿者のみ削除可 |

**リクエスト**
```ts
{
  photoId: string,       // 写真 UUID（DB削除用）
  storagePath: string    // Storageパス（ファイル削除用）
}
```

**レスポンス（成功）**
```ts
// ステータス: 200 OK (DB)
// ステータス: 200 OK (Storage)
// レスポンスボディなし
```

| ステータス | 条件 |
|-----------|------|
| 200 | 削除成功（CASCADE で likes, comments も削除） |
| 401 | 未認証 |
| 403 (`42501`) | RLS違反（他人の写真） |

---

### 4.6 写真URL取得（署名付き）

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.storage.from('photos').createSignedUrl(storagePath, expiresIn)` |
| 認証 | 必要 |
| Storageポリシー | 自分 or ペア相手のファイルのみ |

**リクエスト**
```ts
{
  storagePath: string,   // Storageパス
  expiresIn: number      // 有効期間（秒）。推奨: 3600
}
```

**レスポンス（成功）**
```ts
// ステータス: 200 OK
{
  signedUrl: string  // 署名付きURL
}
```

| ステータス | 条件 |
|-----------|------|
| 200 | URL生成成功 |
| 400 | ファイルが存在しない |
| 401 | 未認証 |
| 403 | Storageポリシー違反 |

---

## 5. いいね

### 5.1 いいね状態確認

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.from('likes').select('id').eq('user_id', userId).eq('photo_id', photoId).maybeSingle()` |
| 認証 | 必要 |
| RLS | ペア内の写真のみ |

**リクエスト**
```ts
{
  userId: string,    // 自分の UUID
  photoId: string    // 対象写真の UUID
}
```

**レスポンス（成功）**
```ts
// ステータス: 200 OK
{ id: string }   // いいね済み
// or
null             // 未いいね
```

| ステータス | 条件 |
|-----------|------|
| 200 | 取得成功 |
| 401 | 未認証 |

---

### 5.2 いいね追加

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.from('likes').insert()` |
| 認証 | 必要 |
| RLS | 相手の写真にのみいいね可（自分の写真は不可） |

**リクエスト**
```ts
{
  user_id: string,   // 自分の UUID
  photo_id: string   // 対象写真の UUID
}
```

**レスポンス（成功）**
```ts
// ステータス: 201 Created
{
  id: string,
  user_id: string,
  photo_id: string,
  created_at: string
}
```

| ステータス | 条件 |
|-----------|------|
| 201 | いいね成功 |
| 401 | 未認証 |
| 403 (`42501`) | RLS違反（自分の写真にいいね / ペア外の写真） |
| 409 (`23505`) | 一意制約違反（既にいいね済み） |

---

### 5.3 いいね取り消し

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.from('likes').delete().eq('id', likeId)` |
| 認証 | 必要 |
| RLS | 自分のいいねのみ削除可 |

**リクエスト**
```ts
{
  likeId: string  // いいねレコードの UUID
}
```

**レスポンス（成功）**
```ts
// ステータス: 200 OK
// レスポンスボディなし
```

| ステータス | 条件 |
|-----------|------|
| 200 | 取り消し成功 |
| 401 | 未認証 |
| 403 (`42501`) | RLS違反（他人のいいね） |

---

## 6. コメント

### 6.1 コメント一覧取得

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.from('comments').select(...).eq('photo_id', photoId).order('created_at', { ascending: true })` |
| 認証 | 必要 |
| RLS | ペアの2人のみ閲覧可 |

**リクエスト**
```ts
{
  photoId: string  // 対象写真の UUID
}
```

**レスポンス（成功）**
```ts
// ステータス: 200 OK
[
  {
    id: string,
    user_id: string,
    photo_id: string,
    body: string,
    created_at: string,
    updated_at: string,
    user: {
      id: string,
      display_name: string,
      avatar_url: string | null
    }
  }
]
```

| ステータス | 条件 |
|-----------|------|
| 200 | 取得成功（0件の場合は空配列 `[]`） |
| 401 | 未認証 |
| 403 (`42501`) | RLS違反 |

---

### 6.2 コメント投稿

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.from('comments').insert().select(...).single()` |
| 認証 | 必要 |
| RLS | ペアの2人のみ投稿可 |

**リクエスト**
```ts
{
  user_id: string,    // 自分の UUID
  photo_id: string,   // 対象写真の UUID
  body: string        // コメント本文（最大200文字）
}
```

**レスポンス（成功）**
```ts
// ステータス: 201 Created
{
  id: string,
  user_id: string,
  photo_id: string,
  body: string,
  created_at: string,
  updated_at: string,
  user: {
    id: string,
    display_name: string,
    avatar_url: string | null
  }
}
```

| ステータス | 条件 |
|-----------|------|
| 201 | 投稿成功 |
| 400 | body が200文字超 / body が空 |
| 401 | 未認証 |
| 403 (`42501`) | RLS違反（ペア外の写真） |

---

### 6.3 コメント編集

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.from('comments').update().eq('id', commentId).select().single()` |
| 認証 | 必要 |
| RLS | 自分のコメントのみ編集可 |

**リクエスト**
```ts
{
  commentId: string,   // 対象コメントの UUID
  body: string,        // 更新後の本文（最大200文字）
  updated_at: string   // 更新日時（ISO 8601）
}
```

**レスポンス（成功）**
```ts
// ステータス: 200 OK
{
  id: string,
  user_id: string,
  photo_id: string,
  body: string,
  created_at: string,
  updated_at: string
}
```

| ステータス | 条件 |
|-----------|------|
| 200 | 編集成功 |
| 400 | body が200文字超 / body が空 |
| 401 | 未認証 |
| 403 (`42501`) | RLS違反（他人のコメント） |

---

### 6.4 コメント削除

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.from('comments').delete().eq('id', commentId)` |
| 認証 | 必要 |
| RLS | 自分のコメントのみ削除可 |

**リクエスト**
```ts
{
  commentId: string  // 対象コメントの UUID
}
```

**レスポンス（成功）**
```ts
// ステータス: 200 OK
// レスポンスボディなし
```

| ステータス | 条件 |
|-----------|------|
| 200 | 削除成功 |
| 401 | 未認証 |
| 403 (`42501`) | RLS違反（他人のコメント） |

---

## 7. 月間ベスト選出

### 7.1 ベスト選出 / 変更

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.rpc('select_monthly_best', { p_photo_id })` |
| 認証 | 必要 |

**リクエスト**
```ts
{
  p_photo_id: string  // 選出する写真の UUID
}
```

**レスポンス（成功）**
```ts
// ステータス: 200 OK
{
  best_id: string,     // monthly_bests レコードの UUID
  photo_id: string,    // 選出された写真の UUID
  month: string        // 対象月 "YYYY-MM"
}
```

| ステータス | 条件 |
|-----------|------|
| 200 | 選出成功（新規 or 変更） |
| 401 | 未認証 |
| 400 (`P0001`) | アクティブなペアがない |
| 400 (`P0001`) | 対象の写真が見つからない（相手の今月の写真のみ選出可能） |

---

### 7.2 今月の自分の選出状況取得

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.from('monthly_bests').select(...).eq('pair_id', pairId).eq('selector_id', userId).eq('month', currentMonth).maybeSingle()` |
| 認証 | 必要 |
| RLS | 選出者のみ閲覧可（未確定の場合） |

**リクエスト**
```ts
{
  pairId: string,       // ペア UUID
  userId: string,       // 自分の UUID
  currentMonth: string  // "YYYY-MM"
}
```

**レスポンス（成功）**
```ts
// ステータス: 200 OK
{
  id: string,
  pair_id: string,
  selector_id: string,
  photo_id: string,
  month: string,
  is_confirmed: boolean,
  created_at: string,
  confirmed_at: string | null,
  photo: {
    id: string,
    storage_path: string,
    caption: string | null,
    user_id: string,
    user: { id: string, display_name: string, avatar_url: string | null }
  }
}
// or
null  // 未選出
```

| ステータス | 条件 |
|-----------|------|
| 200 | 取得成功（未選出の場合 `null`） |
| 401 | 未認証 |

---

### 7.3 相手の今月の写真一覧（ベスト選出候補）

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.from('photos').select('*').eq('pair_id', pairId).eq('month', currentMonth).neq('user_id', userId).order('created_at', { ascending: false })` |
| 認証 | 必要 |
| RLS | ペアの2人のみ閲覧可 |

**リクエスト**
```ts
{
  pairId: string,       // ペア UUID
  userId: string,       // 自分の UUID（除外対象）
  currentMonth: string  // "YYYY-MM"
}
```

**レスポンス（成功）**
```ts
// ステータス: 200 OK
[
  {
    id: string,
    user_id: string,
    pair_id: string,
    storage_path: string,
    caption: string | null,
    month: string,
    created_at: string
  }
]
```

| ステータス | 条件 |
|-----------|------|
| 200 | 取得成功（0件の場合は空配列 `[]`） |
| 401 | 未認証 |

---

### 7.4 月間ベストアーカイブ取得

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.from('monthly_bests').select(...).eq('pair_id', pairId).eq('is_confirmed', true).order('month', { ascending: false })` |
| 認証 | 必要 |
| RLS | ペアの当事者のみ（確定済みレコード） |

**リクエスト**
```ts
{
  pairId: string  // ペア UUID
}
```

**レスポンス（成功）**
```ts
// ステータス: 200 OK
[
  {
    id: string,
    pair_id: string,
    selector_id: string,
    photo_id: string,
    month: string,
    is_confirmed: true,
    created_at: string,
    confirmed_at: string,
    selector: { id: string, display_name: string, avatar_url: string | null },
    photo: {
      id: string,
      storage_path: string,
      caption: string | null,
      user_id: string,
      user: { id: string, display_name: string, avatar_url: string | null }
    }
  }
]
```

| ステータス | 条件 |
|-----------|------|
| 200 | 取得成功（0件の場合は空配列 `[]`） |
| 401 | 未認証 |

---

### 7.5 特定月のベスト取得

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.from('monthly_bests').select(...).eq('pair_id', pairId).eq('month', targetMonth).eq('is_confirmed', true)` |
| 認証 | 必要 |
| RLS | ペアの当事者のみ |

**リクエスト**
```ts
{
  pairId: string,      // ペア UUID
  targetMonth: string  // "YYYY-MM"
}
```

**レスポンス（成功）**
```ts
// ステータス: 200 OK
[
  {
    id: string,
    pair_id: string,
    selector_id: string,
    photo_id: string,
    month: string,
    is_confirmed: true,
    confirmed_at: string,
    selector: { id: string, display_name: string, avatar_url: string | null },
    photo: {
      id: string,
      storage_path: string,
      caption: string | null,
      user: { id: string, display_name: string, avatar_url: string | null }
    }
  }
]
// 最大2件（自分が選んだベスト + 相手が選んだベスト）
```

| ステータス | 条件 |
|-----------|------|
| 200 | 取得成功（0〜2件） |
| 401 | 未認証 |

---

### 7.6 月間ベスト自動確定（Cron用）

| 項目 | 値 |
|------|-----|
| メソッド | `supabase.rpc('confirm_monthly_bests')` |
| 認証 | サービスロールキー（Cron/Edge Function から呼出） |

**リクエスト**: なし

**レスポンス（成功）**
```ts
// ステータス: 200 OK
{
  month: string,           // 確定対象月 "YYYY-MM"
  confirmed_count: number  // 確定したレコード数
}
```

| ステータス | 条件 |
|-----------|------|
| 200 | 確定処理成功 |
| 401 | 未認証 / 権限不足 |

---

## 8. エラーコード一覧

| コード | Supabase区分 | 意味 | 推奨対応 |
|--------|-------------|------|---------|
| `PGRST116` | PostgREST | `.single()` で行が見つからない | 404表示 or リダイレクト |
| `23505` | PostgreSQL | 一意制約違反 | 「既に実行済み」の旨を表示 |
| `42501` | PostgreSQL | RLS ポリシー違反 | 権限エラー表示 |
| `P0001` | PostgreSQL | `raise exception`（RPC関数） | エラーメッセージをそのまま表示 |
| `23514` | PostgreSQL | CHECK制約違反（文字数超過など） | バリデーションエラー表示 |
| — | Auth | 認証エラー各種 | ログイン画面へリダイレクト |
| — | Network | ネットワークエラー | リトライ促進メッセージ |
