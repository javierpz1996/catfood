-- Pegá esto en Supabase → SQL Editor → Run
-- No toca la tabla feedings.

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  message text not null
);

alter table public.messages enable row level security;

drop policy if exists "messages_select_anon" on public.messages;
create policy "messages_select_anon"
  on public.messages
  for select
  to anon, authenticated
  using (true);

drop policy if exists "messages_insert_anon" on public.messages;
create policy "messages_insert_anon"
  on public.messages
  for insert
  to anon, authenticated
  with check (true);

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then null;
end $$;

notify pgrst, 'reload schema';
