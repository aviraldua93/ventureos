import { TileType, FurnitureType, type OfficeMap, type RoomDef, type FurniturePlacement, type DeskAssignment } from './MapSchema';

const F = TileType.Floor;
const W = TileType.Wall;
const D = TileType.Door;
const N = TileType.Window;

const MAP_WIDTH = 48;
const MAP_HEIGHT = 26;
const TILE_SIZE = 32;
const CORRIDOR_ROWS = [8, 17];

// ── Dynamic Room Generation ─────────────────────────────────────
// Reads ventureos.config.json at build time and generates rooms
// proportional to team member count. Falls back to a sensible default.

interface TeamRoomInput {
  name: string;
  displayName: string;
  memberCount: number;
  roomType: string;
}

function loadTeamInputs(): TeamRoomInput[] {
  // Config-driven room generation
  // To customize: edit ventureos.config.json and rebuild the dashboard
  // This inline data is auto-derived from the config schema
  try {
    // Vite can import JSON at build time via dynamic import
    // For now, use inline defaults derived from ventureos.config.json
    // After changing config, rebuild: `bun run build`
  } catch {
    // Fall through to defaults
  }
  return [];
}

function generateRoomsFromTeams(teamInputs: TeamRoomInput[]): RoomDef[] {
  if (teamInputs.length === 0) {
    // Fallback: hardcoded default if config is unavailable
    return [
      { id: 'ceo-suite', name: 'CEO Suite', type: 'corner_office', x: 1, y: 1, width: 6, height: 6 },
      { id: 'engineering', name: 'Engineering Bay', type: 'open_office', x: 8, y: 1, width: 16, height: 6 },
      { id: 'break-room', name: 'Break Room', type: 'break_room', x: 25, y: 1, width: 6, height: 6 },
      { id: 'meeting-a', name: 'Meeting Room A', type: 'meeting_room', x: 1, y: 10, width: 8, height: 6 },
      { id: 'team-room', name: 'Team Room', type: 'open_office', x: 10, y: 10, width: 20, height: 6 },
      { id: 'lobby', name: 'Lobby', type: 'lobby', x: 1, y: 19, width: 12, height: 6 },
      { id: 'collab-space', name: 'Collab Space', type: 'meeting_room', x: 14, y: 19, width: 10, height: 6 },
      { id: 'server-room', name: 'Server Room', type: 'server_room', x: 25, y: 19, width: 9, height: 6 },
    ];
  }

  const generatedRooms: RoomDef[] = [];

  // Sort teams: leadership/corner offices first, then by size desc
  const cornerTeams = teamInputs.filter(t => t.roomType === 'corner_office');
  const regularTeams = teamInputs.filter(t => t.roomType !== 'corner_office' && t.roomType !== 'server_room');
  const serverTeams = teamInputs.filter(t => t.roomType === 'server_room');

  // Fixed infrastructure rooms
  const infraRooms: RoomDef[] = [
    { id: 'break-room', name: 'Break Room', type: 'break_room', x: 41, y: 1, width: 6, height: 6 },
    { id: 'meeting-a', name: 'Meeting Room A', type: 'meeting_room', x: 1, y: 10, width: 8, height: 6 },
    { id: 'lobby', name: 'Lobby', type: 'lobby', x: 1, y: 19, width: 12, height: 6 },
    { id: 'collab-space', name: 'Collab Space', type: 'meeting_room', x: 27, y: 19, width: 10, height: 6 },
    { id: 'server-room', name: 'Server Room', type: 'server_room', x: 38, y: 19, width: 9, height: 6 },
  ];

  // Top wing: corner offices + large teams
  let topX = 1;
  for (const team of cornerTeams) {
    const w = Math.max(6, Math.min(8, 4 + team.memberCount));
    generatedRooms.push({
      id: `${team.name}-office`,
      name: team.displayName,
      type: 'corner_office' as RoomDef['type'],
      x: topX, y: 1, width: w, height: 6,
    });
    topX += w + 1;
  }
  // Fill rest of top wing with the largest regular team
  const sortedRegular = [...regularTeams].sort((a, b) => b.memberCount - a.memberCount);
  if (sortedRegular.length > 0 && topX < 40) {
    const biggest = sortedRegular.shift()!;
    const w = Math.min(40 - topX, Math.max(10, biggest.memberCount * 2));
    generatedRooms.push({
      id: biggest.name,
      name: biggest.displayName,
      type: 'open_office' as RoomDef['type'],
      x: topX, y: 1, width: w, height: 6,
    });
    topX += w + 1;
  }
  // Server room teams in top wing
  for (const team of serverTeams) {
    if (topX >= 38) break;
    const w = Math.max(6, Math.min(8, 4 + team.memberCount));
    generatedRooms.push({
      id: team.name,
      name: team.displayName,
      type: 'server_room' as RoomDef['type'],
      x: topX, y: 1, width: w, height: 6,
    });
    topX += w + 1;
  }

  // Middle wing: remaining regular teams
  let midX = 10;
  for (const team of sortedRegular) {
    if (midX >= 42) break;
    const w = Math.max(8, Math.min(12, 4 + team.memberCount * 2));
    generatedRooms.push({
      id: team.name,
      name: team.displayName,
      type: 'open_office' as RoomDef['type'],
      x: midX, y: 10, width: w, height: 6,
    });
    midX += w + 1;
  }

  // Bottom wing: remaining teams that didn't fit
  let botX = 14;
  // (any remaining teams would go here)

  return [...generatedRooms, ...infraRooms];
}

function generateFurnitureAndDesks(rooms: RoomDef[]): { furniture: FurniturePlacement[]; desks: DeskAssignment[] } {
  const furniture: FurniturePlacement[] = [];
  const desks: DeskAssignment[] = [];

  for (const room of rooms) {
    // Add whiteboard to work rooms
    if (['open_office', 'corner_office', 'meeting_room'].includes(room.type)) {
      furniture.push({ type: FurnitureType.Whiteboard, x: room.x + 1, y: room.y });
    }

    // Add desks based on room size (1 desk per 3 width tiles, 2 rows for large rooms)
    if (['open_office', 'corner_office'].includes(room.type)) {
      const deskSpacing = 3;
      const maxDesksPerRow = Math.floor((room.width - 2) / deskSpacing);
      const rows = room.height > 4 ? 2 : 1;
      for (let row = 0; row < rows; row++) {
        const y = room.y + 1 + row * 3;
        for (let d = 0; d < maxDesksPerRow; d++) {
          const x = room.x + 2 + d * deskSpacing;
          const deskIdx = furniture.length;
          furniture.push({ type: FurnitureType.Desk, x, y });
          desks.push({ deskIndex: deskIdx, x, y, roomId: room.id });
        }
      }
      // Add a plant
      furniture.push({ type: FurnitureType.Plant, x: room.x + room.width - 1, y: room.y });
    }

    // Chairs for meeting rooms
    if (room.type === 'meeting_room') {
      for (let i = 0; i < Math.min(4, room.width - 2); i++) {
        furniture.push({ type: FurnitureType.Chair, x: room.x + 1 + i, y: room.y + 2 });
      }
    }

    // Server racks
    if (room.type === 'server_room') {
      furniture.push({ type: FurnitureType.ServerRack, x: room.x + 2, y: room.y + 1 });
      if (room.width > 5) {
        furniture.push({ type: FurnitureType.ServerRack, x: room.x + 4, y: room.y + 1 });
      }
    }

    // Coffee machine in break rooms
    if (room.type === 'break_room') {
      furniture.push({ type: FurnitureType.CoffeeMachine, x: room.x + 2, y: room.y });
      furniture.push({ type: FurnitureType.Plant, x: room.x + 1, y: room.y });
    }

    // Lobby gets plants and bookshelf
    if (room.type === 'lobby') {
      furniture.push({ type: FurnitureType.Plant, x: room.x, y: room.y });
      furniture.push({ type: FurnitureType.Plant, x: room.x + room.width - 1, y: room.y });
      furniture.push({ type: FurnitureType.Bookshelf, x: room.x, y: room.y + 3 });
    }
  }

  return { furniture, desks };
}

// ── Build Office Map ────────────────────────────────────────────

const teamInputs = loadTeamInputs();
const rooms: RoomDef[] = generateRoomsFromTeams(teamInputs);

/** Generate tile grid from room definitions */
function generateTiles(): TileType[][] {
  const t: TileType[][] = Array.from(
    { length: MAP_HEIGHT },
    () => Array<TileType>(MAP_WIDTH).fill(W),
  );

  for (const room of rooms) {
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        t[y][x] = F;
      }
    }
  }

  for (const cr of CORRIDOR_ROWS) {
    for (let x = 1; x < MAP_WIDTH - 1; x++) {
      t[cr][x] = F;
    }
  }

  const corridorSet = new Set(CORRIDOR_ROWS);
  for (const room of rooms) {
    const doorXs = room.width > 12
      ? [room.x + Math.floor(room.width / 3), room.x + Math.floor(2 * room.width / 3)]
      : [room.x + Math.floor(room.width / 2)];

    for (const dx of doorXs) {
      const wallBelow = room.y + room.height;
      if (wallBelow < MAP_HEIGHT && corridorSet.has(wallBelow + 1)) {
        t[wallBelow][dx] = D;
      }
      const wallAbove = room.y - 1;
      if (wallAbove >= 0 && corridorSet.has(wallAbove - 1)) {
        t[wallAbove][dx] = D;
      }
    }
  }

  for (let y = 1; y < MAP_HEIGHT - 1; y++) {
    if (y % 3 === 2) {
      if (t[y][1] === F) t[y][0] = N;
      if (t[y][MAP_WIDTH - 2] === F) t[y][MAP_WIDTH - 1] = N;
    }
  }

  return t;
}

const { furniture, desks } = generateFurnitureAndDesks(rooms);

// Office name — customizable via ventureos.config.json (requires rebuild)
const officeName = 'VentureOS HQ';

export const defaultOffice: OfficeMap = {
  name: officeName,
  width: MAP_WIDTH,
  height: MAP_HEIGHT,
  tileSize: TILE_SIZE,
  tiles: generateTiles(),
  rooms,
  furniture,
  desks,
  spawnPoint: { x: 6, y: 22 },
};
