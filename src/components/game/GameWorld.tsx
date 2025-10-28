import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import { GameScene } from './GameScene';

export const GameWorld = () => {
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
          <GameScene />
        </Canvas>
      </KeyboardControls>
    </div>
  );
};
