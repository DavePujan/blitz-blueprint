import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Target, Heart, Shield } from "lucide-react";
import type { WeaponStats } from "@/types/weapons";

interface GameHUDProps {
  health: number;
  maxHealth: number;
  currentAmmo: number;
  reserveAmmo: number;
  weaponStats: WeaponStats;
  isReloading: boolean;
}

export const GameHUD = ({ 
  health, 
  maxHealth, 
  currentAmmo, 
  reserveAmmo, 
  weaponStats,
  isReloading 
}: GameHUDProps) => {
  const navigate = useNavigate();
  const healthPercentage = (health / maxHealth) * 100;

  return (
    <>
      {/* Exit Button - Top Left */}
      <div className="absolute top-4 left-4 pointer-events-auto z-20">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/lobby')}
          className="gap-2 bg-background/80 backdrop-blur-md border border-border/50 hover:bg-background/90 hover:border-primary/50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Exit</span>
        </Button>
      </div>

      {/* Center Crosshair */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
        <div className="relative">
          <Target className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
          <div className="absolute inset-0 w-6 h-6 border-2 border-primary/20 rounded-full animate-ping" />
        </div>
      </div>

      {/* Bottom HUD - Player Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 pointer-events-none">
        <div className="max-w-screen-2xl mx-auto flex items-end justify-between gap-4">
          
          {/* Left Side - Health & Shield */}
          <div className="flex flex-col gap-2 pointer-events-auto">
            {/* Health */}
            <div className="bg-background/90 backdrop-blur-md border border-border/50 rounded-lg px-4 py-3 min-w-[220px] shadow-xl">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  healthPercentage > 60 ? 'bg-destructive/10' :
                  healthPercentage > 30 ? 'bg-yellow-500/10' :
                  'bg-red-600/20'
                }`}>
                  <Heart className={`w-5 h-5 ${
                    healthPercentage > 60 ? 'text-destructive' :
                    healthPercentage > 30 ? 'text-yellow-500' :
                    'text-red-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Health</span>
                    <span className="font-mono font-bold text-lg text-foreground">{health}</span>
                  </div>
                  <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden border border-border/30">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        healthPercentage > 60 ? 'bg-gradient-to-r from-destructive via-destructive to-destructive/90' :
                        healthPercentage > 30 ? 'bg-gradient-to-r from-yellow-500 via-yellow-500 to-yellow-600' :
                        'bg-gradient-to-r from-red-600 via-red-600 to-red-700'
                      }`}
                      style={{ width: `${healthPercentage}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shield - Placeholder for future */}
            <div className="bg-background/60 backdrop-blur-md border border-border/30 rounded-lg px-4 py-3 min-w-[220px] opacity-40 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/5">
                  <Shield className="w-5 h-5 text-primary/50" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Shield</span>
                    <span className="font-mono font-bold text-lg text-muted-foreground/70">0</span>
                  </div>
                  <div className="h-2.5 bg-muted/30 rounded-full overflow-hidden border border-border/20">
                    <div className="h-full bg-gradient-to-r from-primary to-primary/80" style={{ width: '0%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Weapon Info & Controls */}
          <div className="flex flex-col gap-2 items-end pointer-events-auto">
            {/* Weapon Display */}
            <div className="bg-background/90 backdrop-blur-md border border-border/50 rounded-lg px-6 py-4 min-w-[280px] shadow-xl">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                    {weaponStats.type.replace('_', ' ')}
                  </div>
                  <div className="text-xl font-bold text-foreground uppercase tracking-tight">
                    {weaponStats.name}
                  </div>
                </div>
              </div>
              
              {isReloading ? (
                <div className="text-primary font-bold text-2xl animate-pulse flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  RELOADING
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2 mb-2">
                    <div className="font-mono text-4xl font-bold text-foreground tabular-nums">
                      {currentAmmo}
                    </div>
                    <div className="text-muted-foreground text-xl font-bold">/</div>
                    <div className="font-mono text-2xl text-muted-foreground tabular-nums">
                      {reserveAmmo}
                    </div>
                  </div>
                  <div className="h-2 bg-muted/50 rounded-full overflow-hidden border border-border/30">
                    <div 
                      className="h-full bg-gradient-to-r from-secondary via-secondary to-secondary/80 transition-all duration-200" 
                      style={{ width: `${(currentAmmo / weaponStats.magazineSize) * 100}%` }} 
                    />
                  </div>
                </>
              )}
            </div>

            {/* Compact Controls */}
            <div className="bg-background/60 backdrop-blur-md border border-border/30 rounded-lg px-4 py-2.5 opacity-70 hover:opacity-100 transition-opacity shadow-lg">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <div><kbd className="px-1.5 py-0.5 bg-muted/50 rounded text-xs font-mono font-semibold text-foreground">WASD</kbd> Move</div>
                <div><kbd className="px-1.5 py-0.5 bg-muted/50 rounded text-xs font-mono font-semibold text-foreground">MOUSE</kbd> Look</div>
                <div><kbd className="px-1.5 py-0.5 bg-muted/50 rounded text-xs font-mono font-semibold text-foreground">CLICK</kbd> Shoot</div>
                <div><kbd className="px-1.5 py-0.5 bg-muted/50 rounded text-xs font-mono font-semibold text-foreground">R</kbd> Reload</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kill Feed - Top Right */}
      <div className="absolute top-20 right-4 space-y-1.5 pointer-events-none z-10 max-w-sm">
        {/* Example kills - will be dynamic */}
      </div>

      {/* Click Prompt */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
        <div className="text-center space-y-2 opacity-30 hover:opacity-60 transition-opacity">
          <p className="text-sm text-muted-foreground font-medium">Click anywhere to enable controls</p>
        </div>
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
