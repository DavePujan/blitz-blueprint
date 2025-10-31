import { useState } from 'react';
import { Sky, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { PlayerController } from './PlayerController';
import { BulletTracer } from './BulletTracer';
import { MapLoader } from './MapLoader';
import type { Bullet } from '@/types/game';
import type { WeaponType } from '@/types/weapons';
import { useGameNetworking } from '@/hooks/useGameNetworking';
import { useParams } from 'react-router-dom';
import { GameModeType } from '@/types/gameMode';
import { MapType } from '@/types/maps';

interface GameSceneProps {
  gameMode?: GameModeType;
  mapType?: MapType;
  onHealthUpdate?: (health: number, maxHealth: number) => void;
  onWeaponUpdate?: (currentAmmo: number, reserveAmmo: number, weaponName: string, isReloading: boolean) => void;
  onKill?: (killerId: string, victimId: string) => void;
}

export const GameScene = ({ 
  gameMode = 'team_deathmatch',
  mapType = 'factory',
  onHealthUpdate, 
  onWeaponUpdate,
  onKill
}: GameSceneProps) => {
  const { roomId } = useParams();
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [playerHealth, setPlayerHealth] = useState({ health: 100, maxHealth: 100 });
  const [weaponInfo, setWeaponInfo] = useState({
    currentAmmo: 30,
    reserveAmmo: 90,
    weaponName: 'M4A1 Assault Rifle',
    isReloading: false,
  });
  
  const { players, shootEvents, updatePosition, broadcastShoot } = useGameNetworking(roomId || 'demo');

  const handleShoot = (origin: THREE.Vector3, direction: THREE.Vector3, weaponType: WeaponType) => {
    const newBullet: Bullet = {
      id: `${Date.now()}_${Math.random()}`,
      origin: origin.clone(),
      direction: direction.clone().normalize(),
    };
    setBullets((prev) => [...prev, newBullet]);
    broadcastShoot(origin, direction, weaponType);
  };

  const handleBulletComplete = (bulletId: string) => {
    setBullets((prev) => prev.filter((b) => b.id !== bulletId));
  };

  const handlePositionUpdate = (position: THREE.Vector3, rotation: THREE.Euler) => {
    updatePosition(position, rotation);
  };

  const handleHealthUpdate = (health: number, maxHealth: number) => {
    setPlayerHealth({ health, maxHealth });
    onHealthUpdate?.(health, maxHealth);
  };

  const handleWeaponUpdate = (currentAmmo: number, reserveAmmo: number, weaponName: string, isReloading: boolean) => {
    setWeaponInfo({ currentAmmo, reserveAmmo, weaponName, isReloading });
    onWeaponUpdate?.(currentAmmo, reserveAmmo, weaponName, isReloading);
  };

  return (
    <>
      {/* Sky and Environment */}
      <Sky sunPosition={[100, 20, 100]} />
      <Environment preset="sunset" />

      {/* Directional Light */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />

      {/* Map with cover, flags, and boundaries */}
      <MapLoader mapType={mapType} gameMode={gameMode} />

      {/* Player Controller */}
      <PlayerController 
        onShoot={handleShoot} 
        onPositionUpdate={handlePositionUpdate}
        onHealthUpdate={handleHealthUpdate}
        onWeaponUpdate={handleWeaponUpdate}
      />

      {/* Other Players */}
      {Array.from(players.entries()).map(([id, player]) => (
        <OtherPlayer key={id} player={player} />
      ))}

      {/* Bullet Tracers */}
      {bullets.map((bullet) => (
        <BulletTracer
          key={bullet.id}
          origin={bullet.origin}
          direction={bullet.direction}
          onComplete={() => handleBulletComplete(bullet.id)}
        />
      ))}

      {/* Network Shoot Events */}
      {shootEvents.map((event, index) => (
        <BulletTracer
          key={`${event.playerId}_${event.timestamp}_${index}`}
          origin={new THREE.Vector3(event.origin.x, event.origin.y, event.origin.z)}
          direction={new THREE.Vector3(event.direction.x, event.direction.y, event.direction.z)}
          onComplete={() => {}}
        />
      ))}
    </>
  );
};

// Helper component for rendering other players
const OtherPlayer = ({ player }: { player: any }) => {
  return (
    <mesh position={[player.position.x, player.position.y, player.position.z]} castShadow>
      <capsuleGeometry args={[0.5, 1, 4, 8]} />
      <meshStandardMaterial color="#ef4444" />
    </mesh>
  );
};
