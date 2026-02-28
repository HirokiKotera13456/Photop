-- ============================================================
-- 00004_create_storage.sql
-- Photop: Storage バケット & ポリシー
-- ============================================================

-- photos バケット作成（非公開）
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'photos',
  'photos',
  false,
  10485760, -- 10MB
  array['image/jpeg', 'image/png', 'image/webp']
);

-- ============================================================
-- Storage ポリシー
-- パス規則: photos/{user_id}/{filename}
-- ============================================================

-- アップロード: 認証済みユーザーが自分のパスにのみ書き込み可
create policy "storage: 自分のパスにアップロード"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 閲覧: ペアの2人のみ読み取り可
create policy "storage: ペア内の写真を閲覧"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'photos'
    and (
      -- 自分のファイル
      (storage.foldername(name))[1] = auth.uid()::text
      -- またはペア相手のファイル
      or public.is_pair_partner(((storage.foldername(name))[1])::uuid)
    )
  );

-- 更新: 自分のファイルのみ
create policy "storage: 自分のファイルを更新"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 削除: アップロードした本人のみ
create policy "storage: 自分のファイルを削除"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
