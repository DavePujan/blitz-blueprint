-- Fix 1: Restrict profiles to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Profiles viewable by authenticated users" 
  ON public.profiles FOR SELECT 
  TO authenticated
  USING (true);

-- Fix 2: Add authorization to set_room_password function
CREATE OR REPLACE FUNCTION public.set_room_password(room_id uuid, new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is the room creator
  IF NOT EXISTS (
    SELECT 1 FROM public.rooms 
    WHERE id = room_id AND created_by = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only room creator can set password';
  END IF;
  
  UPDATE public.rooms
  SET hashed_password = CASE 
    WHEN new_password IS NULL THEN NULL
    ELSE crypt(new_password, gen_salt('bf'))
  END
  WHERE id = room_id;
END;
$$;

-- Fix 3: Add validation to verify_room_password function
CREATE OR REPLACE FUNCTION public.verify_room_password(room_id uuid, password_attempt text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash text;
BEGIN
  -- Only allow verification if room exists and is joinable
  IF NOT EXISTS (
    SELECT 1 FROM public.rooms 
    WHERE id = room_id AND status = 'waiting'
  ) THEN
    RETURN false;
  END IF;
  
  SELECT hashed_password INTO stored_hash
  FROM public.rooms
  WHERE id = room_id;
  
  IF stored_hash IS NULL THEN
    RETURN true;
  END IF;
  
  RETURN stored_hash = crypt(password_attempt, stored_hash);
END;
$$;

-- Fix 4: Lock down match analytics tables
-- Drop permissive policies
DROP POLICY IF EXISTS "System can insert match analytics" ON public.match_analytics;
DROP POLICY IF EXISTS "System can update match analytics" ON public.match_analytics;
DROP POLICY IF EXISTS "System can insert player stats" ON public.player_match_stats;
DROP POLICY IF EXISTS "System can update player stats" ON public.player_match_stats;
DROP POLICY IF EXISTS "System can insert match events" ON public.match_events;

-- Create read-only policies for users
DROP POLICY IF EXISTS "Users can view match analytics" ON public.match_analytics;
CREATE POLICY "Users can view match analytics"
  ON public.match_analytics FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can view their own player stats" ON public.player_match_stats;
CREATE POLICY "Users can view their own player stats"
  ON public.player_match_stats FOR SELECT
  TO authenticated
  USING (player_id = auth.uid());

DROP POLICY IF EXISTS "Users can view match events" ON public.match_events;
CREATE POLICY "Users can view match events"
  ON public.match_events FOR SELECT
  TO authenticated
  USING (true);

-- Create function to record match events with validation
CREATE OR REPLACE FUNCTION public.record_match_event(
  p_match_id uuid,
  p_event_type text,
  p_player_id uuid,
  p_target_player_id uuid DEFAULT NULL,
  p_weapon_type text DEFAULT NULL,
  p_damage integer DEFAULT NULL,
  p_position jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate caller is participant in the match
  IF NOT EXISTS (
    SELECT 1 FROM public.player_match_stats 
    WHERE match_id = p_match_id AND player_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Not a participant in this match';
  END IF;

  -- Validate event type
  IF p_event_type NOT IN ('kill', 'death', 'hit', 'shot', 'damage_taken', 'weapon_switch') THEN
    RAISE EXCEPTION 'Invalid event type';
  END IF;
  
  -- Insert event
  INSERT INTO public.match_events (
    match_id, 
    event_type, 
    player_id, 
    target_player_id,
    weapon_type,
    damage,
    timestamp
  ) VALUES (
    p_match_id,
    p_event_type,
    p_player_id,
    p_target_player_id,
    p_weapon_type,
    p_damage,
    NOW()
  );
END;
$$;

-- Fix 5: Add input validation constraints
DO $$ 
BEGIN
  -- Add username length constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'username_length'
  ) THEN
    ALTER TABLE public.profiles 
      ADD CONSTRAINT username_length CHECK (char_length(username) <= 20 AND char_length(username) >= 3);
  END IF;

  -- Add room name length constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'name_length'
  ) THEN
    ALTER TABLE public.rooms 
      ADD CONSTRAINT name_length CHECK (char_length(name) <= 50 AND char_length(name) >= 1);
  END IF;
END $$;