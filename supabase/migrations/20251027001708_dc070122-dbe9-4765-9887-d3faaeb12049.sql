-- Fix 1: Create a database view that excludes password hashes
-- This prevents password hashes from being exposed in client queries
CREATE VIEW public.rooms_public AS
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

-- Fix 2: Update room deletion policy to prevent deletion of active rooms
-- Only allow deletion of empty waiting rooms
DROP POLICY IF EXISTS "Room creators can delete their rooms" ON public.rooms;

CREATE POLICY "Room creators can delete only empty waiting rooms" 
  ON public.rooms FOR DELETE 
  TO authenticated
  USING (
    auth.uid() = created_by 
    AND status = 'waiting'
    AND current_players = 0
  );