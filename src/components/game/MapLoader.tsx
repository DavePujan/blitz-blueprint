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
      {/* Ambient lighting based on map */}
      <ambientLight intensity={0.4} color={map.ambientColor} />
      <hemisphereLight args={[map.ambientColor, '#000000', 0.6]} />
      
      {/* Fog */}
      <fog attach="fog" args={[map.fogColor, 10, 200]} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[
          map.bounds.maxX - map.bounds.minX,
          map.bounds.maxZ - map.bounds.minZ
        ]} />
        <meshStandardMaterial 
          color="#2a2a2a" 
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Arena boundaries */}
      {/* North wall */}
      <mesh position={[0, 2.5, map.bounds.maxZ]} castShadow receiveShadow>
        <boxGeometry args={[map.bounds.maxX - map.bounds.minX, 5, 1]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* South wall */}
      <mesh position={[0, 2.5, map.bounds.minZ]} castShadow receiveShadow>
        <boxGeometry args={[map.bounds.maxX - map.bounds.minX, 5, 1]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* East wall */}
      <mesh position={[map.bounds.maxX, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 5, map.bounds.maxZ - map.bounds.minZ]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* West wall */}
      <mesh position={[map.bounds.minX, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 5, map.bounds.maxZ - map.bounds.minZ]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

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
