import { MatchState } from '@/types/gameMode';
import { Timer, Target, Flag } from 'lucide-react';

interface MatchHUDProps {
  matchState: MatchState;
}

export const MatchHUD = ({ matchState }: MatchHUDProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isTeamBased = matchState.mode !== 'deathmatch';
  const isCTF = matchState.mode === 'capture_flag';

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
      <div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-lg px-8 py-4 shadow-2xl">
        
        {/* Timer */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Timer className="w-5 h-5 text-primary" />
          </div>
          <span className="text-3xl font-bold text-foreground tabular-nums font-mono tracking-tight">
            {formatTime(matchState.timeRemaining)}
          </span>
        </div>

        {/* Scores */}
        {isTeamBased ? (
          <div className="flex items-center gap-8 justify-center">
            {/* Blue Team */}
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 tabular-nums font-mono">
                  {matchState.teamScores.blue}
                </div>
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Blue
                </div>
              </div>
              {isCTF && <Flag className="w-5 h-5 text-blue-400/80" />}
            </div>

            {/* Divider */}
            <div className="text-muted-foreground/50 font-bold text-lg">—</div>

            {/* Red Team */}
            <div className="flex items-center gap-3">
              {isCTF && <Flag className="w-5 h-5 text-red-400/80" />}
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400 tabular-nums font-mono">
                  {matchState.teamScores.red}
                </div>
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Red
                </div>
              </div>
              <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
            </div>
          </div>
        ) : (
          // Deathmatch - Show player score
          <div className="flex items-center justify-center gap-3">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground tabular-nums font-mono">
                {Array.from(matchState.playerScores.values())[0]?.kills || 0}
              </div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Kills
              </div>
            </div>
          </div>
        )}

        {/* Match Status */}
        {matchState.matchStatus === 'waiting' && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <span className="text-sm text-yellow-500/90 font-medium">
                Waiting for players...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Flag Status (CTF Mode) */}
      {isCTF && matchState.matchStatus === 'active' && (
        <div className="mt-3 flex gap-3 justify-center">
          {/* Blue Flag */}
          <div className={`px-4 py-2 rounded-lg backdrop-blur-md border shadow-lg transition-all ${
            matchState.blueFlag?.captured 
              ? 'bg-red-500/90 border-red-400/50 text-white shadow-red-500/30' 
              : 'bg-blue-500/90 border-blue-400/50 text-white shadow-blue-500/30'
          }`}>
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wide">
                {matchState.blueFlag?.captured ? 'Taken' : 'Safe'}
              </span>
            </div>
          </div>

          {/* Red Flag */}
          <div className={`px-4 py-2 rounded-lg backdrop-blur-md border shadow-lg transition-all ${
            matchState.redFlag?.captured 
              ? 'bg-blue-500/90 border-blue-400/50 text-white shadow-blue-500/30' 
              : 'bg-red-500/90 border-red-400/50 text-white shadow-red-500/30'
          }`}>
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wide">
                {matchState.redFlag?.captured ? 'Taken' : 'Safe'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
