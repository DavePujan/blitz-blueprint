import * as THREE from 'three';

export type MapType = 'factory' | 'warehouse' | 'urban' | 'desert';

export interface SpawnPoint {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  team?: 'blue' | 'red';
}

export interface FlagBase {
  position: THREE.Vector3;
  team: 'blue' | 'red';
}

export interface CoverObject {
  position: THREE.Vector3;
  size: THREE.Vector3;
  type: 'box' | 'cylinder' | 'wall';
  height: number;
}

export interface MapConfig {
  id: MapType;
  name: string;
  description: string;
  thumbnail?: string;
  bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  spawnPoints: SpawnPoint[];
  flagBases?: FlagBase[];
  coverObjects: CoverObject[];
  ambientColor: string;
  fogColor: string;
  fogDensity: number;
}

export const MAPS: Record<MapType, MapConfig> = {
  factory: {
    id: 'factory',
    name: 'Abandoned Factory',
    description: 'Industrial complex with multiple levels and tight corridors',
    bounds: { minX: -50, maxX: 50, minZ: -50, maxZ: 50 },
    spawnPoints: [
      { position: new THREE.Vector3(-40, 1, -40), rotation: new THREE.Euler(0, Math.PI / 4, 0), team: 'blue' },
      { position: new THREE.Vector3(-35, 1, -40), rotation: new THREE.Euler(0, Math.PI / 4, 0), team: 'blue' },
      { position: new THREE.Vector3(-40, 1, -35), rotation: new THREE.Euler(0, Math.PI / 4, 0), team: 'blue' },
      { position: new THREE.Vector3(40, 1, 40), rotation: new THREE.Euler(0, -3 * Math.PI / 4, 0), team: 'red' },
      { position: new THREE.Vector3(35, 1, 40), rotation: new THREE.Euler(0, -3 * Math.PI / 4, 0), team: 'red' },
      { position: new THREE.Vector3(40, 1, 35), rotation: new THREE.Euler(0, -3 * Math.PI / 4, 0), team: 'red' },
      // FFA spawns
      { position: new THREE.Vector3(0, 1, -40), rotation: new THREE.Euler(0, 0, 0) },
      { position: new THREE.Vector3(-40, 1, 0), rotation: new THREE.Euler(0, Math.PI / 2, 0) },
      { position: new THREE.Vector3(40, 1, 0), rotation: new THREE.Euler(0, -Math.PI / 2, 0) },
      { position: new THREE.Vector3(0, 1, 40), rotation: new THREE.Euler(0, Math.PI, 0) },
    ],
    flagBases: [
      { position: new THREE.Vector3(-45, 1, -45), team: 'blue' },
      { position: new THREE.Vector3(45, 1, 45), team: 'red' },
    ],
    coverObjects: [
      { position: new THREE.Vector3(-20, 0, -20), size: new THREE.Vector3(4, 2, 4), type: 'box', height: 2 },
      { position: new THREE.Vector3(20, 0, 20), size: new THREE.Vector3(4, 2, 4), type: 'box', height: 2 },
      { position: new THREE.Vector3(0, 0, 0), size: new THREE.Vector3(8, 3, 2), type: 'wall', height: 3 },
      { position: new THREE.Vector3(-10, 0, 15), size: new THREE.Vector3(2, 2, 2), type: 'cylinder', height: 2 },
      { position: new THREE.Vector3(10, 0, -15), size: new THREE.Vector3(2, 2, 2), type: 'cylinder', height: 2 },
    ],
    ambientColor: '#404040',
    fogColor: '#1a1a1a',
    fogDensity: 0.02,
  },
  warehouse: {
    id: 'warehouse',
    name: 'Storage Warehouse',
    description: 'Large open warehouse with shipping containers for cover',
    bounds: { minX: -60, maxX: 60, minZ: -60, maxZ: 60 },
    spawnPoints: [
      { position: new THREE.Vector3(-50, 1, -50), rotation: new THREE.Euler(0, Math.PI / 4, 0), team: 'blue' },
      { position: new THREE.Vector3(-45, 1, -50), rotation: new THREE.Euler(0, Math.PI / 4, 0), team: 'blue' },
      { position: new THREE.Vector3(-50, 1, -45), rotation: new THREE.Euler(0, Math.PI / 4, 0), team: 'blue' },
      { position: new THREE.Vector3(50, 1, 50), rotation: new THREE.Euler(0, -3 * Math.PI / 4, 0), team: 'red' },
      { position: new THREE.Vector3(45, 1, 50), rotation: new THREE.Euler(0, -3 * Math.PI / 4, 0), team: 'red' },
      { position: new THREE.Vector3(50, 1, 45), rotation: new THREE.Euler(0, -3 * Math.PI / 4, 0), team: 'red' },
      // FFA spawns
      { position: new THREE.Vector3(0, 1, -50), rotation: new THREE.Euler(0, 0, 0) },
      { position: new THREE.Vector3(-50, 1, 0), rotation: new THREE.Euler(0, Math.PI / 2, 0) },
      { position: new THREE.Vector3(50, 1, 0), rotation: new THREE.Euler(0, -Math.PI / 2, 0) },
      { position: new THREE.Vector3(0, 1, 50), rotation: new THREE.Euler(0, Math.PI, 0) },
    ],
    flagBases: [
      { position: new THREE.Vector3(-55, 1, -55), team: 'blue' },
      { position: new THREE.Vector3(55, 1, 55), team: 'red' },
    ],
    coverObjects: [
      // Shipping containers
      { position: new THREE.Vector3(-25, 0, -25), size: new THREE.Vector3(6, 3, 3), type: 'box', height: 3 },
      { position: new THREE.Vector3(25, 0, 25), size: new THREE.Vector3(6, 3, 3), type: 'box', height: 3 },
      { position: new THREE.Vector3(-25, 0, 25), size: new THREE.Vector3(6, 3, 3), type: 'box', height: 3 },
      { position: new THREE.Vector3(25, 0, -25), size: new THREE.Vector3(6, 3, 3), type: 'box', height: 3 },
      { position: new THREE.Vector3(0, 0, 10), size: new THREE.Vector3(8, 3, 3), type: 'box', height: 3 },
      { position: new THREE.Vector3(0, 0, -10), size: new THREE.Vector3(8, 3, 3), type: 'box', height: 3 },
    ],
    ambientColor: '#505050',
    fogColor: '#2a2a2a',
    fogDensity: 0.015,
  },
  urban: {
    id: 'urban',
    name: 'Urban Streets',
    description: 'City streets with buildings and vehicles for tactical gameplay',
    bounds: { minX: -70, maxX: 70, minZ: -70, maxZ: 70 },
    spawnPoints: [
      { position: new THREE.Vector3(-60, 1, -60), rotation: new THREE.Euler(0, Math.PI / 4, 0), team: 'blue' },
      { position: new THREE.Vector3(-55, 1, -60), rotation: new THREE.Euler(0, Math.PI / 4, 0), team: 'blue' },
      { position: new THREE.Vector3(-60, 1, -55), rotation: new THREE.Euler(0, Math.PI / 4, 0), team: 'blue' },
      { position: new THREE.Vector3(60, 1, 60), rotation: new THREE.Euler(0, -3 * Math.PI / 4, 0), team: 'red' },
      { position: new THREE.Vector3(55, 1, 60), rotation: new THREE.Euler(0, -3 * Math.PI / 4, 0), team: 'red' },
      { position: new THREE.Vector3(60, 1, 55), rotation: new THREE.Euler(0, -3 * Math.PI / 4, 0), team: 'red' },
      // FFA spawns
      { position: new THREE.Vector3(0, 1, -60), rotation: new THREE.Euler(0, 0, 0) },
      { position: new THREE.Vector3(-60, 1, 0), rotation: new THREE.Euler(0, Math.PI / 2, 0) },
      { position: new THREE.Vector3(60, 1, 0), rotation: new THREE.Euler(0, -Math.PI / 2, 0) },
      { position: new THREE.Vector3(0, 1, 60), rotation: new THREE.Euler(0, Math.PI, 0) },
    ],
    flagBases: [
      { position: new THREE.Vector3(-65, 1, -65), team: 'blue' },
      { position: new THREE.Vector3(65, 1, 65), team: 'red' },
    ],
    coverObjects: [
      // Cars
      { position: new THREE.Vector3(-30, 0, 0), size: new THREE.Vector3(4, 2, 2), type: 'box', height: 2 },
      { position: new THREE.Vector3(30, 0, 0), size: new THREE.Vector3(4, 2, 2), type: 'box', height: 2 },
      // Buildings/walls
      { position: new THREE.Vector3(0, 0, -30), size: new THREE.Vector3(10, 4, 2), type: 'wall', height: 4 },
      { position: new THREE.Vector3(0, 0, 30), size: new THREE.Vector3(10, 4, 2), type: 'wall', height: 4 },
      { position: new THREE.Vector3(-15, 0, -15), size: new THREE.Vector3(5, 3, 5), type: 'box', height: 3 },
      { position: new THREE.Vector3(15, 0, 15), size: new THREE.Vector3(5, 3, 5), type: 'box', height: 3 },
    ],
    ambientColor: '#606060',
    fogColor: '#3a3a3a',
    fogDensity: 0.01,
  },
  desert: {
    id: 'desert',
    name: 'Desert Outpost',
    description: 'Sandy terrain with fortified positions and rocky cover',
    bounds: { minX: -80, maxX: 80, minZ: -80, maxZ: 80 },
    spawnPoints: [
      { position: new THREE.Vector3(-70, 1, -70), rotation: new THREE.Euler(0, Math.PI / 4, 0), team: 'blue' },
      { position: new THREE.Vector3(-65, 1, -70), rotation: new THREE.Euler(0, Math.PI / 4, 0), team: 'blue' },
      { position: new THREE.Vector3(-70, 1, -65), rotation: new THREE.Euler(0, Math.PI / 4, 0), team: 'blue' },
      { position: new THREE.Vector3(70, 1, 70), rotation: new THREE.Euler(0, -3 * Math.PI / 4, 0), team: 'red' },
      { position: new THREE.Vector3(65, 1, 70), rotation: new THREE.Euler(0, -3 * Math.PI / 4, 0), team: 'red' },
      { position: new THREE.Vector3(70, 1, 65), rotation: new THREE.Euler(0, -3 * Math.PI / 4, 0), team: 'red' },
      // FFA spawns
      { position: new THREE.Vector3(0, 1, -70), rotation: new THREE.Euler(0, 0, 0) },
      { position: new THREE.Vector3(-70, 1, 0), rotation: new THREE.Euler(0, Math.PI / 2, 0) },
      { position: new THREE.Vector3(70, 1, 0), rotation: new THREE.Euler(0, -Math.PI / 2, 0) },
      { position: new THREE.Vector3(0, 1, 70), rotation: new THREE.Euler(0, Math.PI, 0) },
    ],
    flagBases: [
      { position: new THREE.Vector3(-75, 1, -75), team: 'blue' },
      { position: new THREE.Vector3(75, 1, 75), team: 'red' },
    ],
    coverObjects: [
      // Sandbags
      { position: new THREE.Vector3(-35, 0, 0), size: new THREE.Vector3(5, 1.5, 1), type: 'wall', height: 1.5 },
      { position: new THREE.Vector3(35, 0, 0), size: new THREE.Vector3(5, 1.5, 1), type: 'wall', height: 1.5 },
      // Rocks
      { position: new THREE.Vector3(0, 0, -35), size: new THREE.Vector3(3, 2.5, 3), type: 'box', height: 2.5 },
      { position: new THREE.Vector3(0, 0, 35), size: new THREE.Vector3(3, 2.5, 3), type: 'box', height: 2.5 },
      { position: new THREE.Vector3(-20, 0, -20), size: new THREE.Vector3(4, 2, 4), type: 'box', height: 2 },
      { position: new THREE.Vector3(20, 0, 20), size: new THREE.Vector3(4, 2, 4), type: 'box', height: 2 },
    ],
    ambientColor: '#a0805a',
    fogColor: '#d4c4a0',
    fogDensity: 0.008,
  },
};
