import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LeaderboardEntry {
  id: string;
  player_id: string;
  season: string;
  rank: number;
  total_kills: number;
  total_deaths: number;
  kd_ratio: number;
  win_rate: number;
  total_score: number;
  updated_at: string;
  profile?: {
    username: string;
    avatar_url?: string;
  };
}

export const useLeaderboard = (season: string = 'current') => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeaderboard();
  }, [season]);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboards' as any)
        .select(`
          *,
          profile:profiles!leaderboards_player_id_fkey(username, avatar_url)
        `)
        .eq('season', season)
        .order('rank', { ascending: true })
        .limit(100);

      if (error) throw error;

      setLeaderboard((data as any) || []);

      // Fetch current user's rank
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userRankData, error: userRankError } = await supabase
          .from('leaderboards' as any)
          .select(`
            *,
            profile:profiles!leaderboards_player_id_fkey(username, avatar_url)
          `)
          .eq('season', season)
          .eq('player_id', user.id)
          .maybeSingle();

        if (userRankError) console.error('Error fetching user rank:', userRankError);
        setUserRank((userRankData as any) || null);
      }
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leaderboard',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    leaderboard,
    userRank,
    loading,
    refresh: fetchLeaderboard,
  };
};
