-- Sprint 6: Progression & Store System

-- Weapons catalog with stats and unlock requirements
CREATE TABLE public.weapons_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weapon_type TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  damage INTEGER NOT NULL,
  fire_rate INTEGER NOT NULL,
  mag_size INTEGER NOT NULL,
  reload_time INTEGER NOT NULL,
  unlock_level INTEGER DEFAULT 1,
  unlock_cost INTEGER DEFAULT 0,
  price INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Skins catalog for weapons and characters
CREATE TABLE public.skins_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  skin_type TEXT NOT NULL CHECK (skin_type IN ('weapon', 'character')),
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  price INTEGER NOT NULL,
  is_premium BOOLEAN DEFAULT false,
  unlock_level INTEGER DEFAULT 1,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Player progression tracking
CREATE TABLE public.player_progression (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  total_kills INTEGER DEFAULT 0,
  total_deaths INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  currency INTEGER DEFAULT 1000,
  premium_currency INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id)
);

-- Player inventory for owned items
CREATE TABLE public.player_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('weapon', 'skin')),
  item_id UUID NOT NULL,
  equipped BOOLEAN DEFAULT false,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, item_type, item_id)
);

-- Battle pass system
CREATE TABLE public.battle_pass (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_number INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  max_tier INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Battle pass rewards per tier
CREATE TABLE public.battle_pass_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_pass_id UUID NOT NULL REFERENCES public.battle_pass(id) ON DELETE CASCADE,
  tier INTEGER NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('currency', 'premium_currency', 'weapon', 'skin', 'xp_boost')),
  reward_id UUID,
  reward_amount INTEGER,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(battle_pass_id, tier, is_premium)
);

-- Player battle pass progress
CREATE TABLE public.battle_pass_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  battle_pass_id UUID NOT NULL REFERENCES public.battle_pass(id) ON DELETE CASCADE,
  current_tier INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, battle_pass_id)
);

-- Store purchase history
CREATE TABLE public.store_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  price INTEGER NOT NULL,
  currency_type TEXT NOT NULL CHECK (currency_type IN ('currency', 'premium_currency')),
  purchased_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.weapons_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skins_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_pass ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_pass_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_pass_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for weapons_catalog (public read)
CREATE POLICY "Anyone can view weapons catalog"
  ON public.weapons_catalog FOR SELECT
  USING (true);

-- RLS Policies for skins_catalog (public read)
CREATE POLICY "Anyone can view skins catalog"
  ON public.skins_catalog FOR SELECT
  USING (true);

-- RLS Policies for player_progression
CREATE POLICY "Users can view their own progression"
  ON public.player_progression FOR SELECT
  USING (auth.uid() = player_id);

CREATE POLICY "Users can update their own progression"
  ON public.player_progression FOR UPDATE
  USING (auth.uid() = player_id);

CREATE POLICY "Users can insert their own progression"
  ON public.player_progression FOR INSERT
  WITH CHECK (auth.uid() = player_id);

-- RLS Policies for player_inventory
CREATE POLICY "Users can view their own inventory"
  ON public.player_inventory FOR SELECT
  USING (auth.uid() = player_id);

CREATE POLICY "Users can insert into their own inventory"
  ON public.player_inventory FOR INSERT
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can update their own inventory"
  ON public.player_inventory FOR UPDATE
  USING (auth.uid() = player_id);

-- RLS Policies for battle_pass (public read)
CREATE POLICY "Anyone can view battle passes"
  ON public.battle_pass FOR SELECT
  USING (true);

-- RLS Policies for battle_pass_rewards (public read)
CREATE POLICY "Anyone can view battle pass rewards"
  ON public.battle_pass_rewards FOR SELECT
  USING (true);

-- RLS Policies for battle_pass_progress
CREATE POLICY "Users can view their own battle pass progress"
  ON public.battle_pass_progress FOR SELECT
  USING (auth.uid() = player_id);

CREATE POLICY "Users can insert their own battle pass progress"
  ON public.battle_pass_progress FOR INSERT
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can update their own battle pass progress"
  ON public.battle_pass_progress FOR UPDATE
  USING (auth.uid() = player_id);

-- RLS Policies for store_purchases
CREATE POLICY "Users can view their own purchase history"
  ON public.store_purchases FOR SELECT
  USING (auth.uid() = player_id);

CREATE POLICY "Users can insert their own purchases"
  ON public.store_purchases FOR INSERT
  WITH CHECK (auth.uid() = player_id);

-- Triggers for updated_at
CREATE TRIGGER update_player_progression_updated_at
  BEFORE UPDATE ON public.player_progression
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_battle_pass_progress_updated_at
  BEFORE UPDATE ON public.battle_pass_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to initialize player progression
CREATE OR REPLACE FUNCTION public.initialize_player_progression()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.player_progression (player_id)
  VALUES (NEW.id)
  ON CONFLICT (player_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-create progression on profile creation
CREATE TRIGGER on_profile_created_init_progression
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_player_progression();

-- Seed initial weapons data
INSERT INTO public.weapons_catalog (weapon_type, name, description, damage, fire_rate, mag_size, reload_time, unlock_level, price, is_premium) VALUES
  ('pistol', 'M9 Pistol', 'Standard issue sidearm with reliable accuracy', 25, 400, 15, 1500, 1, 0, false),
  ('assault_rifle', 'M4A1', 'Versatile assault rifle with balanced stats', 30, 700, 30, 2000, 1, 0, false),
  ('smg', 'MP5', 'High fire rate submachine gun for close combat', 22, 900, 30, 1800, 3, 2500, false),
  ('sniper', 'AWP', 'High-powered sniper rifle with devastating damage', 90, 50, 10, 3000, 5, 5000, false),
  ('shotgun', 'SPAS-12', 'Pump-action shotgun deadly at close range', 80, 120, 8, 2500, 4, 3500, false),
  ('lmg', 'M249', 'Light machine gun with large magazine capacity', 35, 650, 100, 4000, 7, 7500, false);

-- Seed initial skins data
INSERT INTO public.skins_catalog (name, description, skin_type, rarity, price, is_premium, image_url) VALUES
  ('Desert Camo', 'Classic desert camouflage pattern', 'weapon', 'common', 500, false, null),
  ('Arctic Digital', 'Digital arctic camouflage', 'weapon', 'rare', 1500, false, null),
  ('Dragon Fire', 'Fierce dragon-themed weapon skin', 'weapon', 'epic', 3000, true, null),
  ('Neon Pulse', 'Glowing neon animated skin', 'weapon', 'legendary', 5000, true, null),
  ('Tactical Ops', 'Professional operator uniform', 'character', 'rare', 2000, false, null),
  ('Elite Force', 'Elite special forces uniform', 'character', 'epic', 4000, true, null);