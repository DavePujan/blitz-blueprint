import { useState, useCallback, useRef } from 'react';
import { WEAPONS, type WeaponType, type PlayerWeaponState } from '@/types/weapons';

export const useWeaponSystem = (initialWeapon: WeaponType = 'assault_rifle') => {
  const [weaponState, setWeaponState] = useState<PlayerWeaponState>({
    currentWeapon: initialWeapon,
    currentAmmo: WEAPONS[initialWeapon].magazineSize,
    reserveAmmo: WEAPONS[initialWeapon].magazineSize * 3,
    isReloading: false,
    lastShotTime: 0,
  });

  const reloadTimeoutRef = useRef<NodeJS.Timeout>();

  const canShoot = useCallback(() => {
    const weapon = WEAPONS[weaponState.currentWeapon];
    const timeSinceLastShot = Date.now() - weaponState.lastShotTime;
    const minTimeBetweenShots = (60 / weapon.fireRate) * 1000;

    return (
      weaponState.currentAmmo > 0 &&
      !weaponState.isReloading &&
      timeSinceLastShot >= minTimeBetweenShots
    );
  }, [weaponState]);

  const shoot = useCallback(() => {
    if (!canShoot()) return false;

    setWeaponState((prev) => ({
      ...prev,
      currentAmmo: prev.currentAmmo - 1,
      lastShotTime: Date.now(),
    }));

    return true;
  }, [canShoot]);

  const reload = useCallback(() => {
    if (weaponState.isReloading || weaponState.reserveAmmo === 0) return;

    const weapon = WEAPONS[weaponState.currentWeapon];
    const ammoNeeded = weapon.magazineSize - weaponState.currentAmmo;
    
    if (ammoNeeded === 0) return;

    setWeaponState((prev) => ({ ...prev, isReloading: true }));

    if (reloadTimeoutRef.current) {
      clearTimeout(reloadTimeoutRef.current);
    }

    reloadTimeoutRef.current = setTimeout(() => {
      setWeaponState((prev) => {
        const weapon = WEAPONS[prev.currentWeapon];
        const ammoToReload = Math.min(
          weapon.magazineSize - prev.currentAmmo,
          prev.reserveAmmo
        );

        return {
          ...prev,
          currentAmmo: prev.currentAmmo + ammoToReload,
          reserveAmmo: prev.reserveAmmo - ammoToReload,
          isReloading: false,
        };
      });
    }, weapon.reloadTime * 1000);
  }, [weaponState]);

  const switchWeapon = useCallback((newWeapon: WeaponType) => {
    if (weaponState.isReloading) return;

    setWeaponState({
      currentWeapon: newWeapon,
      currentAmmo: WEAPONS[newWeapon].magazineSize,
      reserveAmmo: WEAPONS[newWeapon].magazineSize * 3,
      isReloading: false,
      lastShotTime: 0,
    });
  }, [weaponState.isReloading]);

  const addAmmo = useCallback((amount: number) => {
    setWeaponState((prev) => ({
      ...prev,
      reserveAmmo: prev.reserveAmmo + amount,
    }));
  }, []);

  return {
    weaponState,
    currentWeaponStats: WEAPONS[weaponState.currentWeapon],
    canShoot,
    shoot,
    reload,
    switchWeapon,
    addAmmo,
  };
};
