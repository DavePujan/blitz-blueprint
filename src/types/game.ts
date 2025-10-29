import * as THREE from 'three';
import type { WeaponType } from './weapons';

// Network packet types for multiplayer synchronization
export interface PlayerSnapshot {
  id: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  health: number;
  maxHealth: number;
  currentWeapon: WeaponType;
  currentAmmo: number;
  isReloading: boolean;
  timestamp: number;
}

export interface InputPacket {
  playerId: string;
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
  shoot: boolean;
  lookDirection: { x: number; y: number; z: number };
  timestamp: number;
}

export interface ShootEvent {
  playerId: string;
  origin: { x: number; y: number; z: number };
  direction: { x: number; y: number; z: number };
  weaponType: WeaponType;
  timestamp: number;
}

export interface HitEvent {
  shooterId: string;
  victimId: string;
  damage: number;
  timestamp: number;
}

export interface GameState {
  players: Map<string, PlayerSnapshot>;
  projectiles: ShootEvent[];
  matchTime: number;
  teamScores: { blue: number; red: number };
}

export interface Bullet {
  id: string;
  origin: THREE.Vector3;
  direction: THREE.Vector3;
}
