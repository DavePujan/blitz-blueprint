import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BulletTracerProps {
  origin: THREE.Vector3;
  direction: THREE.Vector3;
  onComplete: () => void;
}

export const BulletTracer = ({ origin, direction, onComplete }: BulletTracerProps) => {
  const lineRef = useRef<THREE.Line>(null);
  const progress = useRef(0);
  const startPoint = useRef(origin.clone());
  const endPoint = useRef(origin.clone().add(direction.multiplyScalar(50)));

  useFrame((state, delta) => {
    if (!lineRef.current) return;

    progress.current += delta * 8; // Speed of tracer animation

    if (progress.current >= 1) {
      onComplete();
      return;
    }

    // Update line positions
    const currentEnd = new THREE.Vector3().lerpVectors(startPoint.current, endPoint.current, progress.current);
    const positions = lineRef.current.geometry.attributes.position.array as Float32Array;
    positions[3] = currentEnd.x;
    positions[4] = currentEnd.y;
    positions[5] = currentEnd.z;
    lineRef.current.geometry.attributes.position.needsUpdate = true;

    // Fade out
    if (lineRef.current.material instanceof THREE.LineBasicMaterial) {
      lineRef.current.material.opacity = 1 - progress.current;
    }
  });

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array([
    origin.x, origin.y, origin.z,
    origin.x, origin.y, origin.z
  ]);
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  return (
    <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: '#fbbf24', linewidth: 2, transparent: true, opacity: 1 }))} ref={lineRef} />
  );
};
