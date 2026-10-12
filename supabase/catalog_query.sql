-- 읽기 전용 카탈로그 조회 (실행 시 READ ONLY 세션 권장). 고객 데이터 행 조회 없음.
select json_build_object(
  'rls', (select json_agg(json_build_object('table', c.relname, 'rls', c.relrowsecurity, 'force', c.relforcerowsecurity))
          from pg_class c join pg_namespace n on n.oid = c.relnamespace
          where n.nspname = 'public' and c.relkind = 'r'),
  'policies', (select json_agg(p) from pg_policies p where schemaname in ('public','storage')),
  'indexes', (select json_agg(i) from pg_indexes i where schemaname = 'public'),
  'constraints', (select json_agg(json_build_object('table', conrelid::regclass::text, 'name', conname, 'type', contype, 'def', pg_get_constraintdef(oid)))
                  from pg_constraint where connamespace = 'public'::regnamespace),
  'triggers', (select json_agg(json_build_object('table', tgrelid::regclass::text, 'name', tgname, 'def', pg_get_triggerdef(oid)))
               from pg_trigger
               where not tgisinternal and tgrelid in (select oid from pg_class where relnamespace = 'public'::regnamespace)),
  'functions', (select json_agg(json_build_object('name', proname, 'security_definer', prosecdef))
                from pg_proc where pronamespace = 'public'::regnamespace)
) as schema_info;
