import { TileType, FurnitureType, type OfficeMap, type RoomDef } from './MapSchema';

const F = TileType.Floor;
const W = TileType.Wall;
const D = TileType.Door;
const N = TileType.Window;

const MAP_WIDTH = 48;
const MAP_HEIGHT = 26;
const TILE_SIZE = 32;
const CORRIDOR_ROWS = [8, 17];

/**
 * Expanded 48x26 VentureOS HQ with dedicated department rooms.
 *
 * Layout (3 wings connected by corridors at rows 8 and 17):
 *   Top wing (rows 1-6):    CEO Suite | Holding Co | Engineering Bay | AI Research | Break Room
 *   Middle wing (rows 10-15): Meeting A | Product Mgmt | QA Lab | Playwright Lab | Meeting B
 *   Bottom wing (rows 19-24): Lobby | Community Hub | Collab Space | Server Room
 */
const rooms: RoomDef[] = [
  // Top wing (y:1-6, height:6)
  { id: 'ceo-suite',       name: 'CEO Suite',        type: 'corner_office',  x: 1,  y: 1,  width: 6,  height: 6 },
  { id: 'holding-co',      name: 'Holding Co.',      type: 'corner_office',  x: 8,  y: 1,  width: 7,  height: 6 },
  { id: 'engineering',     name: 'Engineering Bay',  type: 'open_office',    x: 16, y: 1,  width: 16, height: 6 },
  { id: 'ai-research',     name: 'AI Research',      type: 'server_room',    x: 33, y: 1,  width: 7,  height: 6 },
  { id: 'break-room',      name: 'Break Room',       type: 'break_room',     x: 41, y: 1,  width: 6,  height: 6 },
  // Middle wing (y:10-15, height:6)
  { id: 'meeting-a',       name: 'Meeting Room A',   type: 'meeting_room',   x: 1,  y: 10, width: 8,  height: 6 },
  { id: 'product-mgmt',    name: 'Product Mgmt',     type: 'open_office',    x: 10, y: 10, width: 10, height: 6 },
  { id: 'qa-lab',          name: 'QA Lab',           type: 'open_office',    x: 21, y: 10, width: 10, height: 6 },
  { id: 'playwright-lab',  name: 'Playwright Lab',   type: 'open_office',    x: 32, y: 10, width: 10, height: 6 },
  { id: 'meeting-b',       name: 'Meeting Room B',   type: 'meeting_room',   x: 43, y: 10, width: 4,  height: 6 },
  // Bottom wing (y:19-24, height:6)
  { id: 'lobby',           name: 'Lobby',            type: 'lobby',          x: 1,  y: 19, width: 12, height: 6 },
  { id: 'community-hub',   name: 'Community Hub',    type: 'open_office',    x: 14, y: 19, width: 12, height: 6 },
  { id: 'collab-space',    name: 'Collab Space',     type: 'meeting_room',   x: 27, y: 19, width: 10, height: 6 },
  { id: 'server-room',     name: 'Server Room',      type: 'server_room',    x: 38, y: 19, width: 9,  height: 6 },
];

/** Generate tile grid from room definitions */
function generateTiles(): TileType[][] {
  const t: TileType[][] = Array.from(
    { length: MAP_HEIGHT },
    () => Array<TileType>(MAP_WIDTH).fill(W),
  );

  // Room interiors -> Floor
  for (const room of rooms) {
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        t[y][x] = F;
      }
    }
  }

  // Corridors -> Floor (full-width walkways)
  for (const cr of CORRIDOR_ROWS) {
    for (let x = 1; x < MAP_WIDTH - 1; x++) {
      t[cr][x] = F;
    }
  }

  // Doors: connect each room to adjacent corridors
  const corridorSet = new Set(CORRIDOR_ROWS);
  for (const room of rooms) {
    // Wide rooms get two doors for better pathfinding
    const doorXs = room.width > 12
      ? [room.x + Math.floor(room.width / 3), room.x + Math.floor(2 * room.width / 3)]
      : [room.x + Math.floor(room.width / 2)];

    for (const dx of doorXs) {
      // Door in wall below room (connects to corridor below)
      const wallBelow = room.y + room.height;
      if (wallBelow < MAP_HEIGHT && corridorSet.has(wallBelow + 1)) {
        t[wallBelow][dx] = D;
      }
      // Door in wall above room (connects to corridor above)
      const wallAbove = room.y - 1;
      if (wallAbove >= 0 && corridorSet.has(wallAbove - 1)) {
        t[wallAbove][dx] = D;
      }
    }
  }

  // Windows on left/right outer walls (every 3rd row for visual rhythm)
  for (let y = 1; y < MAP_HEIGHT - 1; y++) {
    if (y % 3 === 2) {
      if (t[y][1] === F) t[y][0] = N;
      if (t[y][MAP_WIDTH - 2] === F) t[y][MAP_WIDTH - 1] = N;
    }
  }

  return t;
}

export const defaultOffice: OfficeMap = {
  name: 'VentureOS HQ',
  width: MAP_WIDTH,
  height: MAP_HEIGHT,
  tileSize: TILE_SIZE,
  tiles: generateTiles(),
  rooms,
  furniture: [
    // CEO Suite
    { type: FurnitureType.Desk,    x: 3,  y: 3 },    // 0
    { type: FurnitureType.Chair,   x: 4,  y: 3 },    // 1
    { type: FurnitureType.Plant,   x: 5,  y: 1 },    // 2
    // Holding Co
    { type: FurnitureType.Desk,    x: 10, y: 2 },    // 3
    { type: FurnitureType.Desk,    x: 12, y: 4 },    // 4
    { type: FurnitureType.Whiteboard, x: 9, y: 1 },  // 5
    // Engineering Bay (8 desks in two rows)
    { type: FurnitureType.Desk,    x: 18, y: 2 },    // 6
    { type: FurnitureType.Desk,    x: 21, y: 2 },    // 7
    { type: FurnitureType.Desk,    x: 24, y: 2 },    // 8
    { type: FurnitureType.Desk,    x: 27, y: 2 },    // 9
    { type: FurnitureType.Desk,    x: 18, y: 5 },    // 10
    { type: FurnitureType.Desk,    x: 21, y: 5 },    // 11
    { type: FurnitureType.Desk,    x: 24, y: 5 },    // 12
    { type: FurnitureType.Desk,    x: 27, y: 5 },    // 13
    { type: FurnitureType.Whiteboard, x: 17, y: 1 }, // 14
    { type: FurnitureType.Whiteboard, x: 30, y: 1 }, // 15
    { type: FurnitureType.Plant,   x: 31, y: 1 },    // 16
    // AI Research
    { type: FurnitureType.Desk,    x: 35, y: 2 },    // 17
    { type: FurnitureType.Desk,    x: 37, y: 4 },    // 18
    { type: FurnitureType.ServerRack, x: 35, y: 5 }, // 19
    // Break Room
    { type: FurnitureType.CoffeeMachine, x: 44, y: 1 }, // 20
    { type: FurnitureType.Plant,   x: 42, y: 1 },    // 21
    { type: FurnitureType.Plant,   x: 45, y: 5 },    // 22
    // Meeting Room A
    { type: FurnitureType.Whiteboard, x: 2, y: 10 }, // 23
    { type: FurnitureType.Chair,   x: 3,  y: 12 },   // 24
    { type: FurnitureType.Chair,   x: 5,  y: 12 },   // 25
    { type: FurnitureType.Chair,   x: 3,  y: 14 },   // 26
    { type: FurnitureType.Chair,   x: 5,  y: 14 },   // 27
    // Product Mgmt
    { type: FurnitureType.Desk,    x: 12, y: 11 },   // 28
    { type: FurnitureType.Desk,    x: 15, y: 11 },   // 29
    { type: FurnitureType.Desk,    x: 18, y: 13 },   // 30
    { type: FurnitureType.Whiteboard, x: 11, y: 10 }, // 31
    // QA Lab
    { type: FurnitureType.Desk,    x: 23, y: 11 },   // 32
    { type: FurnitureType.Desk,    x: 26, y: 11 },   // 33
    { type: FurnitureType.Desk,    x: 29, y: 13 },   // 34
    { type: FurnitureType.Whiteboard, x: 22, y: 10 }, // 35
    // Playwright Lab
    { type: FurnitureType.Desk,    x: 34, y: 11 },   // 36
    { type: FurnitureType.Desk,    x: 37, y: 11 },   // 37
    { type: FurnitureType.Desk,    x: 40, y: 13 },   // 38
    { type: FurnitureType.Whiteboard, x: 33, y: 10 }, // 39
    // Meeting Room B
    { type: FurnitureType.Whiteboard, x: 44, y: 10 }, // 40
    { type: FurnitureType.Chair,   x: 44, y: 12 },   // 41
    { type: FurnitureType.Chair,   x: 45, y: 12 },   // 42
    // Lobby
    { type: FurnitureType.Plant,   x: 1,  y: 19 },   // 43
    { type: FurnitureType.Plant,   x: 11, y: 19 },   // 44
    { type: FurnitureType.Bookshelf, x: 1, y: 22 },  // 45
    // Community Hub
    { type: FurnitureType.Desk,    x: 16, y: 20 },   // 46
    { type: FurnitureType.Desk,    x: 19, y: 20 },   // 47
    { type: FurnitureType.Desk,    x: 22, y: 22 },   // 48
    { type: FurnitureType.Whiteboard, x: 15, y: 19 }, // 49
    { type: FurnitureType.Plant,   x: 24, y: 19 },   // 50
    // Collab Space
    { type: FurnitureType.Whiteboard, x: 28, y: 19 }, // 51
    { type: FurnitureType.Chair,   x: 29, y: 21 },   // 52
    { type: FurnitureType.Chair,   x: 31, y: 21 },   // 53
    { type: FurnitureType.Chair,   x: 33, y: 21 },   // 54
    { type: FurnitureType.Chair,   x: 35, y: 21 },   // 55
    // Server Room
    { type: FurnitureType.ServerRack, x: 40, y: 20 }, // 56
    { type: FurnitureType.ServerRack, x: 43, y: 20 }, // 57
    { type: FurnitureType.ServerRack, x: 40, y: 23 }, // 58
    { type: FurnitureType.ServerRack, x: 43, y: 23 }, // 59
  ],
  desks: [
    // CEO Suite
    { deskIndex: 0,  x: 3,  y: 3,  roomId: 'ceo-suite' },
    // Holding Co
    { deskIndex: 3,  x: 10, y: 2,  roomId: 'holding-co' },
    { deskIndex: 4,  x: 12, y: 4,  roomId: 'holding-co' },
    // Engineering Bay
    { deskIndex: 6,  x: 18, y: 2,  roomId: 'engineering' },
    { deskIndex: 7,  x: 21, y: 2,  roomId: 'engineering' },
    { deskIndex: 8,  x: 24, y: 2,  roomId: 'engineering' },
    { deskIndex: 9,  x: 27, y: 2,  roomId: 'engineering' },
    { deskIndex: 10, x: 18, y: 5,  roomId: 'engineering' },
    { deskIndex: 11, x: 21, y: 5,  roomId: 'engineering' },
    { deskIndex: 12, x: 24, y: 5,  roomId: 'engineering' },
    { deskIndex: 13, x: 27, y: 5,  roomId: 'engineering' },
    // AI Research
    { deskIndex: 17, x: 35, y: 2,  roomId: 'ai-research' },
    { deskIndex: 18, x: 37, y: 4,  roomId: 'ai-research' },
    // Product Mgmt
    { deskIndex: 28, x: 12, y: 11, roomId: 'product-mgmt' },
    { deskIndex: 29, x: 15, y: 11, roomId: 'product-mgmt' },
    { deskIndex: 30, x: 18, y: 13, roomId: 'product-mgmt' },
    // QA Lab
    { deskIndex: 32, x: 23, y: 11, roomId: 'qa-lab' },
    { deskIndex: 33, x: 26, y: 11, roomId: 'qa-lab' },
    { deskIndex: 34, x: 29, y: 13, roomId: 'qa-lab' },
    // Playwright Lab
    { deskIndex: 36, x: 34, y: 11, roomId: 'playwright-lab' },
    { deskIndex: 37, x: 37, y: 11, roomId: 'playwright-lab' },
    { deskIndex: 38, x: 40, y: 13, roomId: 'playwright-lab' },
    // Community Hub
    { deskIndex: 46, x: 16, y: 20, roomId: 'community-hub' },
    { deskIndex: 47, x: 19, y: 20, roomId: 'community-hub' },
    { deskIndex: 48, x: 22, y: 22, roomId: 'community-hub' },
  ],
  spawnPoint: { x: 6, y: 22 },
};
