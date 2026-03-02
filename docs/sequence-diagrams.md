# Photop シーケンス図

主要なユーザーフローをシーケンス図で示す。

---

## 1. 認証フロー（サインアップ）

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant App as Next.js App
    participant Auth as Supabase Auth
    participant DB as Supabase DB
    participant Trigger as handle_new_user()

    User->>App: メール・パスワード・表示名を入力
    App->>Auth: signUp({ email, password, options: { data: { display_name } } })
    Auth->>Auth: ユーザー作成（auth.users INSERT）
    Auth-->>Trigger: AFTER INSERT トリガー発火
    Trigger->>DB: INSERT INTO profiles (id, display_name)
    DB-->>Trigger: OK
    Auth-->>App: { user, session }
    App->>App: ペア状態チェック
    alt ペアなし
        App-->>User: /pairing へリダイレクト
    else ペアあり
        App-->>User: /feed へリダイレクト
    end
```

---

## 2. 認証フロー（ログイン）

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant App as Next.js App
    participant Auth as Supabase Auth

    User->>App: メール・パスワードを入力
    App->>Auth: signInWithPassword({ email, password })
    Auth->>Auth: 認証情報検証
    alt 認証成功
        Auth-->>App: { user, session }
        App->>App: ペア状態チェック
        App-->>User: /feed or /pairing へリダイレクト
    else 認証失敗
        Auth-->>App: error
        App-->>User: エラーメッセージ表示
    end
```

---

## 3. ペアリングフロー（招待コード生成 → 参加）

```mermaid
sequenceDiagram
    actor UserA as ユーザーA（招待者）
    actor UserB as ユーザーB（参加者）
    participant AppA as App (A)
    participant AppB as App (B)
    participant RPC as Supabase RPC
    participant DB as Supabase DB

    Note over UserA, UserB: --- 招待コード生成 ---
    UserA->>AppA: 「コードを生成する」ボタン
    AppA->>RPC: generate_invite_code()
    RPC->>RPC: 既存アクティブペアチェック
    RPC->>RPC: 6桁英数字コード生成
    RPC->>DB: INSERT INTO pairs (user_a_id, invite_code, status='pending')
    DB-->>RPC: OK
    RPC-->>AppA: { pair_id, invite_code, expires_at }
    AppA-->>UserA: コード表示 "ABC123"

    Note over UserA, UserB: --- コードを共有（LINE等） ---
    UserA->>UserB: 招待コード "ABC123" を送る

    Note over UserA, UserB: --- ペア参加 ---
    UserB->>AppB: コード "ABC123" を入力
    AppB->>RPC: join_pair('ABC123')
    RPC->>RPC: 既存アクティブペアチェック
    RPC->>DB: SELECT * FROM pairs WHERE invite_code = 'ABC123'
    DB-->>RPC: ペアレコード
    RPC->>RPC: 有効期限チェック / 自己参加チェック
    RPC->>DB: UPDATE pairs SET user_b_id, status='active'
    DB-->>RPC: OK
    RPC-->>AppB: { pair_id, partner_id }
    AppB-->>UserB: /feed へリダイレクト
```

---

## 4. 写真投稿フロー

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant App as Next.js App
    participant Storage as Supabase Storage
    participant DB as Supabase DB

    User->>App: 写真を選択
    App->>App: プレビュー表示
    User->>App: キャプション入力 → 「投稿」ボタン

    App->>Storage: upload('{userId}/{uuid}.jpg', file)
    Storage->>Storage: RLSチェック（自分のパスか）
    Storage-->>App: { path: '{userId}/{uuid}.jpg' }

    App->>DB: INSERT INTO photos (user_id, pair_id, storage_path, caption, month)
    DB->>DB: RLSチェック（自分のpair_idか）
    DB-->>App: { id, ... }

    App-->>User: /feed へリダイレクト（投稿完了）
```

---

## 5. いいねフロー（トグル）

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant App as Next.js App
    participant DB as Supabase DB

    User->>App: ❤️ タップ or ダブルタップ

    App->>DB: SELECT id FROM likes WHERE user_id = me AND photo_id = ?
    DB-->>App: existing or null

    alt いいね済み（取り消し）
        App->>DB: DELETE FROM likes WHERE id = existing.id
        DB-->>App: OK
        App-->>User: ❤️ → 🤍（グレーに変更）
    else 未いいね（追加）
        App->>DB: INSERT INTO likes (user_id, photo_id)
        DB->>DB: RLSチェック（相手の写真か）
        DB-->>App: OK
        App-->>User: 🤍 → ❤️（赤に変更 + アニメーション）
    end
```

---

## 6. コメントフロー

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant App as Next.js App
    participant DB as Supabase DB

    Note over User, DB: --- コメント投稿 ---
    User->>App: コメント入力 → 送信
    App->>DB: INSERT INTO comments (user_id, photo_id, body)
    DB->>DB: RLSチェック（ペア内の写真か）
    DB-->>App: { id, body, created_at, user: {...} }
    App-->>User: コメント一覧に追加表示

    Note over User, DB: --- コメント編集 ---
    User->>App: 自分のコメントを長押し → 編集
    App->>DB: UPDATE comments SET body = '...' WHERE id = ?
    DB->>DB: RLSチェック（自分のコメントか）
    DB-->>App: OK
    App-->>User: コメント更新表示

    Note over User, DB: --- コメント削除 ---
    User->>App: 自分のコメントを長押し → 削除
    App->>DB: DELETE FROM comments WHERE id = ?
    DB->>DB: RLSチェック（自分のコメントか）
    DB-->>App: OK
    App-->>User: コメント一覧から除去
```

---

## 7. 月間ベスト選出フロー

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant App as Next.js App
    participant RPC as Supabase RPC
    participant DB as Supabase DB

    Note over User, DB: --- ベスト選出 ---
    User->>App: /best 画面を開く
    App->>DB: SELECT * FROM photos WHERE pair_id = ? AND user_id != me AND month = '2026-02'
    DB-->>App: 相手の今月の写真一覧
    App-->>User: 写真グリッド表示

    User->>App: 写真をタップして選出
    App->>RPC: select_monthly_best(photo_id)
    RPC->>RPC: ペア・写真の検証
    RPC->>DB: INSERT/UPDATE monthly_bests (UPSERT)
    DB-->>RPC: OK
    RPC-->>App: { best_id, photo_id, month }
    App-->>User: ✅ 選出完了表示
```

---

## 8. 月間ベスト自動確定フロー（Cron）

```mermaid
sequenceDiagram
    participant Cron as Cron Job / Edge Function
    participant RPC as Supabase RPC
    participant DB as Supabase DB

    Note over Cron, DB: 毎月1日 00:00 (JST) に実行
    Cron->>RPC: confirm_monthly_bests()
    RPC->>RPC: 対象月 = 前月（YYYY-MM）を算出
    RPC->>DB: UPDATE monthly_bests SET is_confirmed = true WHERE month = 前月 AND is_confirmed = false
    DB-->>RPC: updated_count
    RPC-->>Cron: { month: '2026-01', confirmed_count: 4 }

    Note over Cron, DB: 以降、両者のベストが互いに閲覧可能に
```

---

## 9. ペア解除フロー

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant App as Next.js App
    participant DB as Supabase DB

    User->>App: 設定画面 → 「ペアを解除する」
    App-->>User: 確認ダイアログ表示
    User->>App: 「解除する」を確認

    App->>DB: UPDATE pairs SET status = 'dissolved' WHERE id = pair_id
    DB->>DB: RLSチェック（当事者か）
    DB-->>App: OK

    App-->>User: /pairing へリダイレクト
    Note over User, DB: データは保持される（削除されない）
```
