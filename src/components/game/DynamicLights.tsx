import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DynamicLightsProps {
  mapBounds?: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
}

export const DynamicLights = ({ 
  mapBounds = { minX: -50, maxX: 50, minZ: -50, maxZ: 50 }
}: DynamicLightsProps) => {
  return (
    <>
      <FlickeringOverheadLights mapBounds={mapBounds} />
      <SpotlightBeams mapBounds={mapBounds} />
      <AreaLightingZones />
    </>
  );
};

// Flickering overhead lights component
const FlickeringOverheadLights = ({ mapBounds }: DynamicLightsProps) => {
  const lightsRef = useRef<THREE.PointLight[]>([]);
  
  const lights = useMemo(() => {
    const count = 8;
    return Array.from({ length: count }, (_, i) => ({
      position: new THREE.Vector3(
        THREE.MathUtils.randFloat(mapBounds.minX + 10, mapBounds.maxX - 10),
        12,
        THREE.MathUtils.randFloat(mapBounds.minZ + 10, mapBounds.maxZ - 10)
      ),
      baseIntensity: THREE.MathUtils.randFloat(1.5, 2.5),
      flickerSpeed: THREE.MathUtils.randFloat(0.5, 2),
      color: new THREE.Color().setHSL(0.55, 0.2, 0.8) // Cool white
    }));
  }, [mapBounds]);
  
  useFrame((state) => {
    lightsRef.current.forEach((light, i) => {
      if (!light) return;
      
      const lightData = lights[i];
      const time = state.clock.elapsedTime;
      
      // Create flickering effect with noise
      const flicker = Math.sin(time * lightData.flickerSpeed * 10) * 0.1 +
                     Math.sin(time * lightData.flickerSpeed * 3) * 0.05 +
                     Math.random() * 0.05;
      
      light.intensity = lightData.baseIntensity + flicker;
    });
  });
  
  return (
    <group>
      {lights.map((lightData, i) => (
        <group key={i} position={lightData.position}>
          {/* Point light */}
          <pointLight
            ref={(el) => {
              if (el) lightsRef.current[i] = el;
            }}
            color={lightData.color}
            intensity={lightData.baseIntensity}
            distance={25}
            decay={2}
          />
          
          {/* Visual bulb */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color={lightData.color}
              emissive={lightData.color}
              emissiveIntensity={2}
              toneMapped={false}
            />
          </mesh>
          
          {/* Light fixture */}
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.4, 0.2, 0.3, 16]} />
            <meshStandardMaterial
              color="#1a1a1a"
              roughness={0.8}
              metalness={0.6}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Spotlight beams component
const SpotlightBeams = ({ mapBounds }: DynamicLightsProps) => {
  const spotlightsRef = useRef<THREE.SpotLight[]>([]);
  
  const spotlights = useMemo(() => {
    return [
      {
        position: new THREE.Vector3(mapBounds.minX + 10, 15, mapBounds.minZ + 10),
        target: new THREE.Vector3(mapBounds.minX + 10, 0, mapBounds.maxZ - 10),
        color: '#38bdf8',
        angle: Math.PI / 6
      },
      {
        position: new THREE.Vector3(mapBounds.maxX - 10, 15, mapBounds.minZ + 10),
        target: new THREE.Vector3(mapBounds.maxX - 10, 0, mapBounds.maxZ - 10),
        color: '#f472b6',
        angle: Math.PI / 6
      },
      {
        position: new THREE.Vector3(0, 18, mapBounds.minZ + 5),
        target: new THREE.Vector3(0, 0, 0),
        color: '#fbbf24',
        angle: Math.PI / 4
      },
      {
        position: new THREE.Vector3(0, 18, mapBounds.maxZ - 5),
        target: new THREE.Vector3(0, 0, 0),
        color: '#a78bfa',
        angle: Math.PI / 4
      }
    ];
  }, [mapBounds]);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    spotlightsRef.current.forEach((spotlight, i) => {
      if (!spotlight) return;
      
      // Gentle intensity pulsing
      const pulse = Math.sin(time * 0.5 + i) * 0.3 + 1;
      spotlight.intensity = 3 * pulse;
      
      // Slow rotation for some spotlights
      if (i < 2) {
        const rotationAngle = Math.sin(time * 0.2) * 0.3;
        spotlight.angle = spotlights[i].angle + rotationAngle * 0.1;
      }
    });
  });
  
  return (
    <group>
      {spotlights.map((spotlight, i) => (
        <group key={i}>
          <spotLight
            ref={(el) => {
              if (el) spotlightsRef.current[i] = el;
            }}
            position={spotlight.position}
            target-position={spotlight.target}
            color={spotlight.color}
            intensity={3}
            angle={spotlight.angle}
            penumbra={0.5}
            distance={60}
            decay={2}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          
          {/* Volumetric cone visualization */}
          <mesh
            position={spotlight.position}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <coneGeometry args={[Math.tan(spotlight.angle) * 20, 20, 32, 1, true]} />
            <meshBasicMaterial
              color={spotlight.color}
              transparent
              opacity={0.05}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Area lighting zones for dramatic effect
const AreaLightingZones = () => {
  const rectLightsRef = useRef<THREE.RectAreaLight[]>([]);
  
  const zones = useMemo(() => {
    return [
      {
        position: new THREE.Vector3(0, 8, 0),
        rotation: new THREE.Euler(-Math.PI / 2, 0, 0),
        width: 30,
        height: 30,
        color: '#38bdf8',
        intensity: 2
      },
      {
        position: new THREE.Vector3(-20, 5, 0),
        rotation: new THREE.Euler(0, Math.PI / 2, 0),
        width: 20,
        height: 8,
        color: '#f472b6',
        intensity: 1.5
      },
      {
        position: new THREE.Vector3(20, 5, 0),
        rotation: new THREE.Euler(0, -Math.PI / 2, 0),
        width: 20,
        height: 8,
        color: '#fbbf24',
        intensity: 1.5
      }
    ];
  }, []);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    rectLightsRef.current.forEach((light, i) => {
      if (!light) return;
      
      const zone = zones[i];
      // Slow pulsing effect
      const pulse = Math.sin(time * 0.3 + i * 2) * 0.3 + 1;
      light.intensity = zone.intensity * pulse;
    });
  });
  
  return (
    <group>
      {zones.map((zone, i) => (
        <rectAreaLight
          key={i}
          ref={(el) => {
            if (el) rectLightsRef.current[i] = el;
          }}
          position={zone.position}
          rotation={zone.rotation}
          width={zone.width}
          height={zone.height}
          color={zone.color}
          intensity={zone.intensity}
        />
      ))}
    </group>
  );
};
