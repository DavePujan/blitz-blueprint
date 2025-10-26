import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Users, Play, Copy, Check } from "lucide-react";
import { useState } from "react";

const Lobby = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [roomCode, setRoomCode] = useState('');
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [generatedRoomCode] = useState('TX-' + Math.random().toString(36).substring(2, 8).toUpperCase());

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedRoomCode);
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
          <div className="w-20" /> {/* Spacer for alignment */}
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
                {/* Room Code Display */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Room Code</label>
                  <div className="flex gap-2">
                    <Input
                      value={generatedRoomCode}
                      readOnly
                      className="font-mono text-xl tactical-border"
                    />
                    <Button
                      variant="outline"
                      onClick={handleCopyCode}
                      className="px-6"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Share this code with your team</p>
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
                    <select className="w-full px-4 py-2 rounded-md tactical-border bg-card text-foreground">
                      <option>Team Deathmatch</option>
                      <option>Capture the Flag</option>
                      <option>Objective</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Players</label>
                    <select className="w-full px-4 py-2 rounded-md tactical-border bg-card text-foreground">
                      <option>10 (5v5)</option>
                      <option>6 (3v3)</option>
                      <option>2 (1v1)</option>
                    </select>
                  </div>
                </div>

                {/* Create Button */}
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full text-lg"
                  onClick={() => navigate('/game-demo')}
                >
                  <Users className="w-5 h-5" />
                  Create & Enter Room
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
                    placeholder="TX-XXXXXX"
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
                    className="tactical-border"
                  />
                </div>

                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full text-lg"
                  onClick={() => navigate('/game-demo')}
                >
                  <Play className="w-5 h-5" />
                  Join Room
                </Button>
              </div>
            </Card>
          )}

          {/* Available Rooms */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">Public Rooms</h3>
            <div className="grid gap-4">
              <RoomCard
                code="TX-A1B2C3"
                mode="Team Deathmatch"
                players="4/10"
                hasPassword={false}
              />
              <RoomCard
                code="TX-D4E5F6"
                mode="Capture the Flag"
                players="8/10"
                hasPassword={true}
              />
              <RoomCard
                code="TX-G7H8I9"
                mode="Objective"
                players="2/6"
                hasPassword={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoomCard = ({ code, mode, players, hasPassword }: { code: string; mode: string; players: string; hasPassword: boolean }) => (
  <Card className="tactical-border p-6 hover-tactical flex items-center justify-between">
    <div className="flex items-center gap-6">
      <div>
        <div className="font-mono text-lg font-bold text-primary">{code}</div>
        <div className="text-sm text-muted-foreground">{mode}</div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Users className="w-4 h-4 text-primary" />
        <span>{players}</span>
      </div>
      {hasPassword && (
        <div className="flex items-center gap-2 text-sm text-secondary">
          <Lock className="w-4 h-4" />
          <span>Protected</span>
        </div>
      )}
    </div>
    <Button variant="outline">Join</Button>
  </Card>
);

export default Lobby;
