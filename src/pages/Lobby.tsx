import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Users, Play, Copy, Check, LogOut } from "lucide-react";
import { useState } from "react";
import { useRooms } from "@/hooks/useRooms";
import { useAuth } from "@/hooks/useAuth";

const Lobby = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { rooms, loading, createRoom, joinRoom } = useRooms();
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [roomCode, setRoomCode] = useState('');
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [gameMode, setGameMode] = useState('deathmatch');
  const [mapName, setMapName] = useState('factory');
  const [maxPlayers, setMaxPlayers] = useState('10');
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState(false);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      return;
    }

    setCreatingRoom(true);
    const room = await createRoom(
      roomName,
      password || null,
      gameMode,
      mapName
    );
    setCreatingRoom(false);

    if (room) {
      navigate('/game-demo');
    }
  };

  const handleJoinRoom = async (roomId: string, requiresPassword: boolean) => {
    setJoiningRoom(true);
    const success = await joinRoom(roomId, requiresPassword ? password : undefined);
    setJoiningRoom(false);

    if (success) {
      navigate('/game-demo');
    }
  };

  const handleJoinByCode = async () => {
    const room = rooms.find(r => r.room_code === roomCode);
    if (room) {
      await handleJoinRoom(room.id, !!room.password);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">
            <span className="text-primary">Tactical Strike</span> Lobby
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.email}
            </span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={signOut}
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Tab Switcher */}
          <div className="flex gap-4 mb-8">
            <Button
              variant={activeTab === 'create' ? 'default' : 'outline'}
              onClick={() => setActiveTab('create')}
              className="flex-1"
              size="lg"
            >
              Create Room
            </Button>
            <Button
              variant={activeTab === 'join' ? 'default' : 'outline'}
              onClick={() => setActiveTab('join')}
              className="flex-1"
              size="lg"
            >
              Join Room
            </Button>
          </div>

          {/* Create Room */}
          {activeTab === 'create' && (
            <Card className="tactical-border p-8 animate-slide-in-up">
              <h2 className="text-3xl font-bold mb-6">Create Private Room</h2>
              
              <div className="space-y-6">
                {/* Room Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Room Name</label>
                  <Input
                    placeholder="Enter room name..."
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="tactical-border"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    Room Password (Optional)
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="tactical-border"
                  />
                </div>

                {/* Room Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Game Mode</label>
                    <select 
                      className="w-full px-4 py-2 rounded-md tactical-border bg-card text-foreground"
                      value={gameMode}
                      onChange={(e) => setGameMode(e.target.value)}
                    >
                      <option value="deathmatch">Team Deathmatch</option>
                      <option value="objective">Objective</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Players</label>
                    <select 
                      className="w-full px-4 py-2 rounded-md tactical-border bg-card text-foreground"
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(e.target.value)}
                    >
                      <option value="10">10 (5v5)</option>
                      <option value="6">6 (3v3)</option>
                      <option value="2">2 (1v1)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Map</label>
                  <select 
                    className="w-full px-4 py-2 rounded-md tactical-border bg-card text-foreground"
                    value={mapName}
                    onChange={(e) => setMapName(e.target.value)}
                  >
                    <option value="factory">Factory</option>
                    <option value="warehouse">Warehouse</option>
                  </select>
                </div>

                {/* Create Button */}
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full text-lg"
                  onClick={handleCreateRoom}
                  disabled={creatingRoom || !roomName.trim()}
                >
                  <Users className="w-5 h-5" />
                  {creatingRoom ? "Creating..." : "Create & Enter Room"}
                </Button>
              </div>
            </Card>
          )}

          {/* Join Room */}
          {activeTab === 'join' && (
            <Card className="tactical-border p-8 animate-slide-in-up">
              <h2 className="text-3xl font-bold mb-6">Join Private Room</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Enter Room Code</label>
                  <Input
                    placeholder="XXXXXX"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="font-mono text-xl tactical-border"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    Password (if required)
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="tactical-border"
                  />
                </div>

                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full text-lg"
                  onClick={handleJoinByCode}
                  disabled={joiningRoom || !roomCode}
                >
                  <Play className="w-5 h-5" />
                  {joiningRoom ? "Joining..." : "Join Room"}
                </Button>
              </div>
            </Card>
          )}

          {/* Available Rooms */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">Available Rooms</h3>
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Loading rooms...</div>
            ) : rooms.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No rooms available. Create one!</div>
            ) : (
              <div className="grid gap-4">
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onJoin={() => handleJoinRoom(room.id, !!room.password)}
                    onCopyCode={handleCopyCode}
                    isJoining={joiningRoom}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const RoomCard = ({ 
  room, 
  onJoin, 
  onCopyCode,
  isJoining 
}: { 
  room: any; 
  onJoin: () => void; 
  onCopyCode: (code: string) => void;
  isJoining: boolean;
}) => (
  <Card className="tactical-border p-6 hover-tactical flex items-center justify-between">
    <div className="flex items-center gap-6">
      <div>
        <div className="flex items-center gap-2">
          <div className="font-mono text-lg font-bold text-primary">{room.room_code}</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCopyCode(room.room_code)}
            className="h-6 w-6"
          >
            <Copy className="w-3 h-3" />
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">{room.name}</div>
        <div className="text-xs text-muted-foreground capitalize">{room.game_mode} • {room.map_name}</div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Users className="w-4 h-4 text-primary" />
        <span>{room.current_players}/{room.max_players}</span>
      </div>
      {room.password && (
        <div className="flex items-center gap-2 text-sm text-secondary">
          <Lock className="w-4 h-4" />
          <span>Protected</span>
        </div>
      )}
    </div>
    <Button 
      variant="outline"
      onClick={onJoin}
      disabled={isJoining || room.current_players >= room.max_players}
    >
      {isJoining ? "Joining..." : "Join"}
    </Button>
  </Card>
);

export default Lobby;
