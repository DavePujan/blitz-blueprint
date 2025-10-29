-- Sprint 4: Match Analytics and Combat System

-- Match analytics table
CREATE TABLE IF NOT EXISTS public.match_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  match_started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  match_ended_at TIMESTAMP WITH TIME ZONE,
  match_duration_seconds INTEGER,
  winning_team TEXT,
  total_kills INTEGER DEFAULT 0,
  total_deaths INTEGER DEFAULT 0,
  total_shots_fired INTEGER DEFAULT 0,
  total_hits INTEGER DEFAULT 0,
  accuracy_percentage DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Player match stats table
CREATE TABLE IF NOT EXISTS public.player_match_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.match_analytics(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team TEXT,
  kills INTEGER DEFAULT 0,
  deaths INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  damage_dealt INTEGER DEFAULT 0,
  shots_fired INTEGER DEFAULT 0,
  shots_hit INTEGER DEFAULT 0,
  accuracy_percentage DECIMAL(5,2),
  time_alive_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Match events log (for detailed analytics)
CREATE TABLE IF NOT EXISTS public.match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.match_analytics(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'kill', 'death', 'hit', 'shot', 'reload', 'respawn'
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_player_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  weapon_type TEXT,
  damage INTEGER,
  position_x DECIMAL,
  position_y DECIMAL,
  position_z DECIMAL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.match_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_match_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for match_analytics (readable by all authenticated users)
CREATE POLICY "Users can view all match analytics"
  ON public.match_analytics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert match analytics"
  ON public.match_analytics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update match analytics"
  ON public.match_analytics FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for player_match_stats
CREATE POLICY "Users can view all player match stats"
  ON public.player_match_stats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert player stats"
  ON public.player_match_stats FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update player stats"
  ON public.player_match_stats FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for match_events
CREATE POLICY "Users can view match events"
  ON public.match_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert match events"
  ON public.match_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to create match analytics when room starts
CREATE OR REPLACE FUNCTION public.create_match_analytics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'in_progress' AND OLD.status = 'waiting' THEN
    INSERT INTO public.match_analytics (room_id, match_started_at)
    VALUES (NEW.id, NEW.started_at);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-create match analytics
CREATE TRIGGER on_match_start
  AFTER UPDATE ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.create_match_analytics();

-- Indexes for performance
CREATE INDEX idx_match_analytics_room_id ON public.match_analytics(room_id);
CREATE INDEX idx_player_match_stats_match_id ON public.player_match_stats(match_id);
CREATE INDEX idx_player_match_stats_player_id ON public.player_match_stats(player_id);
CREATE INDEX idx_match_events_match_id ON public.match_events(match_id);
CREATE INDEX idx_match_events_player_id ON public.match_events(player_id);
CREATE INDEX idx_match_events_event_type ON public.match_events(event_type);