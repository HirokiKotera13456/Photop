-- ============================================================
-- 00002_create_rls_policies.sql
-- Photop: Row Level Security ポリシー
-- ============================================================

-- ========== RLS 有効化 ==========
alter table public.profiles enable row level security;
alter table public.pairs enable row level security;
alter table public.photos enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.monthly_bests enable row level security;

-- ============================================================
-- ヘルパー関数: 現在のユーザーのアクティブな pair_id を取得
-- ============================================================
create or replace function public.get_my_pair_id()
returns uuid
language sql
stable
security definer
as $$
  select id from public.pairs
  where status = 'active'
    and (user_a_id = auth.uid() or user_b_id = auth.uid())
  limit 1;
$$;

-- ============================================================
-- ヘルパー関数: 指定ユーザーが自分のペア相手かどうか
-- ============================================================
create or replace function public.is_pair_partner(target_user_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.pairs
    where status = 'active'
      and (
        (user_a_id = auth.uid() and user_b_id = target_user_id)
        or (user_b_id = auth.uid() and user_a_id = target_user_id)
      )
  );
$$;

-- ============================================================
-- profiles ポリシー
-- ============================================================

-- 自分のプロフィールは常に閲覧可
create policy "profiles: 自分のプロフィールを閲覧"
  on public.profiles for select
  using (id = auth.uid());

-- ペア相手のプロフィールも閲覧可
create policy "profiles: ペア相手のプロフィールを閲覧"
  on public.profiles for select
  using (public.is_pair_partner(id));

-- 自分のプロフィールのみ更新可
create policy "profiles: 自分のプロフィールを更新"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- 自分のプロフィールの INSERT（トリガーから作成されるが、念のため）
create policy "profiles: 自分のプロフィールを作成"
  on public.profiles for insert
  with check (id = auth.uid());

-- ============================================================
-- pairs ポリシー
-- ============================================================

-- ペアの当事者のみ閲覧可
create policy "pairs: 当事者のみ閲覧"
  on public.pairs for select
  using (user_a_id = auth.uid() or user_b_id = auth.uid());

-- ペア作成（自分が user_a として作成）
create policy "pairs: ペアを作成"
  on public.pairs for insert
  with check (user_a_id = auth.uid());

-- ペアの当事者のみ更新可（参加・解除）
create policy "pairs: 当事者のみ更新"
  on public.pairs for update
  using (user_a_id = auth.uid() or user_b_id = auth.uid());

-- ============================================================
-- photos ポリシー
-- ============================================================

-- ペアの2人のみ閲覧可
create policy "photos: ペアの2人のみ閲覧"
  on public.photos for select
  using (pair_id = public.get_my_pair_id());

-- 投稿（自分の user_id で、自分の pair_id に対してのみ）
create policy "photos: 投稿"
  on public.photos for insert
  with check (
    user_id = auth.uid()
    and pair_id = public.get_my_pair_id()
  );

-- 投稿者のみ削除可
create policy "photos: 投稿者のみ削除"
  on public.photos for delete
  using (user_id = auth.uid());

-- ============================================================
-- likes ポリシー
-- ============================================================

-- ペアの2人が閲覧可（写真が自分のペア内であること）
create policy "likes: ペア内の閲覧"
  on public.likes for select
  using (
    exists (
      select 1 from public.photos p
      where p.id = photo_id
        and p.pair_id = public.get_my_pair_id()
    )
  );

-- 相手の写真にのみいいね可（自分の写真にはいいね不可）
create policy "likes: 相手の写真にいいね"
  on public.likes for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.photos p
      where p.id = photo_id
        and p.pair_id = public.get_my_pair_id()
        and p.user_id != auth.uid()
    )
  );

-- 自分のいいねのみ取り消し可
create policy "likes: 自分のいいねを取り消し"
  on public.likes for delete
  using (user_id = auth.uid());

-- ============================================================
-- comments ポリシー
-- ============================================================

-- ペアの2人のみ閲覧可
create policy "comments: ペア内の閲覧"
  on public.comments for select
  using (
    exists (
      select 1 from public.photos p
      where p.id = photo_id
        and p.pair_id = public.get_my_pair_id()
    )
  );

-- ペアの2人のみ投稿可
create policy "comments: ペア内の投稿"
  on public.comments for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.photos p
      where p.id = photo_id
        and p.pair_id = public.get_my_pair_id()
    )
  );

-- 自分のコメントのみ編集可
create policy "comments: 自分のコメントを編集"
  on public.comments for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 自分のコメントのみ削除可
create policy "comments: 自分のコメントを削除"
  on public.comments for delete
  using (user_id = auth.uid());

-- ============================================================
-- monthly_bests ポリシー
-- ============================================================

-- 確定済みはペアの当事者が閲覧可、未確定は選出者のみ閲覧可
create policy "monthly_bests: 閲覧"
  on public.monthly_bests for select
  using (
    pair_id = public.get_my_pair_id()
    and (
      is_confirmed = true
      or selector_id = auth.uid()
    )
  );

-- 選出（自分のペア内で自分が selector）
create policy "monthly_bests: 選出"
  on public.monthly_bests for insert
  with check (
    selector_id = auth.uid()
    and pair_id = public.get_my_pair_id()
  );

-- 選出者のみ変更可（確定前のみ）
create policy "monthly_bests: 変更"
  on public.monthly_bests for update
  using (
    selector_id = auth.uid()
    and is_confirmed = false
  )
  with check (
    selector_id = auth.uid()
    and pair_id = public.get_my_pair_id()
  );

-- 選出者のみ削除可（確定前のみ）
create policy "monthly_bests: 削除"
  on public.monthly_bests for delete
  using (
    selector_id = auth.uid()
    and is_confirmed = false
  );
