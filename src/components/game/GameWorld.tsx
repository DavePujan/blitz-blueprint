import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import { GameScene } from './GameScene';
import { GameModeType } from '@/types/gameMode';
import { MapType } from '@/types/maps';

interface GameWorldProps {
  gameMode?: GameModeType;
  mapType?: MapType;
  onHealthUpdate?: (health: number, maxHealth: number) => void;
  onWeaponUpdate?: (currentAmmo: number, reserveAmmo: number, weaponName: string, isReloading: boolean) => void;
  onKill?: (killerId: string, victimId: string) => void;
}

export const GameWorld = ({ 
  gameMode = 'team_deathmatch', 
  mapType = 'factory',
  onHealthUpdate, 
  onWeaponUpdate,
  onKill
}: GameWorldProps) => {
  // Define keyboard controls mapping
  const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'right', keys: ['ArrowRight', 'KeyD'] },
    { name: 'jump', keys: ['Space'] },
    { name: 'sprint', keys: ['ShiftLeft'] },
  ];

  return (
    <div className="absolute inset-0">
      <KeyboardControls map={keyboardMap}>
        <Canvas
          shadows
          camera={{ position: [0, 5, 10], fov: 75 }}
          className="bg-background"
        >
          <GameScene 
            gameMode={gameMode}
            mapType={mapType}
            onHealthUpdate={onHealthUpdate}
            onWeaponUpdate={onWeaponUpdate}
            onKill={onKill}
          />
        </Canvas>
      </KeyboardControls>
    </div>
  );
};
