-- Rode no SQL Editor do Supabase.
create table if not exists public.strats (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  map_id text not null,
  scene jsonb not null default '{}'::jsonb,
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  share_slug text not null unique,
  created_at timestamptz not null default now()
);

alter table public.strats enable row level security;

create policy "ler publicas ou proprias" on public.strats
  for select using (visibility = 'public' or auth.uid() = owner_id);
create policy "criar proprias" on public.strats
  for insert with check (auth.uid() = owner_id);
create policy "editar proprias" on public.strats
  for update using (auth.uid() = owner_id);
create policy "apagar proprias" on public.strats
  for delete using (auth.uid() = owner_id);
