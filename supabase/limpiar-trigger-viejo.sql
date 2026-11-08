-- ============================================================
-- PicksFC · Borrar el trigger viejo del contador de comentarios (2026-11-07)
--
-- Cómo correrlo: Supabase → SQL Editor → New query → pegar todo → Run.
-- No borra datos: solo quita el trigger viejo (on_comment_change o similar),
-- que hacía lo mismo que el nuevo pero fallaba cuando comentaba otro usuario.
-- Se queda únicamente trg_sync_pick_comments_count (contador-comentarios.sql).
-- ============================================================

do $$
declare
  t record;
begin
  for t in
    select tgname
    from pg_trigger
    where tgrelid = 'public.comments'::regclass
      and not tgisinternal
      and tgname <> 'trg_sync_pick_comments_count'
  loop
    execute format('drop trigger %I on public.comments', t.tgname);
    raise notice 'Trigger borrado: %', t.tgname;
  end loop;
end $$;

-- Verificación: debe quedar SOLO trg_sync_pick_comments_count
select tgname as triggers_que_quedan
from pg_trigger
where tgrelid = 'public.comments'::regclass and not tgisinternal;
