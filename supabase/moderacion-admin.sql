-- ============================================================
-- PicksFC · Moderación: los admins pueden borrar cualquier comentario (2026-11-07)
--
-- Cómo correrlo: Supabase → SQL Editor → New query → pegar todo → Run.
-- Es seguro correrlo varias veces. No borra ni modifica datos.
--
-- Por qué hace falta: las reglas RLS de la tabla comments solo dejan que cada
-- usuario borre SUS comentarios. Esta regla se SUMA a esa (en Postgres, si
-- cualquiera de las reglas permite la acción, se permite): el dueño sigue
-- pudiendo borrar lo suyo, y además un admin puede borrar cualquiera.
-- ============================================================

drop policy if exists "Admins pueden borrar cualquier comentario" on public.comments;

create policy "Admins pueden borrar cualquier comentario"
on public.comments
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.is_admin = true
  )
);
