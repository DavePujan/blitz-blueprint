import { useRef } from 'react';
import * as THREE from 'three';
import { CoverObject } from '@/types/maps';

interface CoverProps {
  cover: CoverObject;
}

export const Cover = ({ cover }: CoverProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const renderCover = () => {
    switch (cover.type) {
      case 'box':
        return (
          <group position={[cover.position.x, cover.height / 2, cover.position.z]}>
            {/* Main box */}
            <mesh
              ref={meshRef}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[cover.size.x, cover.height, cover.size.z]} />
              <meshStandardMaterial 
                color="#5a6c7d" 
                roughness={0.7}
                metalness={0.4}
                emissive="#1e3a5f"
                emissiveIntensity={0.05}
              />
            </mesh>
            {/* Tactical highlights on edges */}
            <mesh position={[0, cover.height / 2 - 0.05, 0]}>
              <boxGeometry args={[cover.size.x * 1.02, 0.05, cover.size.z * 1.02]} />
              <meshStandardMaterial 
                color="#38bdf8"
                emissive="#38bdf8"
                emissiveIntensity={0.3}
              />
            </mesh>
          </group>
        );

      case 'cylinder':
        return (
          <group position={[cover.position.x, cover.height / 2, cover.position.z]}>
            {/* Main cylinder */}
            <mesh
              ref={meshRef}
              castShadow
              receiveShadow
            >
              <cylinderGeometry args={[cover.size.x / 2, cover.size.x / 2, cover.height, 16]} />
              <meshStandardMaterial 
                color="#4b5563" 
                roughness={0.8}
                metalness={0.3}
                emissive="#1e40af"
                emissiveIntensity={0.05}
              />
            </mesh>
            {/* Top ring highlight */}
            <mesh position={[0, cover.height / 2, 0]}>
              <torusGeometry args={[cover.size.x / 2, 0.05, 8, 16]} />
              <meshStandardMaterial 
                color="#38bdf8"
                emissive="#38bdf8"
                emissiveIntensity={0.4}
              />
            </mesh>
          </group>
        );

      case 'wall':
        return (
          <group position={[cover.position.x, cover.height / 2, cover.position.z]}>
            {/* Main wall */}
            <mesh
              ref={meshRef}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[cover.size.x, cover.height, cover.size.z]} />
              <meshStandardMaterial 
                color="#6b7280" 
                roughness={0.75}
                metalness={0.35}
                emissive="#374151"
                emissiveIntensity={0.1}
              />
            </mesh>
            {/* Vertical accent lines */}
            {[...Array(Math.floor(cover.size.x / 2))].map((_, i) => (
              <mesh 
                key={i}
                position={[
                  -cover.size.x / 2 + (i + 0.5) * 2,
                  0,
                  cover.size.z / 2 + 0.05
                ]}
              >
                <boxGeometry args={[0.1, cover.height * 0.9, 0.05]} />
                <meshStandardMaterial 
                  color="#38bdf8"
                  emissive="#38bdf8"
                  emissiveIntensity={0.2}
                />
              </mesh>
            ))}
          </group>
        );

      default:
        return null;
    }
  };

  return <>{renderCover()}</>;
};
