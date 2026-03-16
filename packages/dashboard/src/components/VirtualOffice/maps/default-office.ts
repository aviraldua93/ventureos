import { TileType, FurnitureType, type OfficeMap } from './MapSchema';

const F = TileType.Floor;
const W = TileType.Wall;
const D = TileType.Door;
const N = TileType.Window;
const E = TileType.Empty;

/**
 * Default 24x18 office layout.
 * Rooms: Lobby (left), Open Office (center), 2 Meeting Rooms (top-right),
 * Server Room (bottom-right), Break Room (top-left), CEO Corner Office (top-left corner).
 */
export const defaultOffice: OfficeMap = {
  name: 'VentureOS HQ',
  width: 24,
  height: 18,
  tileSize: 32,
  tiles: [
    // Row 0  - top wall
    [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
    // Row 1  - CEO office + break room top
    [W,F,F,F,F,W,F,F,F,F,F,W,W,F,F,F,F,F,W,F,F,F,F,W],
    // Row 2
    [N,F,F,F,F,W,F,F,F,F,F,W,W,F,F,F,F,F,W,F,F,F,F,N],
    // Row 3
    [W,F,F,F,F,D,F,F,F,F,F,W,W,F,F,F,F,F,D,F,F,F,F,W],
    // Row 4  - wall separating top rooms from open office
    [W,W,W,D,W,W,W,W,D,W,W,W,W,W,W,D,W,W,W,W,D,W,W,W],
    // Row 5  - open office
    [W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W],
    // Row 6
    [N,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,N],
    // Row 7
    [W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W],
    // Row 8
    [W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W],
    // Row 9
    [N,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,N],
    // Row 10
    [W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W],
    // Row 11 - wall separating open office from bottom rooms
    [W,W,W,D,W,W,W,W,W,W,D,W,W,W,D,W,W,W,W,W,W,D,W,W],
    // Row 12 - lobby + server room
    [W,F,F,F,F,F,F,F,F,F,F,W,W,F,F,F,F,F,W,F,F,F,F,W],
    // Row 13
    [N,F,F,F,F,F,F,F,F,F,F,W,W,F,F,F,F,F,W,F,F,F,F,N],
    // Row 14
    [W,F,F,F,F,F,F,F,F,F,F,W,W,F,F,F,F,F,W,F,F,F,F,W],
    // Row 15
    [W,F,F,F,F,F,F,F,F,F,F,D,W,F,F,F,F,F,D,F,F,F,F,W],
    // Row 16
    [W,F,F,D,F,F,F,F,F,F,F,W,W,F,F,F,F,F,W,F,F,F,F,W],
    // Row 17 - bottom wall
    [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
  ],
  rooms: [
    { id: 'ceo-office',    name: "CEO's Office",   type: 'corner_office',  x: 1,  y: 1,  width: 4,  height: 3 },
    { id: 'break-room',    name: 'Break Room',     type: 'break_room',     x: 6,  y: 1,  width: 5,  height: 3 },
    { id: 'meeting-1',     name: 'Meeting Room A', type: 'meeting_room',   x: 13, y: 1,  width: 5,  height: 3 },
    { id: 'meeting-2',     name: 'Meeting Room B', type: 'meeting_room',   x: 19, y: 1,  width: 4,  height: 3 },
    { id: 'open-office',   name: 'Open Office',    type: 'open_office',    x: 1,  y: 5,  width: 22, height: 6 },
    { id: 'lobby',         name: 'Lobby',          type: 'lobby',          x: 1,  y: 12, width: 10, height: 5 },
    { id: 'collab-space',  name: 'Collab Space',   type: 'meeting_room',   x: 13, y: 12, width: 5,  height: 5 },
    { id: 'server-room',   name: 'Server Room',    type: 'server_room',    x: 19, y: 12, width: 4,  height: 5 },
  ],
  furniture: [
    // CEO office
    { type: FurnitureType.Desk,    x: 2,  y: 2 },
    { type: FurnitureType.Chair,   x: 3,  y: 2 },
    { type: FurnitureType.Plant,   x: 4,  y: 1 },
    // Break room
    { type: FurnitureType.CoffeeMachine, x: 9,  y: 1 },
    { type: FurnitureType.Plant,   x: 6,  y: 1 },
    // Open office desks (3 rows of desk pairs)
    { type: FurnitureType.Desk,    x: 3,  y: 6 },
    { type: FurnitureType.Desk,    x: 5,  y: 6 },
    { type: FurnitureType.Desk,    x: 8,  y: 6 },
    { type: FurnitureType.Desk,    x: 10, y: 6 },
    { type: FurnitureType.Desk,    x: 13, y: 6 },
    { type: FurnitureType.Desk,    x: 15, y: 6 },
    { type: FurnitureType.Desk,    x: 18, y: 6 },
    { type: FurnitureType.Desk,    x: 20, y: 6 },
    { type: FurnitureType.Desk,    x: 3,  y: 9 },
    { type: FurnitureType.Desk,    x: 5,  y: 9 },
    { type: FurnitureType.Desk,    x: 8,  y: 9 },
    { type: FurnitureType.Desk,    x: 10, y: 9 },
    { type: FurnitureType.Desk,    x: 13, y: 9 },
    { type: FurnitureType.Desk,    x: 15, y: 9 },
    { type: FurnitureType.Desk,    x: 18, y: 9 },
    { type: FurnitureType.Desk,    x: 20, y: 9 },
    // Whiteboards
    { type: FurnitureType.Whiteboard, x: 14, y: 1 },
    { type: FurnitureType.Whiteboard, x: 20, y: 1 },
    // Meeting rooms chairs
    { type: FurnitureType.Chair, x: 14, y: 2 },
    { type: FurnitureType.Chair, x: 16, y: 2 },
    { type: FurnitureType.Chair, x: 14, y: 3 },
    { type: FurnitureType.Chair, x: 16, y: 3 },
    // Server room
    { type: FurnitureType.ServerRack, x: 20, y: 13 },
    { type: FurnitureType.ServerRack, x: 22, y: 13 },
    { type: FurnitureType.ServerRack, x: 20, y: 15 },
    // Lobby plants
    { type: FurnitureType.Plant, x: 1,  y: 12 },
    { type: FurnitureType.Plant, x: 10, y: 12 },
    // Bookshelf
    { type: FurnitureType.Bookshelf, x: 1, y: 7 },
    { type: FurnitureType.Bookshelf, x: 1, y: 9 },
  ],
  desks: [
    // Open office desks (index into furniture array, starting at idx 5)
    { deskIndex: 5,  x: 3,  y: 6,  roomId: 'open-office' },
    { deskIndex: 6,  x: 5,  y: 6,  roomId: 'open-office' },
    { deskIndex: 7,  x: 8,  y: 6,  roomId: 'open-office' },
    { deskIndex: 8,  x: 10, y: 6,  roomId: 'open-office' },
    { deskIndex: 9,  x: 13, y: 6,  roomId: 'open-office' },
    { deskIndex: 10, x: 15, y: 6,  roomId: 'open-office' },
    { deskIndex: 11, x: 18, y: 6,  roomId: 'open-office' },
    { deskIndex: 12, x: 20, y: 6,  roomId: 'open-office' },
    { deskIndex: 13, x: 3,  y: 9,  roomId: 'open-office' },
    { deskIndex: 14, x: 5,  y: 9,  roomId: 'open-office' },
    { deskIndex: 15, x: 8,  y: 9,  roomId: 'open-office' },
    { deskIndex: 16, x: 10, y: 9,  roomId: 'open-office' },
    { deskIndex: 17, x: 13, y: 9,  roomId: 'open-office' },
    { deskIndex: 18, x: 15, y: 9,  roomId: 'open-office' },
    { deskIndex: 19, x: 18, y: 9,  roomId: 'open-office' },
    { deskIndex: 20, x: 20, y: 9,  roomId: 'open-office' },
    // CEO desk
    { deskIndex: 0,  x: 2,  y: 2,  roomId: 'ceo-office' },
  ],
  spawnPoint: { x: 3, y: 16 },
};
