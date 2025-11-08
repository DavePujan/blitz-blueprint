import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  friend_profile?: {
    username: string;
    avatar_url?: string;
  };
}

export const useFriends = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFriends();
    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }, []);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('friends_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friends',
        },
        () => {
          fetchFriends();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchFriends = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch accepted friends
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends' as any)
        .select(`
          *,
          friend_profile:profiles!friends_friend_id_fkey(username, avatar_url)
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (friendsError) throw friendsError;

      // Fetch pending requests received
      const { data: requestsData, error: requestsError } = await supabase
        .from('friends' as any)
        .select(`
          *,
          friend_profile:profiles!friends_user_id_fkey(username, avatar_url)
        `)
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      if (requestsError) throw requestsError;

      setFriends((friendsData as any) || []);
      setFriendRequests((requestsData as any) || []);
    } catch (error: any) {
      console.error('Error fetching friends:', error);
      toast({
        title: 'Error',
        description: 'Failed to load friends',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (friendUsername: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Find friend by username
      const { data: friendProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', friendUsername)
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (!friendProfile) {
        toast({
          title: 'User Not Found',
          description: `No user found with username "${friendUsername}"`,
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('friends' as any)
        .insert({
          user_id: user.id,
          friend_id: friendProfile.id,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Friend request sent to ${friendUsername}`,
      });

      fetchFriends();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send friend request',
        variant: 'destructive',
      });
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friends' as any)
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Friend request accepted',
      });

      fetchFriends();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to accept friend request',
        variant: 'destructive',
      });
    }
  };

  const removeFriend = async (friendId: string) => {
    try {
      const { error } = await supabase
        .from('friends' as any)
        .delete()
        .eq('id', friendId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Friend removed',
      });

      fetchFriends();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to remove friend',
        variant: 'destructive',
      });
    }
  };

  return {
    friends,
    friendRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    removeFriend,
    refresh: fetchFriends,
  };
};