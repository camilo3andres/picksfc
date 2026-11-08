-- ============================================================
-- PicksFC · Contador de comentarios siempre correcto (2026-11-07)
--
-- Cómo correrlo: Supabase → SQL Editor → New query → pegar todo → Run.
-- Es seguro correrlo varias veces. Solo recalcula el número de comentarios.
--
-- El problema: cuando alguien comentaba el pick de OTRA persona, el contador
-- picks.comments_count no subía. El proceso que lo actualizaba corría con los
-- permisos de quien comenta, y las reglas RLS solo dejan modificar un pick a su
-- dueño, así que la base bloqueaba la suma sin avisar.
--
-- La solución:
--   - "security definer": la función corre con permisos del sistema, no del usuario
--     (solo toca la columna comments_count, nada más)
--   - En vez de sumar +1 / restar -1, CUENTA los comentarios reales del pick.
--     Así nunca se desincroniza, aunque exista otro trigger viejo haciendo lo mismo.
-- ============================================================

create or replace function public.sync_pick_comments_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_pick uuid := coalesce(new.pick_id, old.pick_id);
begin
  update public.picks
  set comments_count = (select count(*) from public.comments where pick_id = target_pick)
  where id = target_pick;
  return null;
end;
$$;

drop trigger if exists trg_sync_pick_comments_count on public.comments;

create trigger trg_sync_pick_comments_count
after insert or delete on public.comments
for each row execute function public.sync_pick_comments_count();


-- Corregir los contadores que ya estaban mal
update public.picks p
set comments_count = (select count(*) from public.comments c where c.pick_id = p.id)
where p.comments_count is distinct from (select count(*) from public.comments c where c.pick_id = p.id);


-- Para revisar: triggers que tiene la tabla comments (el resultado sale abajo)
select tgname as trigger, pg_get_triggerdef(oid) as definicion
from pg_trigger
where tgrelid = 'public.comments'::regclass and not tgisinternal;
