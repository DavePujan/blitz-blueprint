import { useState, useEffect, useCallback, useRef } from 'react';
import { GameModeType, MatchState, PlayerScore, GAME_MODES } from '@/types/gameMode';

interface UseMatchStateProps {
  mode: GameModeType;
  onMatchEnd?: (winner: string, finalScores: MatchState) => void;
}

export const useMatchState = ({ mode, onMatchEnd }: UseMatchStateProps) => {
  const config = GAME_MODES[mode];
  const [matchState, setMatchState] = useState<MatchState>({
    mode,
    timeRemaining: config.timeLimit,
    teamScores: { blue: 0, red: 0 },
    playerScores: new Map(),
    matchStatus: 'waiting',
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const matchEndedRef = useRef(false);

  // Start match timer
  const startMatch = useCallback(() => {
    setMatchState(prev => ({ ...prev, matchStatus: 'active' }));
    matchEndedRef.current = false;

    timerRef.current = setInterval(() => {
      setMatchState(prev => {
        if (prev.matchStatus !== 'active') return prev;

        const newTimeRemaining = prev.timeRemaining - 1;
        
        if (newTimeRemaining <= 0 && !matchEndedRef.current) {
          matchEndedRef.current = true;
          endMatch('time');
          return { ...prev, timeRemaining: 0, matchStatus: 'finished' };
        }

        return { ...prev, timeRemaining: newTimeRemaining };
      });
    }, 1000);
  }, []);

  // End match
  const endMatch = useCallback((reason: 'score' | 'time') => {
    if (matchEndedRef.current) return;
    matchEndedRef.current = true;

    setMatchState(prev => {
      let winner: string;

      if (config.teamBased) {
        winner = prev.teamScores.blue > prev.teamScores.red ? 'blue' : 'red';
      } else {
        // Find player with highest kills
        let maxKills = 0;
        let winnerId = '';
        prev.playerScores.forEach((score, playerId) => {
          if (score.kills > maxKills) {
            maxKills = score.kills;
            winnerId = playerId;
          }
        });
        winner = winnerId;
      }

      const finalState = { ...prev, matchStatus: 'finished' as const, winner };
      onMatchEnd?.(winner, finalState);
      return finalState;
    });

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [config.teamBased, onMatchEnd]);

  // Record kill
  const recordKill = useCallback((killerId: string, victimId: string, killerTeam?: 'blue' | 'red') => {
    setMatchState(prev => {
      const newPlayerScores = new Map(prev.playerScores);
      
      // Update killer stats
      const killerScore = newPlayerScores.get(killerId) || {
        playerId: killerId,
        kills: 0,
        deaths: 0,
        assists: 0,
      };
      killerScore.kills += 1;
      newPlayerScores.set(killerId, killerScore);

      // Update victim stats
      const victimScore = newPlayerScores.get(victimId) || {
        playerId: victimId,
        kills: 0,
        deaths: 0,
        assists: 0,
      };
      victimScore.deaths += 1;
      newPlayerScores.set(victimId, victimScore);

      // Update team scores if applicable
      let newTeamScores = prev.teamScores;
      if (config.teamBased && killerTeam) {
        newTeamScores = {
          ...prev.teamScores,
          [killerTeam]: prev.teamScores[killerTeam] + 1,
        };

        // Check for score limit win
        if (config.scoreLimit && newTeamScores[killerTeam] >= config.scoreLimit) {
          endMatch('score');
        }
      } else if (!config.teamBased) {
        // Check for score limit win in FFA
        if (config.scoreLimit && killerScore.kills >= config.scoreLimit) {
          endMatch('score');
        }
      }

      return {
        ...prev,
        teamScores: newTeamScores,
        playerScores: newPlayerScores,
      };
    });
  }, [config.teamBased, config.scoreLimit, endMatch]);

  // Record flag capture (CTF mode)
  const recordFlagCapture = useCallback((team: 'blue' | 'red', playerId: string) => {
    setMatchState(prev => {
      const newTeamScores = {
        ...prev.teamScores,
        [team]: prev.teamScores[team] + 1,
      };

      const newPlayerScores = new Map(prev.playerScores);
      const playerScore = newPlayerScores.get(playerId) || {
        playerId,
        kills: 0,
        deaths: 0,
        assists: 0,
        captures: 0,
      };
      playerScore.captures = (playerScore.captures || 0) + 1;
      newPlayerScores.set(playerId, playerScore);

      // Check for score limit win
      if (config.scoreLimit && newTeamScores[team] >= config.scoreLimit) {
        endMatch('score');
      }

      return {
        ...prev,
        teamScores: newTeamScores,
        playerScores: newPlayerScores,
        // Reset flags
        blueFlag: { captured: false, position: { x: 0, y: 0, z: 0 } },
        redFlag: { captured: false, position: { x: 0, y: 0, z: 0 } },
      };
    });
  }, [config.scoreLimit, endMatch]);

  // Update flag status
  const updateFlagStatus = useCallback((
    flag: 'blue' | 'red',
    captured: boolean,
    carrierId?: string,
    position?: { x: number; y: number; z: number }
  ) => {
    setMatchState(prev => ({
      ...prev,
      [`${flag}Flag`]: {
        captured,
        carrierId,
        position: position || prev[`${flag}Flag`]?.position || { x: 0, y: 0, z: 0 },
      },
    }));
  }, []);

  // Initialize player
  const initializePlayer = useCallback((playerId: string) => {
    setMatchState(prev => {
      if (prev.playerScores.has(playerId)) return prev;

      const newPlayerScores = new Map(prev.playerScores);
      newPlayerScores.set(playerId, {
        playerId,
        kills: 0,
        deaths: 0,
        assists: 0,
        captures: 0,
        flagReturns: 0,
      });

      return { ...prev, playerScores: newPlayerScores };
    });
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    matchState,
    startMatch,
    endMatch,
    recordKill,
    recordFlagCapture,
    updateFlagStatus,
    initializePlayer,
  };
};
