-- Fix the security definer view issue by explicitly setting SECURITY INVOKER
DROP VIEW IF EXISTS public.rooms_public;

CREATE VIEW public.rooms_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  room_code,
  name,
  max_players,
  current_players,
  status,
  game_mode,
  map_name,
  created_by,
  created_at,
  started_at,
  ended_at,
  (hashed_password IS NOT NULL) as has_password
FROM public.rooms;

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.rooms_public TO authenticated;