import { MatchState } from '@/types/gameMode';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Users, Flag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VictoryScreenProps {
  matchState: MatchState;
  playerTeam?: 'blue' | 'red';
  playerId?: string;
}

export const VictoryScreen = ({ matchState, playerTeam, playerId }: VictoryScreenProps) => {
  const navigate = useNavigate();
  const isTeamBased = matchState.mode !== 'deathmatch';
  const isCTF = matchState.mode === 'capture_flag';

  // Determine if local player won
  const isWinner = isTeamBased 
    ? matchState.winner === playerTeam 
    : matchState.winner === playerId;

  // Get top 3 players
  const topPlayers = Array.from(matchState.playerScores.entries())
    .sort((a, b) => b[1].kills - a[1].kills)
    .slice(0, 3);

  const handleReturnToLobby = () => {
    navigate('/lobby');
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="max-w-4xl w-full mx-4">
        {/* Victory/Defeat Banner */}
        <div className={`text-center mb-8 ${isWinner ? 'animate-bounce' : ''}`}>
          <Trophy className={`w-24 h-24 mx-auto mb-4 ${
            isWinner ? 'text-yellow-400' : 'text-muted-foreground'
          }`} />
          <h1 className={`text-6xl font-bold mb-2 ${
            isWinner ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {isWinner ? 'VICTORY!' : 'DEFEAT'}
          </h1>
          {isTeamBased && (
            <p className="text-2xl text-muted-foreground">
              {matchState.winner === 'blue' ? 'Blue' : 'Red'} Team Wins!
            </p>
          )}
        </div>

        {/* Match Statistics */}
        <div className="bg-black/60 border border-primary/30 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Match Statistics
          </h2>

          {/* Team Scores */}
          {isTeamBased && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500" />
                  <span className="text-xl font-bold text-blue-400">Blue Team</span>
                </div>
                <div className="text-4xl font-bold text-white">
                  {matchState.teamScores.blue}
                  {isCTF && <Flag className="inline ml-2 w-6 h-6" />}
                </div>
              </div>

              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-red-500" />
                  <span className="text-xl font-bold text-red-400">Red Team</span>
                </div>
                <div className="text-4xl font-bold text-white">
                  {matchState.teamScores.red}
                  {isCTF && <Flag className="inline ml-2 w-6 h-6" />}
                </div>
              </div>
            </div>
          )}

          {/* Top Players */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Top Players
            </h3>
            <div className="space-y-2">
              {topPlayers.map(([id, score], index) => (
                <div
                  key={id}
                  className={`flex items-center gap-4 p-3 rounded-lg ${
                    index === 0 
                      ? 'bg-yellow-500/20 border border-yellow-500/50' 
                      : 'bg-background-dark/50 border border-primary/20'
                  }`}
                >
                  <div className={`text-2xl font-bold ${
                    index === 0 ? 'text-yellow-400' : 'text-muted-foreground'
                  }`}>
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold">
                      Player {id.substring(0, 8)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">
                      {score.kills} <span className="text-sm text-muted-foreground">kills</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {score.deaths} deaths • {score.assists} assists
                    </div>
                    {isCTF && score.captures && (
                      <div className="text-sm text-primary">
                        {score.captures} captures
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={handleReturnToLobby}
            size="lg"
            variant="tactical"
            className="px-8"
          >
            Return to Lobby
          </Button>
        </div>
      </div>
    </div>
  );
};
