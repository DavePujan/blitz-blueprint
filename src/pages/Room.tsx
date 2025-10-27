import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, X, Users, Lock, MapPin, Gamepad2 } from "lucide-react";

interface Player {
  id: string;
  player_id: string;
  is_ready: boolean;
  team: string | null;
  profiles: {
    username: string;
  } | null;
}

interface Room {
  id: string;
  name: string;
  room_code: string;
  game_mode: string;
  map_name: string;
  current_players: number;
  max_players: number;
  status: string;
  created_by: string;
  has_password: boolean;
}

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!roomId) {
      navigate('/lobby');
      return;
    }

    fetchRoomData();

    // Subscribe to room changes
    const roomChannel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updatedRoom = payload.new as Room;
            setRoom(updatedRoom);
            
            // Navigate to game when match starts
            if (updatedRoom.status === 'in_progress') {
              toast({
                title: "Match Starting!",
                description: "Loading game...",
              });
              navigate('/game-demo');
            }
          }
        }
      )
      .subscribe();

    // Subscribe to player changes
    const playersChannel = supabase
      .channel(`room_players:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_players',
          filter: `room_id=eq.${roomId}`
        },
        () => {
          fetchPlayers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(playersChannel);
    };
  }, [roomId]);

  const fetchRoomData = async () => {
    if (!roomId) return;

    try {
      // Fetch room details
      const { data: roomData, error: roomError } = await supabase
        .from('rooms_public')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError) throw roomError;
      setRoom(roomData as Room);

      // Fetch players
      await fetchPlayers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading room",
        description: error.message,
      });
      navigate('/lobby');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayers = async () => {
    if (!roomId) return;

    const { data, error } = await supabase
      .from('room_players')
      .select(`
        *,
        profiles:player_id (username)
      `)
      .eq('room_id', roomId);

    if (error) {
      console.error('Error fetching players:', error);
      return;
    }

    setPlayers(data as Player[]);
    
    // Update current user's ready status
    const currentPlayer = data.find(p => p.player_id === user?.id);
    if (currentPlayer) {
      setIsReady(currentPlayer.is_ready);
    }
  };

  const handleToggleReady = async () => {
    if (!user || !roomId) return;

    try {
      const { error } = await supabase
        .from('room_players')
        .update({ is_ready: !isReady })
        .eq('room_id', roomId)
        .eq('player_id', user.id);

      if (error) throw error;

      setIsReady(!isReady);
      toast({
        title: isReady ? "Marked as Not Ready" : "Marked as Ready",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleStartMatch = async () => {
    if (!user || !roomId || !room) return;

    if (room.created_by !== user.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Only the room creator can start the match",
      });
      return;
    }

    const allReady = players.every(p => p.is_ready);
    if (!allReady) {
      toast({
        variant: "destructive",
        title: "Cannot start match",
        description: "All players must be ready",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('rooms')
        .update({ 
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', roomId);

      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error starting match",
        description: error.message,
      });
    }
  };

  const handleLeaveRoom = async () => {
    if (!user || !roomId) return;

    try {
      const { error } = await supabase
        .from('room_players')
        .delete()
        .eq('room_id', roomId)
        .eq('player_id', user.id);

      if (error) throw error;

      navigate('/lobby');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error leaving room",
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading room...</div>
      </div>
    );
  }

  if (!room) {
    return null;
  }

  const isCreator = user?.id === room.created_by;
  const allReady = players.length > 0 && players.every(p => p.is_ready);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={handleLeaveRoom}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Leave Room
          </Button>

          <div className="text-center">
            <h1 className="text-3xl font-bold">{room.name}</h1>
            <p className="text-muted-foreground">Room Code: <span className="font-mono font-bold">{room.room_code}</span></p>
          </div>

          <div className="w-32" />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Room Info */}
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold">Room Details</h2>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Mode: <span className="font-medium">{room.game_mode}</span></span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Map: <span className="font-medium">{room.map_name}</span></span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Players: <span className="font-medium">{players.length}/{room.max_players}</span></span>
              </div>

              {room.has_password && (
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Password Protected</span>
                </div>
              )}
            </div>

            <div className="pt-4 space-y-2">
              <Button
                onClick={handleToggleReady}
                variant={isReady ? "outline" : "default"}
                className="w-full gap-2"
              >
                {isReady ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                {isReady ? "Not Ready" : "Ready"}
              </Button>

              {isCreator && (
                <Button
                  onClick={handleStartMatch}
                  disabled={!allReady || players.length < 1}
                  className="w-full"
                  variant="hero"
                >
                  Start Match
                </Button>
              )}
            </div>
          </Card>

          {/* Players List */}
          <Card className="p-6 md:col-span-2">
            <h2 className="text-xl font-bold mb-4">Players ({players.length})</h2>
            
            <div className="grid gap-3">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {player.profiles?.username || 'Unknown Player'}
                        {player.player_id === room.created_by && (
                          <span className="ml-2 text-xs text-primary">(Host)</span>
                        )}
                      </p>
                      {player.team && (
                        <p className="text-sm text-muted-foreground">Team: {player.team}</p>
                      )}
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                    player.is_ready 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {player.is_ready ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">Ready</span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        <span className="text-sm font-medium">Not Ready</span>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {players.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No players in room yet
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Room;
