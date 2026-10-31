-- Local / empty DB only: skip entirely when public.users already exists (production).

do $migration$
begin
  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'users'
      and c.relkind = 'r'
  ) then
    return;
  end if;

  create table public.users (
    id uuid primary key references auth.users (id) on delete cascade,
    member_type text default 'personal',
    created_at timestamptz default now(),
    constraint users_member_type_check check (
      member_type = any (array['personal'::text, 'company'::text])
    )
  );

  alter table public.users enable row level security;

  create policy users_select_own
    on public.users for select to authenticated
    using (auth.uid() = id);

  create policy users_update_own
    on public.users for update to authenticated
    using (auth.uid() = id)
    with check (auth.uid() = id);

  grant select, insert, update, delete on public.users to service_role;
  grant select, update on public.users to authenticated;
end $migration$;
