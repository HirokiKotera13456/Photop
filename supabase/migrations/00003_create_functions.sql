-- ============================================================
-- 00003_create_functions.sql
-- Photop: RPC関数 & トリガー
-- ============================================================

-- ============================================================
-- トリガー: 新規ユーザー登録時に profiles を自動作成
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================================
-- RPC: generate_invite_code() — 招待コード生成 & ペア作成
-- ============================================================
create or replace function public.generate_invite_code()
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code text;
  v_pair_id uuid;
  v_existing_pair uuid;
begin
  -- 既にアクティブなペアがある場合はエラー
  select id into v_existing_pair
  from public.pairs
  where status = 'active'
    and (user_a_id = auth.uid() or user_b_id = auth.uid());

  if v_existing_pair is not null then
    raise exception 'すでにペアが存在します';
  end if;

  -- 既存の pending ペアがあれば削除
  delete from public.pairs
  where user_a_id = auth.uid() and status = 'pending';

  -- 6桁英数字のコード生成（衝突回避ループ）
  loop
    v_code := upper(substr(replace(encode(gen_random_bytes(4), 'base64'), '/', ''), 1, 6));
    exit when not exists (
      select 1 from public.pairs where invite_code = v_code and status = 'pending'
    );
  end loop;

  insert into public.pairs (user_a_id, invite_code, invite_expires_at, status)
  values (auth.uid(), v_code, now() + interval '24 hours', 'pending')
  returning id into v_pair_id;

  return json_build_object(
    'pair_id', v_pair_id,
    'invite_code', v_code,
    'expires_at', (now() + interval '24 hours')
  );
end;
$$;

-- ============================================================
-- RPC: join_pair(code text) — 招待コードでペア参加
-- ============================================================
create or replace function public.join_pair(code text)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pair record;
  v_existing_pair uuid;
begin
  -- 既にアクティブなペアがある場合はエラー
  select id into v_existing_pair
  from public.pairs
  where status = 'active'
    and (user_a_id = auth.uid() or user_b_id = auth.uid());

  if v_existing_pair is not null then
    raise exception 'すでにペアが存在します';
  end if;

  -- 招待コードを検索
  select * into v_pair
  from public.pairs
  where invite_code = upper(code)
    and status = 'pending'
    and invite_expires_at > now();

  if v_pair is null then
    raise exception '無効または期限切れの招待コードです';
  end if;

  -- 自分自身のコードは使えない
  if v_pair.user_a_id = auth.uid() then
    raise exception '自分の招待コードは使用できません';
  end if;

  -- ペア参加
  update public.pairs
  set user_b_id = auth.uid(),
      status = 'active',
      invite_code = null,
      invite_expires_at = null
  where id = v_pair.id;

  return json_build_object(
    'pair_id', v_pair.id,
    'partner_id', v_pair.user_a_id
  );
end;
$$;

-- ============================================================
-- RPC: select_monthly_best(p_photo_id uuid) — 月間ベスト選出/変更
-- ============================================================
create or replace function public.select_monthly_best(p_photo_id uuid)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_photo record;
  v_pair_id uuid;
  v_current_month text;
  v_best_id uuid;
begin
  v_current_month := to_char(now() at time zone 'Asia/Tokyo', 'YYYY-MM');

  -- 自分のアクティブなペアを取得
  select id into v_pair_id
  from public.pairs
  where status = 'active'
    and (user_a_id = auth.uid() or user_b_id = auth.uid());

  if v_pair_id is null then
    raise exception 'アクティブなペアがありません';
  end if;

  -- 写真を検証（ペア内の相手の写真で、今月のもの）
  select * into v_photo
  from public.photos
  where id = p_photo_id
    and pair_id = v_pair_id
    and user_id != auth.uid()
    and month = v_current_month;

  if v_photo is null then
    raise exception '対象の写真が見つかりません（相手の今月の写真のみ選出可能）';
  end if;

  -- UPSERT: 既存の選出を更新、なければ新規作成
  insert into public.monthly_bests (pair_id, selector_id, photo_id, month)
  values (v_pair_id, auth.uid(), p_photo_id, v_current_month)
  on conflict (pair_id, selector_id, month)
  do update set
    photo_id = excluded.photo_id,
    created_at = now()
  returning id into v_best_id;

  return json_build_object(
    'best_id', v_best_id,
    'photo_id', p_photo_id,
    'month', v_current_month
  );
end;
$$;

-- ============================================================
-- RPC: confirm_monthly_bests() — 月初の自動確定処理
-- Cron（pg_cron or Edge Function）から呼び出し
-- ============================================================
create or replace function public.confirm_monthly_bests()
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_target_month text;
  v_updated_count int;
begin
  -- 前月を対象とする
  v_target_month := to_char(
    (now() at time zone 'Asia/Tokyo') - interval '1 month',
    'YYYY-MM'
  );

  -- 前月の未確定レコードを全て確定
  update public.monthly_bests
  set is_confirmed = true,
      confirmed_at = now()
  where month = v_target_month
    and is_confirmed = false;

  get diagnostics v_updated_count = row_count;

  return json_build_object(
    'month', v_target_month,
    'confirmed_count', v_updated_count
  );
end;
$$;
