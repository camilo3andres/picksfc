-- ============================================================
-- PicksFC · Rendimiento y tiempo real (2026-11-07)
--
-- Cómo correrlo: Supabase → SQL Editor → New query → pegar todo → Run.
-- Es seguro correrlo varias veces (todo usa "if not exists").
-- No borra ni modifica datos.
-- ============================================================

-- 1) ÍNDICES
-- Un índice es como el índice de un libro: sin él, la base revisa TODA la tabla
-- para encontrar algo; con él, salta directo. Con pocos picks no se nota, pero
-- con miles es la diferencia entre milisegundos y segundos.

-- Feed: picks ordenados del más nuevo al más viejo
create index if not exists picks_created_at_idx on public.picks (created_at desc);

-- Perfil: picks de un usuario
create index if not exists picks_user_id_created_at_idx on public.picks (user_id, created_at desc);

-- Ranking y auto-resolver: picks por estado y fecha del partido
create index if not exists picks_status_match_date_idx on public.picks (status, match_date);

-- Comentarios de un pick, en orden
create index if not exists comments_pick_id_created_at_idx on public.comments (pick_id, created_at);

-- "¿Le di like a estos picks?"
create index if not exists likes_user_id_pick_id_idx on public.likes (user_id, pick_id);

-- "¿A quién sigo?" y "¿quién me sigue?"
create index if not exists follows_follower_id_idx on public.follows (follower_id);
create index if not exists follows_following_id_idx on public.follows (following_id);


-- 2) TIEMPO REAL PARA COMENTARIOS
-- La tabla picks ya estaba en Realtime. Esto agrega comments, para que los
-- comentarios nuevos aparezcan sin recargar la página.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'comments'
  ) then
    alter publication supabase_realtime add table public.comments;
  end if;
end $$;
