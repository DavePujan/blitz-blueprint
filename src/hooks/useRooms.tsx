import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface Room {
  id: string;
  room_code: string;
  name: string;
  password: string | null;
  max_players: number;
  current_players: number;
  status: string;
  game_mode: string;
  map_name: string;
  created_by: string;
  created_at: string;
}

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("status", "waiting")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRooms(data || []);
    } catch (error: any) {
      toast({
        title: "Failed to fetch rooms",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("rooms-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rooms",
        },
        () => {
          fetchRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createRoom = async (name: string, password: string | null, gameMode: string, mapName: string) => {
    if (!user) return null;

    try {
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data, error } = await supabase
        .from("rooms")
        .insert({
          room_code: roomCode,
          name,
          password,
          game_mode: gameMode,
          map_name: mapName,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Join the room as the creator
      await joinRoom(data.id);

      toast({
        title: "Room created!",
        description: `Room code: ${roomCode}`,
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Failed to create room",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const joinRoom = async (roomId: string, password?: string) => {
    if (!user) return false;

    try {
      // Check if room requires password
      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .select("password")
        .eq("id", roomId)
        .single();

      if (roomError) throw roomError;

      if (room.password && room.password !== password) {
        toast({
          title: "Invalid password",
          description: "The password you entered is incorrect",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from("room_players")
        .insert({
          room_id: roomId,
          player_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Joined room!",
        description: "Successfully joined the room",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Failed to join room",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    rooms,
    loading,
    createRoom,
    joinRoom,
    refreshRooms: fetchRooms,
  };
};
