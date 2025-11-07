-- ============================================
-- SPRINT 7 & 8: ANALYTICS, SOCIAL, ACHIEVEMENTS, LEADERBOARD, NOTIFICATIONS, MODERATION
-- ============================================

-- Create enum types
CREATE TYPE public.notification_type AS ENUM (
  'friend_request',
  'friend_accepted',
  'clan_invite',
  'clan_joined',
  'achievement_unlocked',
  'level_up',
  'match_invite',
  'system'
);

CREATE TYPE public.report_reason AS ENUM (
  'cheating',
  'toxic_behavior',
  'inappropriate_name',
  'spam',
  'other'
);

CREATE TYPE public.report_status AS ENUM (
  'pending',
  'resolved',
  'dismissed'
);

CREATE TYPE public.ban_type AS ENUM (
  'temporary',
  'permanent'
);

CREATE TYPE public.app_role AS ENUM (
  'admin',
  'moderator',
  'user'
);

-- ============================================
-- USER ROLES TABLE (Security First)
-- ============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- FRIENDS TABLE
-- ============================================
CREATE TABLE public.friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their friendships"
  ON public.friends FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friend requests"
  ON public.friends FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their friendships"
  ON public.friends FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete their friendships"
  ON public.friends FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- ============================================
-- CLANS TABLE
-- ============================================
CREATE TABLE public.clans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  tag TEXT NOT NULL UNIQUE CHECK (LENGTH(tag) <= 5),
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_members INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.clans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view clans"
  ON public.clans FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create clans"
  ON public.clans FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Clan owners can update their clans"
  ON public.clans FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Clan owners can delete their clans"
  ON public.clans FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================
-- CLAN MEMBERS TABLE
-- ============================================
CREATE TABLE public.clan_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id UUID NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'officer', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(clan_id, user_id)
);

ALTER TABLE public.clan_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view clan members"
  ON public.clan_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join clans"
  ON public.clan_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Clan owners and officers can manage members"
  ON public.clan_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.clan_members cm
      WHERE cm.clan_id = clan_members.clan_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'officer')
    )
  );

CREATE POLICY "Users can leave clans"
  ON public.clan_members FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  clan_id UUID REFERENCES public.clans(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (LENGTH(content) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (room_id IS NOT NULL AND clan_id IS NULL) OR
    (room_id IS NULL AND clan_id IS NOT NULL)
  )
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their rooms"
  ON public.chat_messages FOR SELECT
  USING (
    room_id IN (
      SELECT room_id FROM public.room_players WHERE player_id = auth.uid()
    )
  );

CREATE POLICY "Users can view messages in their clans"
  ON public.chat_messages FOR SELECT
  USING (
    clan_id IN (
      SELECT clan_id FROM public.clan_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Moderators can view all messages
CREATE POLICY "Moderators can view all chat messages"
  ON public.chat_messages FOR SELECT
  USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- System can create notifications (service role)
CREATE POLICY "Service role can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- ============================================
-- ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  is_secret BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements"
  ON public.achievements FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage achievements"
  ON public.achievements FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- PLAYER ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE public.player_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(player_id, achievement_id)
);

ALTER TABLE public.player_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their achievements"
  ON public.player_achievements FOR SELECT
  USING (auth.uid() = player_id);

CREATE POLICY "System can update player achievements"
  ON public.player_achievements FOR ALL
  WITH CHECK (auth.uid() = player_id);

CREATE INDEX idx_player_achievements_player_id ON public.player_achievements(player_id);

-- ============================================
-- LEADERBOARD TABLE
-- ============================================
CREATE TABLE public.leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season TEXT NOT NULL DEFAULT 'current',
  total_kills INTEGER NOT NULL DEFAULT 0,
  total_deaths INTEGER NOT NULL DEFAULT 0,
  total_wins INTEGER NOT NULL DEFAULT 0,
  total_matches INTEGER NOT NULL DEFAULT 0,
  total_score INTEGER NOT NULL DEFAULT 0,
  kd_ratio NUMERIC NOT NULL DEFAULT 0,
  win_rate NUMERIC NOT NULL DEFAULT 0,
  rank INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(player_id, season)
);

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard"
  ON public.leaderboard FOR SELECT
  USING (true);

CREATE POLICY "System can update leaderboard"
  ON public.leaderboard FOR ALL
  WITH CHECK (auth.uid() = player_id);

CREATE INDEX idx_leaderboard_season_rank ON public.leaderboard(season, rank);
CREATE INDEX idx_leaderboard_player_id ON public.leaderboard(player_id);

-- ============================================
-- PLAYER REPORTS TABLE
-- ============================================
CREATE TABLE public.player_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason report_reason NOT NULL,
  description TEXT,
  status report_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

ALTER TABLE public.player_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON public.player_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their reports"
  ON public.player_reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Moderators can view all reports"
  ON public.player_reports FOR SELECT
  USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Moderators can update reports"
  ON public.player_reports FOR UPDATE
  USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_player_reports_status ON public.player_reports(status);
CREATE INDEX idx_player_reports_reported_user ON public.player_reports(reported_user_id);

-- ============================================
-- PLAYER BANS TABLE
-- ============================================
CREATE TABLE public.player_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  banned_by UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  ban_type ban_type NOT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (ban_type = 'permanent' AND expires_at IS NULL) OR
    (ban_type = 'temporary' AND expires_at IS NOT NULL)
  )
);

ALTER TABLE public.player_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moderators can manage bans"
  ON public.player_bans FOR ALL
  USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active bans"
  ON public.player_bans FOR SELECT
  USING (true);

CREATE INDEX idx_player_bans_user_id ON public.player_bans(user_id);
CREATE INDEX idx_player_bans_is_active ON public.player_bans(is_active);

-- ============================================
-- USER ONLINE STATUS TABLE
-- ============================================
CREATE TABLE public.user_online_status (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_online BOOLEAN NOT NULL DEFAULT false,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_activity TEXT
);

ALTER TABLE public.user_online_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view online status"
  ON public.user_online_status FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own status"
  ON public.user_online_status FOR ALL
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- CLAN STATISTICS TABLE
-- ============================================
CREATE TABLE public.clan_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id UUID NOT NULL UNIQUE REFERENCES public.clans(id) ON DELETE CASCADE,
  total_wins INTEGER NOT NULL DEFAULT 0,
  total_matches INTEGER NOT NULL DEFAULT 0,
  total_kills INTEGER NOT NULL DEFAULT 0,
  average_kd NUMERIC NOT NULL DEFAULT 0,
  rank INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.clan_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view clan statistics"
  ON public.clan_statistics FOR SELECT
  USING (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create user role when user signs up
CREATE OR REPLACE FUNCTION public.create_default_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_user_role();

-- Update clan updated_at timestamp
CREATE TRIGGER update_clans_updated_at
  BEFORE UPDATE ON public.clans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for chat and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_online_status;