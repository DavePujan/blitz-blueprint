import { GameWorld } from "@/components/game/GameWorld";
import { GameHUD } from "@/components/game/GameHUD";

const GameDemo = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 3D Game World */}
      <GameWorld />
      
      {/* HUD Overlay */}
      <GameHUD />
    </div>
  );
};

export default GameDemo;
