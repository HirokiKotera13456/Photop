-- ============================================================
-- reset_to_v3.sql
-- 旧スキーマ（2人用）→ 新スキーマ（個人ポートフォリオ版）へリセット
--
-- Supabase SQL Editor で実行してください。
-- ※ 既存データは全て削除されます
-- ============================================================

-- ============================================================
-- 1. 旧テーブル・関数・トリガー・ポリシーを全て削除
-- ============================================================

-- Storage ポリシー削除
drop policy if exists "storage: 自分のパスにアップロード" on storage.objects;
drop policy if exists "storage: ペア内の写真を閲覧" on storage.objects;
drop policy if exists "storage: 自分の写真を閲覧" on storage.objects;
drop policy if exists "storage: 自分のファイルを更新" on storage.objects;
drop policy if exists "storage: 自分のファイルを削除" on storage.objects;

-- Storage: ポリシーのみ削除（バケットは再利用するため残す）

-- monthly_bests ポリシー削除
drop policy if exists "monthly_bests: 閲覧" on public.monthly_bests;
drop policy if exists "monthly_bests: 選出" on public.monthly_bests;
drop policy if exists "monthly_bests: 変更" on public.monthly_bests;
drop policy if exists "monthly_bests: 削除" on public.monthly_bests;

-- comments ポリシー削除（旧テーブル）
drop policy if exists "comments: ペア内の閲覧" on public.comments;
drop policy if exists "comments: ペア内の投稿" on public.comments;
drop policy if exists "comments: 自分のコメントを編集" on public.comments;
drop policy if exists "comments: 自分のコメントを削除" on public.comments;

-- likes ポリシー削除（旧テーブル）
drop policy if exists "likes: ペア内の閲覧" on public.likes;
drop policy if exists "likes: 相手の写真にいいね" on public.likes;
drop policy if exists "likes: 自分のいいねを取り消し" on public.likes;

-- photos ポリシー削除
drop policy if exists "photos: ペアの2人のみ閲覧" on public.photos;
drop policy if exists "photos: 自分の写真を閲覧" on public.photos;
drop policy if exists "photos: 投稿" on public.photos;
drop policy if exists "photos: 投稿者のみ削除" on public.photos;

-- pairs ポリシー削除（旧テーブル）
drop policy if exists "pairs: 当事者のみ閲覧" on public.pairs;
drop policy if exists "pairs: ペアを作成" on public.pairs;
drop policy if exists "pairs: 当事者のみ更新" on public.pairs;

-- profiles ポリシー削除
drop policy if exists "profiles: 自分のプロフィールを閲覧" on public.profiles;
drop policy if exists "profiles: ペア相手のプロフィールを閲覧" on public.profiles;
drop policy if exists "profiles: 自分のプロフィールを更新" on public.profiles;
drop policy if exists "profiles: 自分のプロフィールを作成" on public.profiles;

-- トリガー削除
drop trigger if exists on_auth_user_created on auth.users;

-- 関数削除
drop function if exists public.handle_new_user();
drop function if exists public.generate_invite_code();
drop function if exists public.join_pair(text);
drop function if exists public.select_monthly_best(uuid);
drop function if exists public.confirm_monthly_bests();
drop function if exists public.get_my_pair_id();
drop function if exists public.is_pair_partner(uuid);

-- テーブル削除（依存順）
drop table if exists public.monthly_bests cascade;
drop table if exists public.comments cascade;
drop table if exists public.likes cascade;
drop table if exists public.photos cascade;
drop table if exists public.pairs cascade;
drop table if exists public.profiles cascade;

-- ============================================================
-- 2. 新テーブル作成（00001_create_tables.sql）
-- ============================================================

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);
comment on table public.profiles is 'ユーザーの公開プロフィール';

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  caption text check (char_length(caption) <= 200),
  month text not null,
  created_at timestamptz not null default now()
);
comment on table public.photos is '写真投稿';
create index idx_photos_user_month on public.photos(user_id, month);
create index idx_photos_user on public.photos(user_id);

create table public.monthly_bests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  photo_id uuid not null references public.photos(id) on delete cascade,
  month text not null,
  is_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unique (user_id, month)
);
comment on table public.monthly_bests is '月間ベスト選出';
create index idx_monthly_bests_user_month on public.monthly_bests(user_id, month);

-- ============================================================
-- 3. RLS ポリシー（00002_create_rls_policies.sql）
-- ============================================================

alter table public.profiles enable row level security;
alter table public.photos enable row level security;
alter table public.monthly_bests enable row level security;

-- profiles
create policy "profiles: 自分のプロフィールを閲覧"
  on public.profiles for select using (id = auth.uid());
create policy "profiles: 自分のプロフィールを更新"
  on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles: 自分のプロフィールを作成"
  on public.profiles for insert with check (id = auth.uid());

-- photos
create policy "photos: 自分の写真を閲覧"
  on public.photos for select using (user_id = auth.uid());
create policy "photos: 投稿"
  on public.photos for insert with check (user_id = auth.uid());
create policy "photos: 投稿者のみ削除"
  on public.photos for delete using (user_id = auth.uid());

-- monthly_bests
create policy "monthly_bests: 閲覧"
  on public.monthly_bests for select using (user_id = auth.uid());
create policy "monthly_bests: 選出"
  on public.monthly_bests for insert with check (user_id = auth.uid());
create policy "monthly_bests: 変更"
  on public.monthly_bests for update
  using (user_id = auth.uid() and is_confirmed = false)
  with check (user_id = auth.uid());
create policy "monthly_bests: 削除"
  on public.monthly_bests for delete
  using (user_id = auth.uid() and is_confirmed = false);

-- ============================================================
-- 4. 関数 & トリガー（00003_create_functions.sql）
-- ============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.select_monthly_best(p_photo_id uuid)
returns json language plpgsql security definer set search_path = ''
as $$
declare
  v_photo record;
  v_current_month text;
  v_best_id uuid;
begin
  v_current_month := to_char(now() at time zone 'Asia/Tokyo', 'YYYY-MM');

  select * into v_photo from public.photos
  where id = p_photo_id and user_id = auth.uid() and month = v_current_month;

  if v_photo is null then
    raise exception '対象の写真が見つかりません（自分の今月の写真のみ選出可能）';
  end if;

  insert into public.monthly_bests (user_id, photo_id, month)
  values (auth.uid(), p_photo_id, v_current_month)
  on conflict (user_id, month)
  do update set photo_id = excluded.photo_id, created_at = now()
  returning id into v_best_id;

  return json_build_object('best_id', v_best_id, 'photo_id', p_photo_id, 'month', v_current_month);
end;
$$;

create or replace function public.confirm_monthly_bests()
returns json language plpgsql security definer set search_path = ''
as $$
declare
  v_target_month text;
  v_updated_count int;
begin
  v_target_month := to_char((now() at time zone 'Asia/Tokyo') - interval '1 month', 'YYYY-MM');

  update public.monthly_bests
  set is_confirmed = true, confirmed_at = now()
  where month = v_target_month and is_confirmed = false;

  get diagnostics v_updated_count = row_count;

  return json_build_object('month', v_target_month, 'confirmed_count', v_updated_count);
end;
$$;

-- ============================================================
-- 5. Storage バケット & ポリシー（00004_create_storage.sql）
-- ============================================================

-- バケットが存在しない場合のみ作成
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "storage: 自分のパスにアップロード"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "storage: 自分の写真を閲覧"
  on storage.objects for select to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "storage: 自分のファイルを更新"
  on storage.objects for update to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "storage: 自分のファイルを削除"
  on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- 6. 既存ユーザーの profiles レコード作成（もし足りなければ）
-- ============================================================
insert into public.profiles (id, display_name, avatar_url)
select
  id,
  coalesce(raw_user_meta_data->>'display_name', split_part(email, '@', 1)),
  raw_user_meta_data->>'avatar_url'
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;
