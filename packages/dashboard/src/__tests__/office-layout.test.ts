import { describe, test, expect } from 'bun:test';
import { TileType, FurnitureType } from '../components/VirtualOffice/maps/MapSchema';
import { defaultOffice } from '../components/VirtualOffice/maps/default-office';

describe('Office Layout Generation', () => {
  describe('defaultOffice map structure', () => {
    test('has correct dimensions', () => {
      expect(defaultOffice.width).toBe(48);
      expect(defaultOffice.height).toBe(26);
      expect(defaultOffice.tileSize).toBe(32);
    });

    test('tile grid matches declared dimensions', () => {
      expect(defaultOffice.tiles).toHaveLength(defaultOffice.height);
      for (const row of defaultOffice.tiles) {
        expect(row).toHaveLength(defaultOffice.width);
      }
    });

    test('has a spawn point', () => {
      expect(defaultOffice.spawnPoint).toBeDefined();
      expect(defaultOffice.spawnPoint.x).toBeGreaterThanOrEqual(0);
      expect(defaultOffice.spawnPoint.y).toBeGreaterThanOrEqual(0);
    });

    test('has rooms defined', () => {
      expect(defaultOffice.rooms.length).toBeGreaterThan(0);
    });

    test('rooms are within map bounds', () => {
      for (const room of defaultOffice.rooms) {
        expect(room.x).toBeGreaterThanOrEqual(0);
        expect(room.y).toBeGreaterThanOrEqual(0);
        expect(room.x + room.width).toBeLessThanOrEqual(defaultOffice.width);
        expect(room.y + room.height).toBeLessThanOrEqual(defaultOffice.height);
      }
    });

    test('rooms have valid types', () => {
      const validTypes = [
        'lobby', 'open_office', 'meeting_room', 'server_room',
        'break_room', 'corner_office', 'pm_war_room', 'qa_lab',
        'research_lab', 'community_lounge', 'testing_bay',
      ];
      for (const room of defaultOffice.rooms) {
        expect(validTypes).toContain(room.type);
      }
    });

    test('has a lobby room', () => {
      const lobby = defaultOffice.rooms.find(r => r.type === 'lobby');
      expect(lobby).toBeDefined();
    });
  });

  describe('tile types', () => {
    test('border tiles are walls', () => {
      // Top and bottom edges should be walls
      for (let x = 0; x < defaultOffice.width; x++) {
        expect(defaultOffice.tiles[0][x]).toBe(TileType.Wall);
        expect(defaultOffice.tiles[defaultOffice.height - 1][x]).toBe(TileType.Wall);
      }
    });

    test('rooms contain floor tiles', () => {
      for (const room of defaultOffice.rooms) {
        // Interior of room should have floor
        const midX = room.x + Math.floor(room.width / 2);
        const midY = room.y + Math.floor(room.height / 2);
        expect(defaultOffice.tiles[midY][midX]).toBe(TileType.Floor);
      }
    });

    test('corridors are floor tiles', () => {
      // Corridor rows 8 and 17 should be floors
      for (const cr of [8, 17]) {
        if (cr < defaultOffice.height) {
          let hasFloor = false;
          for (let x = 1; x < defaultOffice.width - 1; x++) {
            if (defaultOffice.tiles[cr][x] === TileType.Floor) {
              hasFloor = true;
              break;
            }
          }
          expect(hasFloor).toBe(true);
        }
      }
    });
  });

  describe('furniture', () => {
    test('has furniture placed', () => {
      expect(defaultOffice.furniture.length).toBeGreaterThan(0);
    });

    test('has desks assigned', () => {
      expect(defaultOffice.desks.length).toBeGreaterThan(0);
    });

    test('desk assignments reference valid rooms', () => {
      const roomIds = new Set(defaultOffice.rooms.map(r => r.id));
      for (const desk of defaultOffice.desks) {
        expect(roomIds.has(desk.roomId)).toBe(true);
      }
    });

    test('furniture types are valid', () => {
      const validTypes = Object.values(FurnitureType);
      for (const f of defaultOffice.furniture) {
        expect(validTypes).toContain(f.type);
      }
    });
  });

  describe('TileType enum', () => {
    test('has expected values', () => {
      expect(TileType.Empty).toBe(0);
      expect(TileType.Floor).toBe(1);
      expect(TileType.Wall).toBe(2);
      expect(TileType.Door).toBe(3);
      expect(TileType.Window).toBe(4);
    });
  });

  describe('FurnitureType enum', () => {
    test('has expected values', () => {
      expect(FurnitureType.Desk).toBe('desk');
      expect(FurnitureType.Chair).toBe('chair');
      expect(FurnitureType.Plant).toBe('plant');
      expect(FurnitureType.ServerRack).toBe('server_rack');
    });
  });
});
