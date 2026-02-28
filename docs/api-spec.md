# Photop API仕様書

Supabase クライアント (`@supabase/supabase-js`) を使用した API 呼び出し定義。

---

## 1. 認証（Supabase Auth）

### 1.1 サインアップ

```ts
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      display_name: '表示名',
    },
  },
});
```

- `profiles` レコードはトリガー (`handle_new_user`) で自動作成される
- `options.data` に `display_name` を渡すと `profiles.display_name` に反映

### 1.2 ログイン

```ts
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});
```

### 1.3 ログアウト

```ts
const { error } = await supabase.auth.signOut();
```

### 1.4 セッション取得

```ts
const { data: { session } } = await supabase.auth.getSession();
const { data: { user } } = await supabase.auth.getUser();
```

### 1.5 認証状態の監視

```ts
supabase.auth.onAuthStateChange((event, session) => {
  // SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.
});
```

---

## 2. プロフィール

### 2.1 自分のプロフィール取得

```ts
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

### 2.2 プロフィール更新

```ts
const { data, error } = await supabase
  .from('profiles')
  .update({
    display_name: '新しい表示名',
    avatar_url: 'https://...',
  })
  .eq('id', userId)
  .select()
  .single();
```

---

## 3. ペアリング

### 3.1 招待コード生成

```ts
const { data, error } = await supabase.rpc('generate_invite_code');
// data: { pair_id, invite_code, expires_at }
```

### 3.2 招待コードでペア参加

```ts
const { data, error } = await supabase.rpc('join_pair', {
  code: 'ABC123',
});
// data: { pair_id, partner_id }
```

### 3.3 現在のペア取得

```ts
const { data, error } = await supabase
  .from('pairs')
  .select('*, user_a:profiles!user_a_id(*), user_b:profiles!user_b_id(*)')
  .eq('status', 'active')
  .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
  .single();
```

### 3.4 ペア解除

```ts
const { data, error } = await supabase
  .from('pairs')
  .update({ status: 'dissolved' })
  .eq('id', pairId)
  .select()
  .single();
```

---

## 4. 写真

### 4.1 写真アップロード（Storage）

```ts
const filePath = `${userId}/${crypto.randomUUID()}.${ext}`;
const { data, error } = await supabase.storage
  .from('photos')
  .upload(filePath, file, {
    contentType: file.type,
    upsert: false,
  });
```

### 4.2 写真投稿（DB レコード作成）

```ts
const { data, error } = await supabase
  .from('photos')
  .insert({
    user_id: userId,
    pair_id: pairId,
    storage_path: filePath,
    caption: 'キャプション',
    month: '2026-02', // YYYY-MM
  })
  .select()
  .single();
```

### 4.3 フィード取得（新しい順）

```ts
const { data, error } = await supabase
  .from('photos')
  .select(`
    *,
    user:profiles!user_id(id, display_name, avatar_url),
    likes(id, user_id),
    comments(count)
  `)
  .eq('pair_id', pairId)
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1);
```

### 4.4 写真詳細取得

```ts
const { data, error } = await supabase
  .from('photos')
  .select(`
    *,
    user:profiles!user_id(id, display_name, avatar_url),
    likes(id, user_id),
    comments(
      id, body, created_at, updated_at,
      user:profiles!user_id(id, display_name, avatar_url)
    )
  `)
  .eq('id', photoId)
  .single();
```

### 4.5 写真削除

```ts
// 1. DB レコード削除（CASCADE で likes, comments も削除）
const { error: dbError } = await supabase
  .from('photos')
  .delete()
  .eq('id', photoId);

// 2. Storage からファイル削除
const { error: storageError } = await supabase.storage
  .from('photos')
  .remove([storagePath]);
```

### 4.6 写真URL取得（署名付き）

```ts
const { data } = await supabase.storage
  .from('photos')
  .createSignedUrl(storagePath, 3600); // 1時間有効
```

---

## 5. いいね

### 5.1 いいねトグル

```ts
// いいね状態を確認
const { data: existing } = await supabase
  .from('likes')
  .select('id')
  .eq('user_id', userId)
  .eq('photo_id', photoId)
  .maybeSingle();

if (existing) {
  // いいね取り消し
  await supabase.from('likes').delete().eq('id', existing.id);
} else {
  // いいね
  await supabase.from('likes').insert({
    user_id: userId,
    photo_id: photoId,
  });
}
```

---

## 6. コメント

### 6.1 コメント一覧取得（古い順）

```ts
const { data, error } = await supabase
  .from('comments')
  .select(`
    *,
    user:profiles!user_id(id, display_name, avatar_url)
  `)
  .eq('photo_id', photoId)
  .order('created_at', { ascending: true });
```

### 6.2 コメント投稿

```ts
const { data, error } = await supabase
  .from('comments')
  .insert({
    user_id: userId,
    photo_id: photoId,
    body: 'コメント内容',
  })
  .select(`
    *,
    user:profiles!user_id(id, display_name, avatar_url)
  `)
  .single();
```

### 6.3 コメント編集

```ts
const { data, error } = await supabase
  .from('comments')
  .update({
    body: '更新されたコメント',
    updated_at: new Date().toISOString(),
  })
  .eq('id', commentId)
  .select()
  .single();
```

### 6.4 コメント削除

```ts
const { error } = await supabase
  .from('comments')
  .delete()
  .eq('id', commentId);
```

---

## 7. 月間ベスト選出

### 7.1 ベスト選出 / 変更

```ts
const { data, error } = await supabase.rpc('select_monthly_best', {
  p_photo_id: photoId,
});
// data: { best_id, photo_id, month }
```

### 7.2 今月の自分の選出状況取得

```ts
const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
const { data, error } = await supabase
  .from('monthly_bests')
  .select(`
    *,
    photo:photos!photo_id(*, user:profiles!user_id(*))
  `)
  .eq('pair_id', pairId)
  .eq('selector_id', userId)
  .eq('month', currentMonth)
  .maybeSingle();
```

### 7.3 相手の今月の写真一覧（ベスト選出候補）

```ts
const currentMonth = new Date().toISOString().slice(0, 7);
const { data, error } = await supabase
  .from('photos')
  .select('*')
  .eq('pair_id', pairId)
  .eq('month', currentMonth)
  .neq('user_id', userId)
  .order('created_at', { ascending: false });
```

### 7.4 月間ベストアーカイブ取得

```ts
const { data, error } = await supabase
  .from('monthly_bests')
  .select(`
    *,
    selector:profiles!selector_id(id, display_name, avatar_url),
    photo:photos!photo_id(id, storage_path, caption, user_id,
      user:profiles!user_id(id, display_name, avatar_url)
    )
  `)
  .eq('pair_id', pairId)
  .eq('is_confirmed', true)
  .order('month', { ascending: false });
```

### 7.5 特定月のベスト取得

```ts
const { data, error } = await supabase
  .from('monthly_bests')
  .select(`
    *,
    selector:profiles!selector_id(id, display_name, avatar_url),
    photo:photos!photo_id(id, storage_path, caption,
      user:profiles!user_id(id, display_name, avatar_url)
    )
  `)
  .eq('pair_id', pairId)
  .eq('month', targetMonth)
  .eq('is_confirmed', true);
```

---

## 8. エラーハンドリング方針

| エラー種別 | 対応 |
|-----------|------|
| `PGRST116` (行が見つからない) | 404表示 or リダイレクト |
| `23505` (一意制約違反) | 重複操作の旨を表示 |
| `42501` (RLS違反) | 権限エラー表示 |
| RPC例外 (raise exception) | エラーメッセージをそのまま表示 |
| ネットワークエラー | リトライ促進メッセージ |
