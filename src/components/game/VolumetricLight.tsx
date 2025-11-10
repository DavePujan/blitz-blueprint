import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VolumetricLightProps {
  position?: [number, number, number];
  direction?: [number, number, number];
  color?: string;
  opacity?: number;
  length?: number;
  radius?: number;
}

export const VolumetricLight = ({
  position = [0, 15, 0],
  direction = [0, -1, 0],
  color = '#38bdf8',
  opacity = 0.15,
  length = 20,
  radius = 2
}: VolumetricLightProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Subtle pulsing effect
    const pulse = Math.sin(time * 0.5) * 0.1 + 0.9;
    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = opacity * pulse;
    
    // Very subtle rotation
    meshRef.current.rotation.y += 0.001;
  });
  
  return (
    <group position={position}>
      {/* Main light shaft */}
      <mesh
        ref={meshRef}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[radius, radius * 1.5, length, 32, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Inner glow */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius * 0.5, radius * 0.8, length, 32, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity * 2}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Light source at top */}
      <pointLight
        position={[0, 0, 0]}
        color={color}
        intensity={2}
        distance={30}
        decay={2}
      />
    </group>
  );
};

// Multiple light shafts component
export const LightShafts = () => {
  return (
    <group>
      <VolumetricLight
        position={[-15, 18, -15]}
        color="#38bdf8"
        opacity={0.12}
        length={18}
        radius={1.5}
      />
      <VolumetricLight
        position={[15, 18, -15]}
        color="#fbbf24"
        opacity={0.1}
        length={18}
        radius={1.8}
      />
      <VolumetricLight
        position={[-15, 18, 15]}
        color="#f472b6"
        opacity={0.1}
        length={18}
        radius={1.6}
      />
      <VolumetricLight
        position={[15, 18, 15]}
        color="#a78bfa"
        opacity={0.11}
        length={18}
        radius={1.7}
      />
      
      {/* Central dramatic shaft */}
      <VolumetricLight
        position={[0, 20, 0]}
        color="#60a5fa"
        opacity={0.08}
        length={20}
        radius={3}
      />
    </group>
  );
};
