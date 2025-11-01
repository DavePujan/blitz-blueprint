import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PlayerProgression {
  id: string;
  player_id: string;
  level: number;
  xp: number;
  total_kills: number;
  total_deaths: number;
  total_matches: number;
  wins: number;
  currency: number;
  premium_currency: number;
}

export const useProgression = () => {
  const [progression, setProgression] = useState<PlayerProgression | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProgression();
  }, []);

  const fetchProgression = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('player_progression')
        .select('*')
        .eq('player_id', user.id)
        .single();

      if (error) throw error;
      setProgression(data);
    } catch (error) {
      console.error('Error fetching progression:', error);
      toast({
        title: 'Error',
        description: 'Failed to load progression data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addXP = async (amount: number) => {
    if (!progression) return;

    const newXP = progression.xp + amount;
    const xpPerLevel = 1000;
    const newLevel = Math.floor(newXP / xpPerLevel) + 1;
    const leveledUp = newLevel > progression.level;

    try {
      const { data, error } = await supabase
        .from('player_progression')
        .update({ 
          xp: newXP,
          level: newLevel 
        })
        .eq('player_id', progression.player_id)
        .select()
        .single();

      if (error) throw error;
      setProgression(data);

      if (leveledUp) {
        toast({
          title: '🎉 Level Up!',
          description: `You reached level ${newLevel}!`,
        });
      }
    } catch (error) {
      console.error('Error adding XP:', error);
    }
  };

  const addCurrency = async (amount: number, isPremium = false) => {
    if (!progression) return;

    const field = isPremium ? 'premium_currency' : 'currency';
    const newAmount = progression[field] + amount;

    try {
      const { data, error } = await supabase
        .from('player_progression')
        .update({ [field]: newAmount })
        .eq('player_id', progression.player_id)
        .select()
        .single();

      if (error) throw error;
      setProgression(data);
    } catch (error) {
      console.error('Error adding currency:', error);
    }
  };

  const updateStats = async (stats: {
    kills?: number;
    deaths?: number;
    matches?: number;
    wins?: number;
  }) => {
    if (!progression) return;

    try {
      const updates: any = {};
      if (stats.kills) updates.total_kills = progression.total_kills + stats.kills;
      if (stats.deaths) updates.total_deaths = progression.total_deaths + stats.deaths;
      if (stats.matches) updates.total_matches = progression.total_matches + stats.matches;
      if (stats.wins) updates.wins = progression.wins + stats.wins;

      const { data, error } = await supabase
        .from('player_progression')
        .update(updates)
        .eq('player_id', progression.player_id)
        .select()
        .single();

      if (error) throw error;
      setProgression(data);
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  return {
    progression,
    loading,
    addXP,
    addCurrency,
    updateStats,
    refetch: fetchProgression,
  };
};
