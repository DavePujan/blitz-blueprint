export type WeaponType = 'assault_rifle' | 'sniper' | 'shotgun' | 'pistol' | 'smg';

export interface WeaponStats {
  name: string;
  type: WeaponType;
  damage: number;
  fireRate: number; // rounds per minute
  magazineSize: number;
  reloadTime: number; // seconds
  accuracy: number; // 0-1, affects spread
  range: number; // effective range in units
  automatic: boolean;
}

export const WEAPONS: Record<WeaponType, WeaponStats> = {
  assault_rifle: {
    name: 'M4A1 Assault Rifle',
    type: 'assault_rifle',
    damage: 25,
    fireRate: 600,
    magazineSize: 30,
    reloadTime: 2.5,
    accuracy: 0.85,
    range: 100,
    automatic: true,
  },
  sniper: {
    name: 'AWP Sniper',
    type: 'sniper',
    damage: 90,
    fireRate: 40,
    magazineSize: 5,
    reloadTime: 3.5,
    accuracy: 0.98,
    range: 300,
    automatic: false,
  },
  shotgun: {
    name: 'M870 Shotgun',
    type: 'shotgun',
    damage: 80,
    fireRate: 60,
    magazineSize: 8,
    reloadTime: 4.0,
    accuracy: 0.6,
    range: 30,
    automatic: false,
  },
  pistol: {
    name: 'Desert Eagle',
    type: 'pistol',
    damage: 35,
    fireRate: 180,
    magazineSize: 7,
    reloadTime: 1.8,
    accuracy: 0.75,
    range: 50,
    automatic: false,
  },
  smg: {
    name: 'MP5 SMG',
    type: 'smg',
    damage: 20,
    fireRate: 800,
    magazineSize: 25,
    reloadTime: 2.0,
    accuracy: 0.7,
    range: 60,
    automatic: true,
  },
};

export interface PlayerWeaponState {
  currentWeapon: WeaponType;
  currentAmmo: number;
  reserveAmmo: number;
  isReloading: boolean;
  lastShotTime: number;
}
