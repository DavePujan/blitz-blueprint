import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { useWeaponSystem } from '@/hooks/useWeaponSystem';
import { usePlayerHealth } from '@/hooks/usePlayerHealth';
import type { WeaponType } from '@/types/weapons';

interface PlayerControllerProps {
  onShoot: (origin: THREE.Vector3, direction: THREE.Vector3, weaponType: WeaponType) => void;
  onPositionUpdate: (position: THREE.Vector3, rotation: THREE.Euler) => void;
  onHealthUpdate: (health: number, maxHealth: number) => void;
  onWeaponUpdate: (currentAmmo: number, reserveAmmo: number, weaponName: string, isReloading: boolean) => void;
}

export const PlayerController = ({ onShoot, onPositionUpdate, onHealthUpdate, onWeaponUpdate }: PlayerControllerProps) => {
  const playerRef = useRef<THREE.Mesh>(null);
  const [, get] = useKeyboardControls();
  const { camera } = useThree();
  
  const velocity = useRef(new THREE.Vector3());
  const [playerPosition] = useState(new THREE.Vector3(0, 1, 0));
  const [rotation] = useState(new THREE.Euler(0, 0, 0));
  
  // Weapon and health systems
  const { weaponState, currentWeaponStats, canShoot, shoot, reload, switchWeapon } = useWeaponSystem();
  const { health, maxHealth, isDead, takeDamage } = usePlayerHealth();
  
  // Mouse look state
  const mouseRotation = useRef({ yaw: 0, pitch: 0 });
  const isPointerLocked = useRef(false);

  useEffect(() => {
    const canvas = document.querySelector('canvas');
    
    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === canvas;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isPointerLocked.current) return;

      const sensitivity = 0.002;
      mouseRotation.current.yaw -= event.movementX * sensitivity;
      mouseRotation.current.pitch -= event.movementY * sensitivity;
      mouseRotation.current.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, mouseRotation.current.pitch));
    };

    const handleClick = (event: MouseEvent) => {
      if (isPointerLocked.current && !isDead) {
        // Shoot
        if (canShoot() && shoot()) {
          const direction = new THREE.Vector3(0, 0, -1);
          direction.applyQuaternion(camera.quaternion);
          onShoot(playerPosition.clone().add(new THREE.Vector3(0, 1.5, 0)), direction, weaponState.currentWeapon);
        }
      } else if (canvas) {
        canvas.requestPointerLock();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isPointerLocked.current || isDead) return;
      
      // Reload
      if (event.key === 'r' || event.key === 'R') {
        reload();
      }
      
      // Weapon switching
      const weaponKeys: Record<string, WeaponType> = {
        '1': 'assault_rifle',
        '2': 'sniper',
        '3': 'shotgun',
        '4': 'pistol',
        '5': 'smg',
      };
      
      if (weaponKeys[event.key]) {
        switchWeapon(weaponKeys[event.key]);
      }
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [camera, onShoot, playerPosition, canShoot, shoot, reload, switchWeapon, weaponState, isDead]);

  // Update HUD with health and weapon info
  useEffect(() => {
    onHealthUpdate(health, maxHealth);
    onWeaponUpdate(
      weaponState.currentAmmo,
      weaponState.reserveAmmo,
      currentWeaponStats.name,
      weaponState.isReloading
    );
  }, [health, maxHealth, weaponState, currentWeaponStats, onHealthUpdate, onWeaponUpdate]);

  useFrame((state, delta) => {
    if (!playerRef.current || isDead) return;

    const { forward, backward, left, right, sprint } = get();
    
    // Calculate movement direction
    const direction = new THREE.Vector3();
    
    if (forward) direction.z -= 1;
    if (backward) direction.z += 1;
    if (left) direction.x -= 1;
    if (right) direction.x += 1;

    // Apply speed
    const speed = sprint ? 15 : 8;
    direction.normalize().multiplyScalar(speed * delta);

    // Apply camera rotation to movement
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));

    const moveDirection = new THREE.Vector3();
    moveDirection.addScaledVector(cameraDirection, -direction.z);
    moveDirection.addScaledVector(cameraRight, direction.x);

    // Update player position
    playerPosition.add(moveDirection);
    
    // Keep player within arena bounds
    playerPosition.x = Math.max(-45, Math.min(45, playerPosition.x));
    playerPosition.z = Math.max(-45, Math.min(45, playerPosition.z));

    playerRef.current.position.copy(playerPosition);

    // Update camera rotation based on mouse
    rotation.set(mouseRotation.current.pitch, mouseRotation.current.yaw, 0);

    // Camera follows player with offset
    const cameraOffset = new THREE.Vector3(0, 2, 5);
    const rotatedOffset = cameraOffset.applyEuler(new THREE.Euler(0, mouseRotation.current.yaw, 0));
    
    const idealPosition = playerPosition.clone().add(rotatedOffset);
    camera.position.lerp(idealPosition, 0.1);
    
    // Camera looks at player position with pitch
    const lookAtPosition = playerPosition.clone().add(new THREE.Vector3(0, 1.5, 0));
    const pitchOffset = new THREE.Vector3(0, Math.tan(mouseRotation.current.pitch) * 5, -5);
    pitchOffset.applyEuler(new THREE.Euler(0, mouseRotation.current.yaw, 0));
    lookAtPosition.add(pitchOffset);
    
    camera.lookAt(lookAtPosition);

    // Send position update for networking
    onPositionUpdate(playerPosition, rotation);
  });

  return (
    <mesh ref={playerRef} position={[0, 1, 0]} castShadow>
      <capsuleGeometry args={[0.5, 1, 4, 8]} />
      <meshStandardMaterial color="#3b82f6" />
    </mesh>
  );
};
