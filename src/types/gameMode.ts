export type GameModeType = 'deathmatch' | 'team_deathmatch' | 'capture_flag';

export interface GameModeConfig {
  id: GameModeType;
  name: string;
  description: string;
  teamBased: boolean;
  maxPlayers: number;
  scoreLimit?: number;
  timeLimit: number; // seconds
  respawnDelay: number; // seconds
}

export const GAME_MODES: Record<GameModeType, GameModeConfig> = {
  deathmatch: {
    id: 'deathmatch',
    name: 'Free For All',
    description: 'Every player for themselves. First to reach score limit wins.',
    teamBased: false,
    maxPlayers: 10,
    scoreLimit: 30,
    timeLimit: 600, // 10 minutes
    respawnDelay: 3,
  },
  team_deathmatch: {
    id: 'team_deathmatch',
    name: 'Team Deathmatch',
    description: '5v5 team battle. First team to reach score limit wins.',
    teamBased: true,
    maxPlayers: 10,
    scoreLimit: 50,
    timeLimit: 600, // 10 minutes
    respawnDelay: 5,
  },
  capture_flag: {
    id: 'capture_flag',
    name: 'Capture The Flag',
    description: 'Capture the enemy flag and return it to your base. First to 3 captures wins.',
    teamBased: true,
    maxPlayers: 10,
    scoreLimit: 3,
    timeLimit: 900, // 15 minutes
    respawnDelay: 5,
  },
};

export interface TeamScore {
  blue: number;
  red: number;
}

export interface PlayerScore {
  playerId: string;
  kills: number;
  deaths: number;
  assists: number;
  captures?: number;
  flagReturns?: number;
}

export interface MatchState {
  mode: GameModeType;
  timeRemaining: number;
  teamScores: TeamScore;
  playerScores: Map<string, PlayerScore>;
  blueFlag?: { captured: boolean; carrierId?: string; position: { x: number; y: number; z: number } };
  redFlag?: { captured: boolean; carrierId?: string; position: { x: number; y: number; z: number } };
  matchStatus: 'waiting' | 'active' | 'finished';
  winner?: 'blue' | 'red' | string; // team name or player id
}
