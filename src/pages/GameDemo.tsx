import { useState } from "react";
import { GameWorld } from "@/components/game/GameWorld";
import { GameHUD } from "@/components/game/GameHUD";
import { WEAPONS } from "@/types/weapons";

const GameDemo = () => {
  const [playerHealth, setPlayerHealth] = useState({ health: 100, maxHealth: 100 });
  const [weaponInfo, setWeaponInfo] = useState({
    currentAmmo: 30,
    reserveAmmo: 90,
    weaponName: 'M4A1 Assault Rifle',
    isReloading: false,
  });

  // Find the current weapon stats based on the weapon name
  const currentWeaponStats = Object.values(WEAPONS).find(w => w.name === weaponInfo.weaponName) || WEAPONS.assault_rifle;

  const handleHealthUpdate = (health: number, maxHealth: number) => {
    setPlayerHealth({ health, maxHealth });
  };

  const handleWeaponUpdate = (currentAmmo: number, reserveAmmo: number, weaponName: string, isReloading: boolean) => {
    setWeaponInfo({ currentAmmo, reserveAmmo, weaponName, isReloading });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 3D Game World */}
      <GameWorld 
        onHealthUpdate={handleHealthUpdate}
        onWeaponUpdate={handleWeaponUpdate}
      />
      
      {/* HUD Overlay */}
      <GameHUD 
        health={playerHealth.health}
        maxHealth={playerHealth.maxHealth}
        currentAmmo={weaponInfo.currentAmmo}
        reserveAmmo={weaponInfo.reserveAmmo}
        weaponStats={currentWeaponStats}
        isReloading={weaponInfo.isReloading}
      />
    </div>
  );
};

export default GameDemo;
