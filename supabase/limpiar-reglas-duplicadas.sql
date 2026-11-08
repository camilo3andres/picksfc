-- Limpieza de reglas RLS duplicadas (2026-11-08)
--
-- En picks y likes había reglas repetidas: la misma condición escrita dos veces,
-- una con nombre en inglés (creada desde el panel) y otra en español (schema.sql).
-- Las reglas "permissive" se combinan con OR, así que borrar una copia idéntica
-- NO cambia quién puede hacer qué. Se conservan las de español.
--
-- Todo va en una transacción: si algo falla, no se aplica nada.

begin;

-- likes · SELECT · true  (queda: "Likes son visibles para todos")
drop policy if exists "Anyone can view likes" on public.likes;

-- picks · SELECT · true  (queda: "Picks son visibles para todos")
drop policy if exists "Anyone can view picks" on public.picks;

-- picks · DELETE · auth.uid() = user_id  (queda: "Solo el dueño puede eliminar sus picks")
drop policy if exists "Users can delete own picks" on public.picks;

commit;

-- Verificación: deben quedar 8 reglas, sin pares repetidos.
select tablename as tabla, policyname as regla, cmd as accion
from pg_policies
where schemaname = 'public'
  and tablename in ('picks', 'likes')
order by tablename, cmd, policyname;
