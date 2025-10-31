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
          <mesh
            ref={meshRef}
            position={[cover.position.x, cover.height / 2, cover.position.z]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[cover.size.x, cover.height, cover.size.z]} />
            <meshStandardMaterial 
              color="#4a4a4a" 
              roughness={0.8}
              metalness={0.2}
            />
          </mesh>
        );

      case 'cylinder':
        return (
          <mesh
            ref={meshRef}
            position={[cover.position.x, cover.height / 2, cover.position.z]}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[cover.size.x / 2, cover.size.x / 2, cover.height, 16]} />
            <meshStandardMaterial 
              color="#3a3a3a" 
              roughness={0.9}
              metalness={0.1}
            />
          </mesh>
        );

      case 'wall':
        return (
          <mesh
            ref={meshRef}
            position={[cover.position.x, cover.height / 2, cover.position.z]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[cover.size.x, cover.height, cover.size.z]} />
            <meshStandardMaterial 
              color="#5a4a3a" 
              roughness={0.85}
              metalness={0.15}
            />
          </mesh>
        );

      default:
        return null;
    }
  };

  return <>{renderCover()}</>;
};
