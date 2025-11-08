import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GameWorld } from "@/components/game/GameWorld";
import { GameHUD } from "@/components/game/GameHUD";
import { MatchHUD } from "@/components/game/MatchHUD";
import { Scoreboard } from "@/components/game/Scoreboard";
import { VictoryScreen } from "@/components/game/VictoryScreen";
import { WEAPONS } from "@/types/weapons";
import { useMatchState } from "@/hooks/useMatchState";
import { GameModeType } from "@/types/gameMode";
import { MapType } from "@/types/maps";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const GameDemo = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [playerHealth, setPlayerHealth] = useState({ health: 100, maxHealth: 100 });
  const [weaponInfo, setWeaponInfo] = useState({
    currentAmmo: 30,
    reserveAmmo: 90,
    weaponName: 'M4A1 Assault Rifle',
    isReloading: false,
  });
  const [gameMode, setGameMode] = useState<GameModeType>('team_deathmatch');
  const [mapType, setMapType] = useState<MapType>('factory');
  const [playerTeam, setPlayerTeam] = useState<'blue' | 'red'>('blue');
  const [showScoreboard, setShowScoreboard] = useState(false);

  // Find the current weapon stats based on the weapon name
  const currentWeaponStats = Object.values(WEAPONS).find(w => w.name === weaponInfo.weaponName) || WEAPONS.assault_rifle;

  const { matchState, startMatch, recordKill, initializePlayer } = useMatchState({
    mode: gameMode,
    onMatchEnd: (winner, finalScores) => {
      console.log('Match ended!', winner, finalScores);
    }
  });

  // Load room data and start match
  useEffect(() => {
    const loadRoomData = async () => {
      if (!roomId || !user) return;

      try {
        // Fetch room details
        const { data: roomData, error: roomError } = await supabase
          .from('rooms')
          .select('game_mode, map_name')
          .eq('id', roomId)
          .maybeSingle();

        if (roomError) throw roomError;
        
        if (!roomData) {
          console.error('Room not found');
          navigate('/lobby');
          return;
        }

        // Set game mode and map
        setGameMode(roomData.game_mode as GameModeType);
        setMapType(roomData.map_name as MapType);

        // Get player's team assignment
        const { data: playerData, error: playerError } = await supabase
          .from('room_players')
          .select('team')
          .eq('room_id', roomId)
          .eq('player_id', user.id)
          .maybeSingle();

        if (playerError) throw playerError;
        
        if (playerData?.team) {
          setPlayerTeam(playerData.team as 'blue' | 'red');
        }

        // Initialize player in match state
        initializePlayer(user.id);

        // Start match after a short delay
        setTimeout(() => {
          startMatch();
        }, 2000);
      } catch (error) {
        console.error('Error loading room data:', error);
        navigate('/lobby');
      }
    };

    loadRoomData();
  }, [roomId, user, initializePlayer, startMatch, navigate]);

  // Handle scoreboard toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        setShowScoreboard(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleHealthUpdate = (health: number, maxHealth: number) => {
    setPlayerHealth({ health, maxHealth });
  };

  const handleWeaponUpdate = (currentAmmo: number, reserveAmmo: number, weaponName: string, isReloading: boolean) => {
    setWeaponInfo({ currentAmmo, reserveAmmo, weaponName, isReloading });
  };

  const handleKill = (killerId: string, victimId: string) => {
    // Determine team based on player position (simplified for demo)
    const killerTeam = playerTeam;
    recordKill(killerId, victimId, killerTeam);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 3D Game World */}
      <GameWorld 
        gameMode={gameMode}
        mapType={mapType}
        onHealthUpdate={handleHealthUpdate}
        onWeaponUpdate={handleWeaponUpdate}
        onKill={handleKill}
      />
      
      {/* Match HUD */}
      <MatchHUD matchState={matchState} />
      
      {/* Player HUD */}
      <GameHUD 
        health={playerHealth.health}
        maxHealth={playerHealth.maxHealth}
        currentAmmo={weaponInfo.currentAmmo}
        reserveAmmo={weaponInfo.reserveAmmo}
        weaponStats={currentWeaponStats}
        isReloading={weaponInfo.isReloading}
      />

      {/* Scoreboard (TAB to toggle) */}
      <Scoreboard matchState={matchState} visible={showScoreboard} />

      {/* Victory Screen */}
      {matchState.matchStatus === 'finished' && (
        <VictoryScreen 
          matchState={matchState}
          playerTeam={playerTeam}
          playerId={user?.id}
        />
      )}
    </div>
  );
};

export default GameDemo;
