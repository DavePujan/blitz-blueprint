import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls, Sky, Environment } from '@react-three/drei';
import * as THREE from 'three';

export const GameScene = () => {
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

      {/* Player */}
      <Player />

      {/* Ground/Arena */}
      <Ground />

      {/* Arena Walls */}
      <ArenaWalls />

      {/* Obstacles */}
      <Obstacles />
    </>
  );
};

const Player = () => {
  const playerRef = useRef<THREE.Mesh>(null);
  const [, get] = useKeyboardControls();
  const { camera } = useThree();
  
  // Player state
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const [playerPosition] = useState(new THREE.Vector3(0, 1, 0));

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    const { forward, backward, left, right, sprint } = get();
    
    // Calculate movement direction
    direction.current.set(0, 0, 0);
    
    if (forward) direction.current.z -= 1;
    if (backward) direction.current.z += 1;
    if (left) direction.current.x -= 1;
    if (right) direction.current.x += 1;

    // Normalize and apply speed
    const speed = sprint ? 15 : 8;
    direction.current.normalize().multiplyScalar(speed * delta);

    // Apply camera rotation to movement
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));

    const moveDirection = new THREE.Vector3();
    moveDirection.addScaledVector(cameraDirection, -direction.current.z);
    moveDirection.addScaledVector(cameraRight, direction.current.x);

    // Update player position
    playerPosition.add(moveDirection);
    
    // Keep player within bounds
    playerPosition.x = Math.max(-45, Math.min(45, playerPosition.x));
    playerPosition.z = Math.max(-45, Math.min(45, playerPosition.z));

    playerRef.current.position.copy(playerPosition);

    // Update camera to follow player
    const cameraOffset = new THREE.Vector3(0, 2, 5);
    const cameraRotation = new THREE.Euler(0, 0, 0);
    camera.rotation.copy(cameraRotation);
    
    const idealPosition = playerPosition.clone().add(
      cameraOffset.applyQuaternion(camera.quaternion)
    );
    
    camera.position.lerp(idealPosition, 0.1);
    camera.lookAt(playerPosition.x, playerPosition.y + 1.5, playerPosition.z);
  });

  // Mouse look controls
  useFrame(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement) {
        camera.rotation.y -= event.movementX * 0.002;
        camera.rotation.x -= event.movementY * 0.002;
        camera.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, camera.rotation.x));
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  });

  return (
    <mesh ref={playerRef} position={[0, 1, 0]} castShadow>
      <capsuleGeometry args={[0.5, 1, 4, 8]} />
      <meshStandardMaterial color="#3b82f6" />
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
