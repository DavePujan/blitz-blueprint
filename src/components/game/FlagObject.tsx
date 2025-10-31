import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FlagObjectProps {
  position: THREE.Vector3;
  team: 'blue' | 'red';
  captured?: boolean;
}

export const FlagObject = ({ position, team, captured = false }: FlagObjectProps) => {
  const flagRef = useRef<THREE.Group>(null);
  const time = useRef(0);

  useFrame((state, delta) => {
    if (!flagRef.current) return;
    
    time.current += delta;
    
    // Wave animation
    flagRef.current.rotation.y = Math.sin(time.current * 2) * 0.1;
    
    // Bob animation
    if (!captured) {
      flagRef.current.position.y = position.y + Math.sin(time.current * 3) * 0.1;
    }
  });

  const flagColor = team === 'blue' ? '#3b82f6' : '#ef4444';
  const poleColor = '#8b7355';

  return (
    <group ref={flagRef} position={[position.x, position.y, position.z]}>
      {/* Flag pole */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
        <meshStandardMaterial color={poleColor} />
      </mesh>

      {/* Flag */}
      <mesh position={[0.5, 3.5, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[1, 0.7]} />
        <meshStandardMaterial 
          color={flagColor}
          side={THREE.DoubleSide}
          emissive={flagColor}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Base */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.2, 16]} />
        <meshStandardMaterial color={flagColor} />
      </mesh>

      {/* Glow effect when not captured */}
      {!captured && (
        <pointLight
          position={[0, 2, 0]}
          color={flagColor}
          intensity={1}
          distance={5}
        />
      )}
    </group>
  );
};
