-- Supabase セットアップ用 SQL
-- Supabase ダッシュボード → SQL Editor に貼り付けて Run してください。
-- このファイル全体をそのまま選択して実行してOKです。

-- 写真メタデータ用テーブル
create table public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  caption text default '',
  sort_order int not null default 0,
  created_at timestamptz default now()
);

create index gallery_photos_sort_idx on public.gallery_photos (sort_order);

-- RLS（だれでも読み書き可。シークレットURLでアクセス制御する想定）
alter table public.gallery_photos enable row level security;

create policy "Public read"   on public.gallery_photos for select using (true);
create policy "Public insert" on public.gallery_photos for insert with check (true);
create policy "Public update" on public.gallery_photos for update using (true);
create policy "Public delete" on public.gallery_photos for delete using (true);

-- ストレージ用バケット
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

create policy "Public read gallery storage"
  on storage.objects for select using (bucket_id = 'gallery');
create policy "Public write gallery storage"
  on storage.objects for insert with check (bucket_id = 'gallery');
create policy "Public delete gallery storage"
  on storage.objects for delete using (bucket_id = 'gallery');
create policy "Public update gallery storage"
  on storage.objects for update using (bucket_id = 'gallery');
