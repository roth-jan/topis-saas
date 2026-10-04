-- Nutzungsprotokoll TOPIS (Jans Ja 04.10.2026).
-- Was angemeldete Tester tun — Ereignisname + kleine Enum-Details, KEINE Hallen-/Kundendaten.
-- Nur angemeldete Nutzer schreiben (anonyme Besucher werden nicht protokolliert).
-- Lesen nur per Management-API (service role) — es gibt bewusst KEINE Select-Policy.

create table if not exists public.nutzungsereignisse (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  sitzung uuid not null,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  ereignis text not null check (ereignis ~ '^[a-z_]{3,40}$'),
  detail jsonb check (detail is null or (jsonb_typeof(detail) = 'object' and pg_column_size(detail) < 400)),
  pfad text check (pfad is null or pfad ~ '^/[a-z/_-]{0,39}$'),
  umgebung text not null check (umgebung in ('prod', 'test')),
  version text check (version is null or length(version) <= 40)
);

create index if not exists nutzungsereignisse_user_zeit on public.nutzungsereignisse (user_id, created_at);
create index if not exists nutzungsereignisse_zeit on public.nutzungsereignisse (created_at);

alter table public.nutzungsereignisse enable row level security;

drop policy if exists nutzung_insert_eigene on public.nutzungsereignisse;
create policy nutzung_insert_eigene on public.nutzungsereignisse
  for insert to authenticated
  with check (user_id = auth.uid());

-- Deckel gegen Fluten (Anon-Key steht im Bundle; die DB ist mit Prod geteilt):
-- höchstens 2.000 Ereignisse je Nutzer und Tag. Darüber wird still verworfen
-- (kein Fehler an den Client — das Protokoll darf die App nie stören).
create or replace function public.nutzung_deckel() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.nutzungsereignisse
        where user_id = new.user_id and created_at > now() - interval '1 day') >= 2000 then
    return null;
  end if;
  return new;
end $$;

drop trigger if exists nutzung_deckel on public.nutzungsereignisse;
create trigger nutzung_deckel before insert on public.nutzungsereignisse
  for each row execute function public.nutzung_deckel();

-- Speicherdauer 12 Monate (Datenschutzerklärung): täglich 03:30 UTC löschen.
create extension if not exists pg_cron;
select cron.unschedule('nutzung_aufraeumen') where exists (select 1 from cron.job where jobname = 'nutzung_aufraeumen');
select cron.schedule('nutzung_aufraeumen', '30 3 * * *',
  $$delete from public.nutzungsereignisse where created_at < now() - interval '12 months'$$);
