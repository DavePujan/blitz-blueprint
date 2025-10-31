import { useState } from 'react';
import { MatchState } from '@/types/gameMode';
import { Target, Skull, Users } from 'lucide-react';

interface ScoreboardProps {
  matchState: MatchState;
  visible: boolean;
}

export const Scoreboard = ({ matchState, visible }: ScoreboardProps) => {
  if (!visible) return null;

  const isTeamBased = matchState.mode !== 'deathmatch';
  const players = Array.from(matchState.playerScores.entries());

  // Sort players by kills
  const sortedPlayers = players.sort((a, b) => b[1].kills - a[1].kills);

  // Separate by team if team-based
  const bluePlayers = isTeamBased 
    ? sortedPlayers.filter((_, i) => i % 2 === 0) 
    : [];
  const redPlayers = isTeamBased 
    ? sortedPlayers.filter((_, i) => i % 2 === 1) 
    : [];

  const PlayerRow = ({ playerId, score, rank }: { playerId: string; score: any; rank: number }) => (
    <div className="flex items-center gap-4 px-4 py-2 bg-background-dark/50 hover:bg-background-dark/70 transition-colors">
      <div className="text-muted-foreground font-bold w-8">#{rank}</div>
      <div className="flex-1 text-white truncate">
        Player {playerId.substring(0, 8)}
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Target className="w-4 h-4 text-green-400" />
          <span className="text-white font-bold w-8 text-right">{score.kills}</span>
        </div>
        <div className="flex items-center gap-1">
          <Skull className="w-4 h-4 text-red-400" />
          <span className="text-white font-bold w-8 text-right">{score.deaths}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-blue-400" />
          <span className="text-white font-bold w-8 text-right">{score.assists}</span>
        </div>
        <div className="text-primary font-bold w-12 text-right">
          {score.kills > 0 ? (score.kills / Math.max(score.deaths, 1)).toFixed(2) : '0.00'}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-t-lg p-4">
          <h2 className="text-3xl font-bold text-white text-center">SCOREBOARD</h2>
        </div>

        {/* Column Headers */}
        <div className="bg-background-dark border-x border-primary/30 px-4 py-3 flex items-center gap-4">
          <div className="w-8 text-muted-foreground text-sm font-bold">#</div>
          <div className="flex-1 text-muted-foreground text-sm font-bold">Player</div>
          <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground">
            <div className="flex items-center gap-1 w-16">
              <Target className="w-4 h-4" />
              Kills
            </div>
            <div className="flex items-center gap-1 w-16">
              <Skull className="w-4 h-4" />
              Deaths
            </div>
            <div className="flex items-center gap-1 w-16">
              <Users className="w-4 h-4" />
              Assists
            </div>
            <div className="w-12 text-right">K/D</div>
          </div>
        </div>

        {/* Player Lists */}
        <div className="bg-black/60 border border-primary/30 rounded-b-lg overflow-hidden">
          {isTeamBased ? (
            <div className="grid grid-cols-2 divide-x divide-primary/30">
              {/* Blue Team */}
              <div>
                <div className="bg-blue-500/20 border-b border-blue-500/50 px-4 py-2">
                  <h3 className="text-xl font-bold text-blue-400">Blue Team</h3>
                  <div className="text-2xl font-bold text-white">
                    {matchState.teamScores.blue}
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {bluePlayers.map(([playerId, score], index) => (
                    <PlayerRow
                      key={playerId}
                      playerId={playerId}
                      score={score}
                      rank={index + 1}
                    />
                  ))}
                </div>
              </div>

              {/* Red Team */}
              <div>
                <div className="bg-red-500/20 border-b border-red-500/50 px-4 py-2">
                  <h3 className="text-xl font-bold text-red-400">Red Team</h3>
                  <div className="text-2xl font-bold text-white">
                    {matchState.teamScores.red}
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {redPlayers.map(([playerId, score], index) => (
                    <PlayerRow
                      key={playerId}
                      playerId={playerId}
                      score={score}
                      rank={index + 1}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Free For All
            <div className="max-h-96 overflow-y-auto">
              {sortedPlayers.map(([playerId, score], index) => (
                <PlayerRow
                  key={playerId}
                  playerId={playerId}
                  score={score}
                  rank={index + 1}
                />
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-4 text-muted-foreground text-sm">
          Press TAB to close
        </div>
      </div>
    </div>
  );
};
