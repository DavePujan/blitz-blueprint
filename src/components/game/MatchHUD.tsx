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
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
      <div className="bg-black/70 backdrop-blur-sm border border-primary/30 rounded-lg px-6 py-3 shadow-lg">
        {/* Timer */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Timer className="w-5 h-5 text-primary" />
          <span className="text-2xl font-bold text-white tabular-nums">
            {formatTime(matchState.timeRemaining)}
          </span>
        </div>

        {/* Scores */}
        {isTeamBased ? (
          <div className="flex items-center gap-6">
            {/* Blue Team */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xl font-bold text-blue-400">
                {isCTF ? matchState.teamScores.blue : matchState.teamScores.blue}
              </span>
              {isCTF && <Flag className="w-4 h-4 text-blue-400" />}
            </div>

            {/* VS Divider */}
            <div className="text-muted-foreground font-bold">VS</div>

            {/* Red Team */}
            <div className="flex items-center gap-2">
              {isCTF && <Flag className="w-4 h-4 text-red-400" />}
              <span className="text-xl font-bold text-red-400">
                {isCTF ? matchState.teamScores.red : matchState.teamScores.red}
              </span>
              <div className="w-3 h-3 rounded-full bg-red-500" />
            </div>
          </div>
        ) : (
          // Free For All - Show your score
          <div className="flex items-center justify-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold text-white">
              {Array.from(matchState.playerScores.values())[0]?.kills || 0} Kills
            </span>
          </div>
        )}

        {/* Match Status Indicator */}
        {matchState.matchStatus === 'waiting' && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <span className="text-sm text-yellow-400 animate-pulse">
              Waiting for players...
            </span>
          </div>
        )}
      </div>

      {/* Flag Status (CTF Mode) */}
      {isCTF && matchState.matchStatus === 'active' && (
        <div className="mt-2 flex gap-4 justify-center">
          {/* Blue Flag Status */}
          <div className={`px-3 py-1 rounded ${
            matchState.blueFlag?.captured 
              ? 'bg-red-500/80 text-white' 
              : 'bg-blue-500/80 text-white'
          }`}>
            <Flag className="w-4 h-4 inline mr-1" />
            {matchState.blueFlag?.captured ? 'TAKEN' : 'SAFE'}
          </div>

          {/* Red Flag Status */}
          <div className={`px-3 py-1 rounded ${
            matchState.redFlag?.captured 
              ? 'bg-blue-500/80 text-white' 
              : 'bg-red-500/80 text-white'
          }`}>
            <Flag className="w-4 h-4 inline mr-1" />
            {matchState.redFlag?.captured ? 'TAKEN' : 'SAFE'}
          </div>
        </div>
      )}
    </div>
  );
};
