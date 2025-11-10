import { useState } from 'react';
import { Sky, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { PlayerController } from './PlayerController';
import { BulletTracer } from './BulletTracer';
import { MapLoader } from './MapLoader';
import { AtmosphericParticles, FloatingDebris } from './AtmosphericParticles';
import { DynamicLights } from './DynamicLights';
import { LightShafts } from './VolumetricLight';
import type { Bullet } from '@/types/game';
import type { WeaponType } from '@/types/weapons';
import { useGameNetworking } from '@/hooks/useGameNetworking';
import { useParams } from 'react-router-dom';
import { GameModeType } from '@/types/gameMode';
import { MapType, MAPS } from '@/types/maps';

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

  const mapBounds = MAPS[mapType]?.bounds || { minX: -50, maxX: 50, minZ: -50, maxZ: 50 };

  return (
    <>
      {/* Enhanced Sky and Environment */}
      <Sky 
        sunPosition={[100, 10, 100]} 
        turbidity={8}
        rayleigh={6}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
        inclination={0.3}
        azimuth={0.25}
      />
      <Environment preset="city" background={false} />
      
      {/* Ambient lighting for overall scene illumination */}
      <ambientLight intensity={0.3} color="#b0c4de" />
      
      {/* Main directional light (sun) */}
      <directionalLight
        position={[50, 50, 50]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-camera-near={0.1}
        shadow-camera-far={200}
        shadow-bias={-0.0001}
        color="#fef3c7"
      />
      
      {/* Fill lights for better visibility */}
      <pointLight position={[-20, 15, -20]} intensity={0.8} color="#60a5fa" distance={60} />
      <pointLight position={[20, 15, 20]} intensity={0.8} color="#fbbf24" distance={60} />
      
      {/* Hemisphere light for natural ambient lighting */}
      <hemisphereLight 
        args={['#87ceeb', '#6b7280', 0.5]} 
        position={[0, 50, 0]}
      />

      {/* Map with cover, flags, and boundaries */}
      <MapLoader mapType={mapType} gameMode={gameMode} />

      {/* Atmospheric Effects */}
      <AtmosphericParticles count={250} bounds={mapBounds} />
      <FloatingDebris count={20} />
      <LightShafts />

      {/* Dynamic Lighting */}
      <DynamicLights mapBounds={mapBounds} />

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
