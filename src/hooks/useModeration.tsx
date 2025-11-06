import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PlayerReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  description?: string;
  evidence_urls?: string[];
  status: string;
  reviewed_by?: string;
  reviewed_at?: string;
  action_taken?: string;
  created_at: string;
}

export interface PlayerBan {
  id: string;
  user_id: string;
  banned_by: string;
  reason: string;
  ban_type: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

export const useModeration = () => {
  const [reports, setReports] = useState<PlayerReport[]>([]);
  const [bans, setBans] = useState<PlayerBan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModerator, setIsModerator] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkModeratorStatus();
  }, []);

  const checkModeratorStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_roles' as any)
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['moderator', 'admin']);

      if (error) throw error;

      setIsModerator((data as any)?.length > 0);
      
      if ((data as any)?.length > 0) {
        fetchReports();
        fetchBans();
      }
    } catch (error: any) {
      console.error('Error checking moderator status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('player_reports' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchBans = async () => {
    try {
      const { data, error } = await supabase
        .from('player_bans' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBans((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching bans:', error);
    }
  };

  const submitReport = async (reportedUserId: string, reason: string, description?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('player_reports' as any)
        .insert({
          reporter_id: user.id,
          reported_user_id: reportedUserId,
          reason,
          description,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Report submitted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit report',
        variant: 'destructive',
      });
    }
  };

  const reviewReport = async (reportId: string, actionTaken: string, status: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('player_reports' as any)
        .update({
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          action_taken: actionTaken,
          status,
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Report reviewed',
      });

      fetchReports();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to review report',
        variant: 'destructive',
      });
    }
  };

  const banPlayer = async (
    userId: string,
    reason: string,
    banType: 'temporary' | 'permanent',
    expiresAt?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('player_bans' as any)
        .insert({
          user_id: userId,
          banned_by: user.id,
          reason,
          ban_type: banType,
          expires_at: expiresAt,
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Player banned successfully',
      });

      fetchBans();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to ban player',
        variant: 'destructive',
      });
    }
  };

  const unbanPlayer = async (banId: string) => {
    try {
      const { error } = await supabase
        .from('player_bans' as any)
        .update({ is_active: false })
        .eq('id', banId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Player unbanned',
      });

      fetchBans();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to unban player',
        variant: 'destructive',
      });
    }
  };

  return {
    reports,
    bans,
    loading,
    isModerator,
    submitReport,
    reviewReport,
    banPlayer,
    unbanPlayer,
    refresh: () => {
      fetchReports();
      fetchBans();
    },
  };
};
