import { useState, useCallback } from 'react';

const MAX_HEALTH = 100;
const RESPAWN_DELAY = 3000; // 3 seconds

export const usePlayerHealth = () => {
  const [health, setHealth] = useState(MAX_HEALTH);
  const [isDead, setIsDead] = useState(false);
  const [isRespawning, setIsRespawning] = useState(false);

  const takeDamage = useCallback((damage: number) => {
    setHealth((prev) => {
      const newHealth = Math.max(0, prev - damage);
      
      if (newHealth === 0 && !isDead) {
        setIsDead(true);
        // Auto-respawn after delay
        setTimeout(() => {
          respawn();
        }, RESPAWN_DELAY);
      }
      
      return newHealth;
    });
  }, [isDead]);

  const heal = useCallback((amount: number) => {
    setHealth((prev) => Math.min(MAX_HEALTH, prev + amount));
  }, []);

  const respawn = useCallback(() => {
    setIsRespawning(true);
    setTimeout(() => {
      setHealth(MAX_HEALTH);
      setIsDead(false);
      setIsRespawning(false);
    }, 500);
  }, []);

  const getHealthPercentage = useCallback(() => {
    return (health / MAX_HEALTH) * 100;
  }, [health]);

  return {
    health,
    maxHealth: MAX_HEALTH,
    isDead,
    isRespawning,
    takeDamage,
    heal,
    respawn,
    getHealthPercentage,
  };
};
