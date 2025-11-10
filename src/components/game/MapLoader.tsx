import { Cover } from './Cover';
import { FlagObject } from './FlagObject';
import { MapType, MAPS } from '@/types/maps';
import * as THREE from 'three';

interface MapLoaderProps {
  mapType: MapType;
  gameMode: string;
}

export const MapLoader = ({ mapType, gameMode }: MapLoaderProps) => {
  const map = MAPS[mapType];
  const isCTF = gameMode === 'capture_flag';

  return (
    <>
      {/* Atmospheric fog */}
      <fog attach="fog" args={['#87ceeb', 50, 250]} />

      {/* Ground plane with grid pattern */}
      <group>
        {/* Main ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
          <planeGeometry args={[
            map.bounds.maxX - map.bounds.minX,
            map.bounds.maxZ - map.bounds.minZ
          ]} />
          <meshStandardMaterial 
            color="#4a5568"
            roughness={0.85}
            metalness={0.05}
          />
        </mesh>

        {/* Grid overlay for tactical feel */}
        <gridHelper 
          args={[
            Math.max(map.bounds.maxX - map.bounds.minX, map.bounds.maxZ - map.bounds.minZ),
            40,
            '#38bdf8',
            '#1e293b'
          ]} 
          position={[0, 0.02, 0]}
        />
      </group>

      {/* Enhanced arena boundaries with tactical styling */}
      {/* North wall */}
      <group position={[0, 2.5, map.bounds.maxZ]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[map.bounds.maxX - map.bounds.minX, 5, 0.5]} />
          <meshStandardMaterial 
            color="#2d3748"
            roughness={0.7}
            metalness={0.3}
            emissive="#38bdf8"
            emissiveIntensity={0.1}
          />
        </mesh>
        {/* Wall highlight */}
        <mesh position={[0, 2, 0.3]}>
          <boxGeometry args={[map.bounds.maxX - map.bounds.minX, 0.1, 0.1]} />
          <meshStandardMaterial 
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>

      {/* South wall */}
      <group position={[0, 2.5, map.bounds.minZ]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[map.bounds.maxX - map.bounds.minX, 5, 0.5]} />
          <meshStandardMaterial 
            color="#2d3748"
            roughness={0.7}
            metalness={0.3}
            emissive="#38bdf8"
            emissiveIntensity={0.1}
          />
        </mesh>
        <mesh position={[0, 2, -0.3]}>
          <boxGeometry args={[map.bounds.maxX - map.bounds.minX, 0.1, 0.1]} />
          <meshStandardMaterial 
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>

      {/* East wall */}
      <group position={[map.bounds.maxX, 2.5, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.5, 5, map.bounds.maxZ - map.bounds.minZ]} />
          <meshStandardMaterial 
            color="#2d3748"
            roughness={0.7}
            metalness={0.3}
            emissive="#38bdf8"
            emissiveIntensity={0.1}
          />
        </mesh>
        <mesh position={[0.3, 2, 0]}>
          <boxGeometry args={[0.1, 0.1, map.bounds.maxZ - map.bounds.minZ]} />
          <meshStandardMaterial 
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>

      {/* West wall */}
      <group position={[map.bounds.minX, 2.5, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.5, 5, map.bounds.maxZ - map.bounds.minZ]} />
          <meshStandardMaterial 
            color="#2d3748"
            roughness={0.7}
            metalness={0.3}
            emissive="#38bdf8"
            emissiveIntensity={0.1}
          />
        </mesh>
        <mesh position={[-0.3, 2, 0]}>
          <boxGeometry args={[0.1, 0.1, map.bounds.maxZ - map.bounds.minZ]} />
          <meshStandardMaterial 
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>

      {/* Cover objects */}
      {map.coverObjects.map((cover, index) => (
        <Cover key={`cover-${index}`} cover={cover} />
      ))}

      {/* Flags for CTF mode */}
      {isCTF && map.flagBases && (
        <>
          <FlagObject
            position={map.flagBases[0].position}
            team="blue"
          />
          <FlagObject
            position={map.flagBases[1].position}
            team="red"
          />
        </>
      )}
    </>
  );
};
