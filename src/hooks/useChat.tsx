import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  sender_id: string;
  room_id?: string;
  clan_id?: string;
  recipient_id?: string;
  message_type: 'room' | 'clan' | 'private';
  content: string;
  created_at: string;
  sender_profile?: {
    username: string;
    avatar_url?: string;
  };
}

export const useChat = (roomId?: string, clanId?: string, recipientId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
    setupRealtimeSubscription();
  }, [roomId, clanId, recipientId]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: roomId 
            ? `room_id=eq.${roomId}` 
            : clanId 
            ? `clan_id=eq.${clanId}`
            : recipientId
            ? `recipient_id=eq.${recipientId}`
            : undefined,
        },
        (payload) => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchMessages = async () => {
    try {
      let query = supabase
        .from('chat_messages')
        .select(`
          *,
          sender_profile:profiles!chat_messages_sender_id_fkey(username, avatar_url)
        `)
        .order('created_at', { ascending: true })
        .limit(100);

      if (roomId) {
        query = query.eq('room_id', roomId).eq('message_type', 'room');
      } else if (clanId) {
        query = query.eq('clan_id', clanId).eq('message_type', 'clan');
      } else if (recipientId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        query = query
          .eq('message_type', 'private')
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .or(`sender_id.eq.${recipientId},recipient_id.eq.${recipientId}`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (!content.trim()) return;

      const messageData: any = {
        sender_id: user.id,
        content: content.trim(),
      };

      if (roomId) {
        messageData.room_id = roomId;
        messageData.message_type = 'room';
      } else if (clanId) {
        messageData.clan_id = clanId;
        messageData.message_type = 'clan';
      } else if (recipientId) {
        messageData.recipient_id = recipientId;
        messageData.message_type = 'private';
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert(messageData);

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    refresh: fetchMessages,
  };
};