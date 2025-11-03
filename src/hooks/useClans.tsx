import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Clan {
  id: string;
  name: string;
  tag: string;
  description?: string;
  owner_id: string;
  max_members: number;
  is_public: boolean;
  created_at: string;
  member_count?: number;
}

export interface ClanMember {
  id: string;
  clan_id: string;
  player_id: string;
  role: 'owner' | 'officer' | 'member';
  joined_at: string;
  profile?: {
    username: string;
    avatar_url?: string;
  };
}

export const useClans = () => {
  const [userClan, setUserClan] = useState<Clan | null>(null);
  const [clanMembers, setClanMembers] = useState<ClanMember[]>([]);
  const [availableClans, setAvailableClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserClan();
    fetchAvailableClans();
  }, []);

  const fetchUserClan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: membership, error: membershipError } = await supabase
        .from('clan_members')
        .select('clan_id, role')
        .eq('player_id', user.id)
        .single();

      if (membershipError && membershipError.code !== 'PGRST116') throw membershipError;

      if (membership) {
        const { data: clan, error: clanError } = await supabase
          .from('clans')
          .select('*')
          .eq('id', membership.clan_id)
          .single();

        if (clanError) throw clanError;
        setUserClan(clan);
        fetchClanMembers(membership.clan_id);
      }
    } catch (error: any) {
      console.error('Error fetching user clan:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClanMembers = async (clanId: string) => {
    try {
      const { data, error } = await supabase
        .from('clan_members')
        .select(`
          *,
          profile:profiles(username, avatar_url)
        `)
        .eq('clan_id', clanId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      setClanMembers(data || []);
    } catch (error: any) {
      console.error('Error fetching clan members:', error);
    }
  };

  const fetchAvailableClans = async () => {
    try {
      const { data, error } = await supabase
        .from('clans')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAvailableClans(data || []);
    } catch (error: any) {
      console.error('Error fetching available clans:', error);
    }
  };

  const createClan = async (name: string, tag: string, description?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('clans')
        .insert({
          name,
          tag: tag.toUpperCase(),
          description,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Clan "${name}" created successfully`,
      });

      fetchUserClan();
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create clan',
        variant: 'destructive',
      });
    }
  };

  const joinClan = async (clanId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('clan_members')
        .insert({
          clan_id: clanId,
          player_id: user.id,
          role: 'member',
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Joined clan successfully',
      });

      fetchUserClan();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to join clan',
        variant: 'destructive',
      });
    }
  };

  const leaveClan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !userClan) return;

      const { error } = await supabase
        .from('clan_members')
        .delete()
        .eq('clan_id', userClan.id)
        .eq('player_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Left clan successfully',
      });

      setUserClan(null);
      setClanMembers([]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to leave clan',
        variant: 'destructive',
      });
    }
  };

  return {
    userClan,
    clanMembers,
    availableClans,
    loading,
    createClan,
    joinClan,
    leaveClan,
    refresh: fetchUserClan,
  };
};