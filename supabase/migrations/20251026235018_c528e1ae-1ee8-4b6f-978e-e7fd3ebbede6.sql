-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create rooms table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT,
  max_players INTEGER NOT NULL DEFAULT 10,
  current_players INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'finished')),
  game_mode TEXT NOT NULL DEFAULT 'deathmatch' CHECK (game_mode IN ('deathmatch', 'objective')),
  map_name TEXT NOT NULL DEFAULT 'factory',
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on rooms
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Rooms policies
CREATE POLICY "Rooms are viewable by authenticated users" 
  ON public.rooms FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create rooms" 
  ON public.rooms FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creators can update their rooms" 
  ON public.rooms FOR UPDATE 
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Room creators can delete their rooms" 
  ON public.rooms FOR DELETE 
  TO authenticated
  USING (auth.uid() = created_by);

-- Create room_players table for tracking players in rooms
CREATE TABLE public.room_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_ready BOOLEAN NOT NULL DEFAULT false,
  team TEXT CHECK (team IN ('red', 'blue')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, player_id)
);

-- Enable RLS on room_players
ALTER TABLE public.room_players ENABLE ROW LEVEL SECURITY;

-- Room players policies
CREATE POLICY "Room players are viewable by authenticated users" 
  ON public.room_players FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can join rooms" 
  ON public.room_players FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Players can update their own status" 
  ON public.room_players FOR UPDATE 
  TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Players can leave rooms" 
  ON public.room_players FOR DELETE 
  TO authenticated
  USING (auth.uid() = player_id);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', 'Player_' || substr(new.id::text, 1, 8))
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_players;