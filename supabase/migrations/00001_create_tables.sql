-- ============================================================
-- 00001_create_tables.sql
-- Photop: テーブル定義（requirement.md セクション7準拠）
-- ============================================================

-- --------------------------------------------------------
-- 1. profiles — ユーザープロフィール（auth.users 参照）
-- --------------------------------------------------------
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'ユーザーの公開プロフィール';

-- --------------------------------------------------------
-- 2. pairs — ペアリング管理
-- --------------------------------------------------------
create table public.pairs (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references public.profiles(id) on delete cascade,
  user_b_id uuid references public.profiles(id) on delete cascade, -- 参加前は NULL
  invite_code text unique,
  invite_expires_at timestamptz,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'dissolved')),
  created_at timestamptz not null default now()
);

comment on table public.pairs is 'ペアリング管理（2人の紐付け）';

create index idx_pairs_invite_code on public.pairs(invite_code) where status = 'pending';
create index idx_pairs_user_a on public.pairs(user_a_id);
create index idx_pairs_user_b on public.pairs(user_b_id);

-- --------------------------------------------------------
-- 3. photos — 写真投稿
-- --------------------------------------------------------
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pair_id uuid not null references public.pairs(id) on delete cascade,
  storage_path text not null,
  caption text check (char_length(caption) <= 200),
  month text not null, -- YYYY-MM
  created_at timestamptz not null default now()
);

comment on table public.photos is '写真投稿';

create index idx_photos_pair_month on public.photos(pair_id, month);
create index idx_photos_user on public.photos(user_id);

-- --------------------------------------------------------
-- 4. likes — いいね
-- --------------------------------------------------------
create table public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  photo_id uuid not null references public.photos(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, photo_id)
);

comment on table public.likes is 'いいね';

create index idx_likes_photo on public.likes(photo_id);

-- --------------------------------------------------------
-- 5. comments — コメント
-- --------------------------------------------------------
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  photo_id uuid not null references public.photos(id) on delete cascade,
  body text not null check (char_length(body) <= 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.comments is 'コメント';

create index idx_comments_photo on public.comments(photo_id);

-- --------------------------------------------------------
-- 6. monthly_bests — 月間ベスト選出
-- --------------------------------------------------------
create table public.monthly_bests (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid not null references public.pairs(id) on delete cascade,
  selector_id uuid not null references public.profiles(id) on delete cascade,
  photo_id uuid not null references public.photos(id) on delete cascade,
  month text not null, -- YYYY-MM
  is_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unique (pair_id, selector_id, month)
);

comment on table public.monthly_bests is '月間ベスト選出';

create index idx_monthly_bests_pair_month on public.monthly_bests(pair_id, month);
