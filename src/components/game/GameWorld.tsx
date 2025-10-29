import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import { GameScene } from './GameScene';

interface GameWorldProps {
  onHealthUpdate?: (health: number, maxHealth: number) => void;
  onWeaponUpdate?: (currentAmmo: number, reserveAmmo: number, weaponName: string, isReloading: boolean) => void;
}

export const GameWorld = ({ onHealthUpdate, onWeaponUpdate }: GameWorldProps) => {
  // Define keyboard controls mapping
  const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'right', keys: ['ArrowRight', 'KeyD'] },
    { name: 'jump', keys: ['Space'] },
    { name: 'sprint', keys: ['ShiftLeft'] },
  ];

  return (
    <div className="absolute inset-0">
      <KeyboardControls map={keyboardMap}>
        <Canvas
          shadows
          camera={{ position: [0, 5, 10], fov: 75 }}
          className="bg-background"
        >
          <GameScene 
            onHealthUpdate={onHealthUpdate}
            onWeaponUpdate={onWeaponUpdate}
          />
        </Canvas>
      </KeyboardControls>
    </div>
  );
};
