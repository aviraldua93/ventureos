// Map data schema for the pixel art office

export enum TileType {
  Empty = 0,
  Floor = 1,
  Wall = 2,
  Door = 3,
  Window = 4,
}

export enum FurnitureType {
  Desk = 'desk',
  Chair = 'chair',
  Whiteboard = 'whiteboard',
  ServerRack = 'server_rack',
  CoffeeMachine = 'coffee',
  Plant = 'plant',
  Monitor = 'monitor',
  Bookshelf = 'bookshelf',
}

export interface RoomDef {
  id: string;
  name: string;
  type: 'lobby' | 'open_office' | 'meeting_room' | 'server_room' | 'break_room' | 'corner_office';
  /** Top-left tile coordinate */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FurniturePlacement {
  type: FurnitureType;
  x: number;
  y: number;
  /** Rotation in 90° increments (0-3) */
  rotation?: number;
}

export interface DeskAssignment {
  /** Desk furniture index */
  deskIndex: number;
  /** Grid position of the desk */
  x: number;
  y: number;
  /** Room this desk belongs to */
  roomId: string;
}

export interface OfficeMap {
  name: string;
  width: number;
  height: number;
  tileSize: number;
  tiles: TileType[][];
  rooms: RoomDef[];
  furniture: FurniturePlacement[];
  desks: DeskAssignment[];
  /** Spawn point for new agents (lobby door) */
  spawnPoint: { x: number; y: number };
}
