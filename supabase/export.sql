-- Exporteert alle databaselogica van Athlevon als één stuk tekst.
-- Dit leest alleen; het verandert niets en laat geen gegevens van gebruikers zien.
--
-- Gebruik: Supabase → SQL Editor → plak dit → Run.
-- Kopieer de ene cel met het resultaat naar supabase/schema.sql en commit die.
-- Zie DATABASE.md.

select string_agg(part, E'\n\n' order by sort) as schema
from (
  -- 1. Welke tabellen RLS aan hebben
  select 1 as sort, '-- RLS per tabel' || E'\n' || string_agg(
           format('-- %s: rls=%s, force=%s', c.relname, c.relrowsecurity, c.relforcerowsecurity),
           E'\n' order by c.relname) as part
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r'

  union all
  -- 2. Policies
  select 2, '-- Policies' || E'\n' || coalesce(string_agg(
           format('-- %s.%s: %s voor %s, using (%s), check (%s)',
                  tablename, policyname, cmd, array_to_string(roles, ','), qual, with_check),
           E'\n' order by tablename, policyname), '-- (geen)')
  from pg_policies where schemaname = 'public'

  union all
  -- 3. Rechten van de openbare rollen op tabellen
  select 3, '-- Tabelrechten voor anon/authenticated' || E'\n' || coalesce(string_agg(
           format('-- %s: %s heeft %s', table_name, grantee, privileges),
           E'\n' order by table_name, grantee), '-- (geen)')
  from (
    select table_name, grantee, string_agg(privilege_type, ',' order by privilege_type) as privileges
    from information_schema.role_table_grants
    where table_schema = 'public' and grantee in ('anon', 'authenticated')
    group by table_name, grantee
  ) g

  union all
  -- 4. Wie welke functie mag aanroepen
  select 4, '-- Functierechten' || E'\n' || string_agg(
           format('-- %s(%s): security_definer=%s, anon_mag=%s, config=%s',
                  p.proname, pg_get_function_identity_arguments(p.oid), p.prosecdef,
                  has_function_privilege('anon', p.oid, 'execute'), p.proconfig),
           E'\n' order by p.proname)
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.prokind = 'f'

  union all
  -- 5. Geïnstalleerde extensies
  select 5, '-- Extensies' || E'\n' || string_agg(format('-- %s %s', extname, extversion), E'\n' order by extname)
  from pg_extension

  union all
  -- 6. De volledige code van alle functies
  select 6, string_agg(pg_get_functiondef(p.oid) || ';', E'\n\n' order by p.proname)
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.prokind = 'f'

  union all
  -- 7. Triggers en geplande taken (pg_cron), als die er zijn
  select 7, '-- Triggers' || E'\n' || coalesce(string_agg(pg_get_triggerdef(t.oid) || ';', E'\n' order by t.tgname), '-- (geen)')
  from pg_trigger t join pg_class c on c.oid = t.tgrelid join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and not t.tgisinternal
) parts;
