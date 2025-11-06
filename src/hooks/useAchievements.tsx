import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  icon_url?: string;
  points: number;
  requirement_type: string;
  requirement_value: number;
  is_secret: boolean;
  created_at: string;
}

export interface PlayerAchievement {
  id: string;
  player_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress: number;
  is_completed: boolean;
  achievement?: Achievement;
}

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [playerAchievements, setPlayerAchievements] = useState<PlayerAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAchievements();
    fetchPlayerAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements' as any)
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setAchievements((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchPlayerAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('player_achievements' as any)
        .select(`
          *,
          achievement:achievements!player_achievements_achievement_id_fkey(*)
        `)
        .eq('player_id', user.id);

      if (error) throw error;
      setPlayerAchievements((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching player achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (achievementId: string, progress: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const achievement = achievements.find((a) => a.id === achievementId);
      if (!achievement) return;

      const isCompleted = progress >= achievement.requirement_value;

      const { error } = await supabase
        .from('player_achievements' as any)
        .upsert({
          player_id: user.id,
          achievement_id: achievementId,
          progress,
          is_completed: isCompleted,
          unlocked_at: isCompleted ? new Date().toISOString() : null,
        });

      if (error) throw error;

      if (isCompleted) {
        toast({
          title: 'Achievement Unlocked!',
          description: `${achievement.name} - ${achievement.points} points`,
        });
      }

      fetchPlayerAchievements();
    } catch (error: any) {
      console.error('Error updating achievement progress:', error);
    }
  };

  return {
    achievements,
    playerAchievements,
    loading,
    updateProgress,
    refresh: fetchPlayerAchievements,
  };
};
