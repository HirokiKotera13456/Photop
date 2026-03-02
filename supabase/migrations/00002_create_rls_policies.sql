-- ============================================================
-- 00002_create_rls_policies.sql
-- Photop: Row Level Security ポリシー（個人ポートフォリオ版）
-- ============================================================

-- ========== RLS 有効化 ==========
alter table public.profiles enable row level security;
alter table public.photos enable row level security;
alter table public.monthly_bests enable row level security;

-- ============================================================
-- profiles ポリシー
-- ============================================================

-- 自分のプロフィールを閲覧
create policy "profiles: 自分のプロフィールを閲覧"
  on public.profiles for select
  using (id = auth.uid());

-- 自分のプロフィールのみ更新可
create policy "profiles: 自分のプロフィールを更新"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- 自分のプロフィールの INSERT（トリガーから作成）
create policy "profiles: 自分のプロフィールを作成"
  on public.profiles for insert
  with check (id = auth.uid());

-- ============================================================
-- photos ポリシー
-- ============================================================

-- 自分の写真のみ閲覧可
create policy "photos: 自分の写真を閲覧"
  on public.photos for select
  using (user_id = auth.uid());

-- 自分の写真を投稿
create policy "photos: 投稿"
  on public.photos for insert
  with check (user_id = auth.uid());

-- 自分の写真のみ削除可
create policy "photos: 投稿者のみ削除"
  on public.photos for delete
  using (user_id = auth.uid());

-- ============================================================
-- monthly_bests ポリシー
-- ============================================================

-- 自分のベストを閲覧
create policy "monthly_bests: 閲覧"
  on public.monthly_bests for select
  using (user_id = auth.uid());

-- 自分のベストを選出
create policy "monthly_bests: 選出"
  on public.monthly_bests for insert
  with check (user_id = auth.uid());

-- 確定前のみ変更可
create policy "monthly_bests: 変更"
  on public.monthly_bests for update
  using (user_id = auth.uid() and is_confirmed = false)
  with check (user_id = auth.uid());

-- 確定前のみ削除可
create policy "monthly_bests: 削除"
  on public.monthly_bests for delete
  using (user_id = auth.uid() and is_confirmed = false);
