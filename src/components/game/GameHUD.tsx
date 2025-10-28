import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Target, Heart, Shield, Zap } from "lucide-react";

export const GameHUD = () => {
  const navigate = useNavigate();

  const handlePointerLock = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.requestPointerLock();
    }
  };

  return (
    <>
      {/* Pointer Lock Prompt */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="text-center space-y-4 opacity-50 hover:opacity-100 transition-opacity pointer-events-auto">
          <p className="text-sm text-muted-foreground">Click to enable mouse look</p>
        </div>
      </div>

      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-auto">
        <div className="flex items-center justify-between">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/lobby')}
            className="gap-2 tactical-border"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit Match
          </Button>

          {/* Match Info */}
          <div className="tactical-border px-6 py-3 rounded-lg backdrop-blur-sm">
            <div className="text-center">
              <div className="text-2xl font-bold font-mono">12:34</div>
              <div className="text-xs text-muted-foreground">Team Deathmatch</div>
            </div>
          </div>

          {/* Score */}
          <div className="tactical-border px-6 py-3 rounded-lg backdrop-blur-sm flex items-center gap-6">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">24</div>
              <div className="text-xs text-muted-foreground">Blue</div>
            </div>
            <div className="text-2xl text-muted-foreground">:</div>
            <div className="text-center">
              <div className="text-lg font-bold text-destructive">18</div>
              <div className="text-xs text-muted-foreground">Red</div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Crosshair */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <Target className="w-8 h-8 text-primary tactical-glow animate-pulse-glow" />
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
        <div className="flex items-end justify-between">
          {/* Player Stats */}
          <div className="space-y-2">
            {/* Health */}
            <div className="tactical-border px-4 py-2 rounded-lg backdrop-blur-sm flex items-center gap-3 min-w-[200px]">
              <Heart className="w-5 h-5 text-destructive" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">HEALTH</span>
                  <span className="font-mono font-bold">100</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-destructive to-destructive/80" style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            {/* Shield */}
            <div className="tactical-border px-4 py-2 rounded-lg backdrop-blur-sm flex items-center gap-3 min-w-[200px]">
              <Shield className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">SHIELD</span>
                  <span className="font-mono font-bold">50</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-primary/80" style={{ width: '50%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Weapon Info */}
          <div className="tactical-border px-6 py-4 rounded-lg backdrop-blur-sm min-w-[250px]">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-xs text-muted-foreground">PRIMARY</div>
                <div className="text-lg font-bold">ASSAULT RIFLE</div>
              </div>
              <Zap className="w-6 h-6 text-secondary" />
            </div>
            <div className="flex items-center gap-2">
              <div className="font-mono text-2xl font-bold">30</div>
              <div className="text-muted-foreground">/</div>
              <div className="font-mono text-lg text-muted-foreground">120</div>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden mt-2">
              <div className="h-full bg-gradient-to-r from-secondary to-secondary/80" style={{ width: '75%' }} />
            </div>
          </div>

          {/* Controls Info */}
          <div className="tactical-border px-4 py-3 rounded-lg backdrop-blur-sm space-y-1 text-xs text-muted-foreground">
            <div>WASD - Move</div>
            <div>Mouse - Look</div>
            <div>Click - Shoot</div>
            <div>Shift - Sprint</div>
          </div>
        </div>
      </div>

      {/* Kill Feed (Top Right) */}
      <div className="absolute top-20 right-4 space-y-2 pointer-events-none">
        <KillFeedItem killer="Player1" victim="Enemy3" weapon="headshot" />
        <KillFeedItem killer="Player2" victim="Enemy1" weapon="rifle" />
      </div>
    </>
  );
};

const KillFeedItem = ({ killer, victim, weapon }: { killer: string; victim: string; weapon: string }) => (
  <div className="tactical-border px-3 py-2 rounded backdrop-blur-sm text-sm flex items-center gap-2 animate-slide-in-right">
    <span className="text-primary font-medium">{killer}</span>
    <Target className="w-3 h-3 text-muted-foreground" />
    <span className="text-destructive font-medium">{victim}</span>
  </div>
);
