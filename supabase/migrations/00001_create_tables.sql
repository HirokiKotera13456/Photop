-- ============================================================
-- 00001_create_tables.sql
-- Photop: テーブル定義（個人ポートフォリオ版）
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
-- 2. photos — 写真投稿
-- --------------------------------------------------------
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  caption text check (char_length(caption) <= 200),
  month text not null, -- YYYY-MM
  created_at timestamptz not null default now()
);

comment on table public.photos is '写真投稿';

create index idx_photos_user_month on public.photos(user_id, month);
create index idx_photos_user on public.photos(user_id);

-- --------------------------------------------------------
-- 3. monthly_bests — 月間ベスト選出
-- --------------------------------------------------------
create table public.monthly_bests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  photo_id uuid not null references public.photos(id) on delete cascade,
  month text not null, -- YYYY-MM
  is_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unique (user_id, month)
);

comment on table public.monthly_bests is '月間ベスト選出';

create index idx_monthly_bests_user_month on public.monthly_bests(user_id, month);
