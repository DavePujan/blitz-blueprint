import { useState } from 'react';
import { Sky, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { PlayerController } from './PlayerController';
import { BulletTracer } from './BulletTracer';
import type { Bullet } from '@/types/game';
import { useGameNetworking } from '@/hooks/useGameNetworking';
import { useParams } from 'react-router-dom';

export const GameScene = () => {
  const { roomId } = useParams();
  const [bullets, setBullets] = useState<Bullet[]>([]);
  
  const { players, shootEvents, updatePosition, broadcastShoot } = useGameNetworking(roomId || 'demo');

  const handleShoot = (origin: THREE.Vector3, direction: THREE.Vector3) => {
    const newBullet: Bullet = {
      id: `${Date.now()}_${Math.random()}`,
      origin: origin.clone(),
      direction: direction.clone().normalize(),
    };
    setBullets((prev) => [...prev, newBullet]);
    broadcastShoot(origin, direction);
  };

  const handleBulletComplete = (bulletId: string) => {
    setBullets((prev) => prev.filter((b) => b.id !== bulletId));
  };

  const handlePositionUpdate = (position: THREE.Vector3, rotation: THREE.Euler) => {
    updatePosition(position, rotation);
  };

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />

      {/* Sky */}
      <Sky sunPosition={[100, 20, 100]} />
      
      {/* Environment */}
      <Environment preset="sunset" />

      {/* Player Controller */}
      <PlayerController onShoot={handleShoot} onPositionUpdate={handlePositionUpdate} />

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

      {/* Ground/Arena */}
      <Ground />

      {/* Arena Walls */}
      <ArenaWalls />

      {/* Obstacles */}
      <Obstacles />
    </>
  );
};

const OtherPlayer = ({ player }: { player: any }) => {
  return (
    <mesh position={[player.position.x, player.position.y, player.position.z]} castShadow>
      <capsuleGeometry args={[0.5, 1, 4, 8]} />
      <meshStandardMaterial color="#ef4444" />
    </mesh>
  );
};

const Ground = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial 
        color="#1a1a2e" 
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
};

const ArenaWalls = () => {
  const wallHeight = 5;
  const arenaSize = 50;
  
  return (
    <group>
      {/* North Wall */}
      <mesh position={[0, wallHeight / 2, -arenaSize / 2]} castShadow receiveShadow>
        <boxGeometry args={[arenaSize, wallHeight, 1]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>
      
      {/* South Wall */}
      <mesh position={[0, wallHeight / 2, arenaSize / 2]} castShadow receiveShadow>
        <boxGeometry args={[arenaSize, wallHeight, 1]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>
      
      {/* East Wall */}
      <mesh position={[arenaSize / 2, wallHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, wallHeight, arenaSize]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>
      
      {/* West Wall */}
      <mesh position={[-arenaSize / 2, wallHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, wallHeight, arenaSize]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>
    </group>
  );
};

const Obstacles = () => {
  return (
    <group>
      {/* Center cover */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 2, 4]} />
        <meshStandardMaterial color="#ef4444" roughness={0.6} />
      </mesh>

      {/* Corner covers */}
      <mesh position={[15, 0.75, 15]} castShadow receiveShadow>
        <boxGeometry args={[3, 1.5, 3]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.6} />
      </mesh>

      <mesh position={[-15, 0.75, -15]} castShadow receiveShadow>
        <boxGeometry args={[3, 1.5, 3]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.6} />
      </mesh>

      <mesh position={[15, 0.75, -15]} castShadow receiveShadow>
        <boxGeometry args={[3, 1.5, 3]} />
        <meshStandardMaterial color="#22c55e" roughness={0.6} />
      </mesh>

      <mesh position={[-15, 0.75, 15]} castShadow receiveShadow>
        <boxGeometry args={[3, 1.5, 3]} />
        <meshStandardMaterial color="#22c55e" roughness={0.6} />
      </mesh>

      {/* Cylinders for variety */}
      <mesh position={[8, 1.5, -8]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 3, 16]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.5} />
      </mesh>

      <mesh position={[-8, 1.5, 8]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 3, 16]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.5} />
      </mesh>
    </group>
  );
};
