import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PlayerMatchStats {
  id: string;
  match_id: string;
  player_id: string;
  team?: string;
  kills: number;
  deaths: number;
  assists: number;
  damage_dealt: number;
  shots_fired: number;
  shots_hit: number;
  accuracy_percentage?: number;
  time_alive_seconds: number;
  created_at: string;
}

export interface MatchAnalytics {
  id: string;
  room_id: string;
  match_started_at: string;
  match_ended_at?: string;
  match_duration_seconds?: number;
  total_kills: number;
  total_deaths: number;
  total_shots_fired: number;
  total_hits: number;
  accuracy_percentage?: number;
  winning_team?: string;
}

export const useAnalytics = () => {
  const [playerStats, setPlayerStats] = useState<PlayerMatchStats[]>([]);
  const [matchHistory, setMatchHistory] = useState<MatchAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlayerStats();
    fetchMatchHistory();
  }, []);

  const fetchPlayerStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('player_match_stats')
        .select('*')
        .eq('player_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPlayerStats(data || []);
    } catch (error: any) {
      console.error('Error fetching player stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load player statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('match_analytics')
        .select('*')
        .order('match_started_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setMatchHistory(data || []);
    } catch (error: any) {
      console.error('Error fetching match history:', error);
    }
  };

  const getPlayerAverage = (stat: keyof PlayerMatchStats) => {
    if (playerStats.length === 0) return 0;
    const sum = playerStats.reduce((acc, match) => {
      const value = match[stat];
      return acc + (typeof value === 'number' ? value : 0);
    }, 0);
    return (sum / playerStats.length).toFixed(2);
  };

  const getTotalStat = (stat: keyof PlayerMatchStats) => {
    return playerStats.reduce((acc, match) => {
      const value = match[stat];
      return acc + (typeof value === 'number' ? value : 0);
    }, 0);
  };

  const getKDRatio = () => {
    const totalKills = getTotalStat('kills');
    const totalDeaths = getTotalStat('deaths');
    if (totalDeaths === 0) return totalKills.toFixed(2);
    return (totalKills / totalDeaths).toFixed(2);
  };

  return {
    playerStats,
    matchHistory,
    loading,
    getPlayerAverage,
    getTotalStat,
    getKDRatio,
    refresh: () => {
      fetchPlayerStats();
      fetchMatchHistory();
    },
  };
};