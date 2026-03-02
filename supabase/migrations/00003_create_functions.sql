-- ============================================================
-- 00003_create_functions.sql
-- Photop: RPC関数 & トリガー（個人ポートフォリオ版）
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
-- RPC: select_monthly_best(p_photo_id uuid) — 月間ベスト選出/変更
-- 自分の写真の中から今月のベストを選ぶ
-- ============================================================
create or replace function public.select_monthly_best(p_photo_id uuid)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_photo record;
  v_current_month text;
  v_best_id uuid;
begin
  v_current_month := to_char(now() at time zone 'Asia/Tokyo', 'YYYY-MM');

  -- 写真を検証（自分の写真で今月のもの）
  select * into v_photo
  from public.photos
  where id = p_photo_id
    and user_id = auth.uid()
    and month = v_current_month;

  if v_photo is null then
    raise exception '対象の写真が見つかりません（自分の今月の写真のみ選出可能）';
  end if;

  -- UPSERT: 既存の選出を更新、なければ新規作成
  insert into public.monthly_bests (user_id, photo_id, month)
  values (auth.uid(), p_photo_id, v_current_month)
  on conflict (user_id, month)
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
