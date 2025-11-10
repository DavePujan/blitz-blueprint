import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AtmosphericParticlesProps {
  count?: number;
  bounds?: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
}

export const AtmosphericParticles = ({ 
  count = 200,
  bounds = { minX: -50, maxX: 50, minZ: -50, maxZ: 50 }
}: AtmosphericParticlesProps) => {
  const particlesRef = useRef<THREE.Points>(null);
  
  // Generate random particle positions and properties
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const opacities = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Random position within bounds
      positions[i * 3] = THREE.MathUtils.randFloat(bounds.minX, bounds.maxX);
      positions[i * 3 + 1] = THREE.MathUtils.randFloat(0, 20);
      positions[i * 3 + 2] = THREE.MathUtils.randFloat(bounds.minZ, bounds.maxZ);
      
      // Random drift velocities
      velocities[i * 3] = THREE.MathUtils.randFloat(-0.02, 0.02);
      velocities[i * 3 + 1] = THREE.MathUtils.randFloat(0.01, 0.05);
      velocities[i * 3 + 2] = THREE.MathUtils.randFloat(-0.02, 0.02);
      
      // Random sizes and opacities
      sizes[i] = THREE.MathUtils.randFloat(0.05, 0.2);
      opacities[i] = THREE.MathUtils.randFloat(0.1, 0.4);
    }
    
    return { positions, velocities, sizes, opacities };
  }, [count, bounds]);
  
  // Animate particles
  useFrame((state, delta) => {
    if (!particlesRef.current) return;
    
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      // Update position with velocity
      positions[i * 3] += particles.velocities[i * 3];
      positions[i * 3 + 1] += particles.velocities[i * 3 + 1];
      positions[i * 3 + 2] += particles.velocities[i * 3 + 2];
      
      // Reset particles that go out of bounds
      if (positions[i * 3 + 1] > 20) {
        positions[i * 3 + 1] = 0;
      }
      if (positions[i * 3] < bounds.minX || positions[i * 3] > bounds.maxX) {
        positions[i * 3] = THREE.MathUtils.randFloat(bounds.minX, bounds.maxX);
      }
      if (positions[i * 3 + 2] < bounds.minZ || positions[i * 3 + 2] > bounds.maxZ) {
        positions[i * 3 + 2] = THREE.MathUtils.randFloat(bounds.minZ, bounds.maxZ);
      }
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Slowly rotate the entire particle system for extra movement
    particlesRef.current.rotation.y += delta * 0.01;
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={particles.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#b0c4de"
        transparent
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Floating debris component
export const FloatingDebris = ({ count = 15 }: { count?: number }) => {
  const debrisRefs = useRef<THREE.Mesh[]>([]);
  
  const debris = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      position: new THREE.Vector3(
        THREE.MathUtils.randFloat(-40, 40),
        THREE.MathUtils.randFloat(2, 15),
        THREE.MathUtils.randFloat(-40, 40)
      ),
      rotation: new THREE.Euler(
        THREE.MathUtils.randFloat(0, Math.PI * 2),
        THREE.MathUtils.randFloat(0, Math.PI * 2),
        THREE.MathUtils.randFloat(0, Math.PI * 2)
      ),
      scale: THREE.MathUtils.randFloat(0.1, 0.3),
      velocity: {
        x: THREE.MathUtils.randFloat(-0.01, 0.01),
        y: THREE.MathUtils.randFloat(-0.02, 0.02),
        z: THREE.MathUtils.randFloat(-0.01, 0.01)
      },
      rotationSpeed: {
        x: THREE.MathUtils.randFloat(-0.02, 0.02),
        y: THREE.MathUtils.randFloat(-0.02, 0.02),
        z: THREE.MathUtils.randFloat(-0.02, 0.02)
      }
    }));
  }, [count]);
  
  useFrame(() => {
    debrisRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      
      const debrisData = debris[i];
      
      // Update position
      mesh.position.x += debrisData.velocity.x;
      mesh.position.y += debrisData.velocity.y;
      mesh.position.z += debrisData.velocity.z;
      
      // Update rotation
      mesh.rotation.x += debrisData.rotationSpeed.x;
      mesh.rotation.y += debrisData.rotationSpeed.y;
      mesh.rotation.z += debrisData.rotationSpeed.z;
      
      // Reset if out of bounds
      if (mesh.position.y > 20 || mesh.position.y < 0) {
        mesh.position.y = THREE.MathUtils.randFloat(2, 15);
      }
      if (Math.abs(mesh.position.x) > 50) {
        mesh.position.x = THREE.MathUtils.randFloat(-40, 40);
      }
      if (Math.abs(mesh.position.z) > 50) {
        mesh.position.z = THREE.MathUtils.randFloat(-40, 40);
      }
    });
  });
  
  return (
    <group>
      {debris.map((item, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) debrisRefs.current[i] = el;
          }}
          position={item.position}
          rotation={item.rotation}
          scale={item.scale}
          castShadow
        >
          <boxGeometry args={[1, 0.1, 1]} />
          <meshStandardMaterial
            color="#4a5568"
            roughness={0.9}
            metalness={0.1}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
};
