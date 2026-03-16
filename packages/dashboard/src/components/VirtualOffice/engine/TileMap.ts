import { Container, Graphics } from 'pixi.js';
import { TileType, FurnitureType, type OfficeMap, type FurniturePlacement } from '../maps/MapSchema';

// Pixel art color palette
const TILE_COLORS: Record<TileType, number> = {
  [TileType.Empty]:  0x0a0e14,
  [TileType.Floor]:  0x2a3544,
  [TileType.Wall]:   0x556677,
  [TileType.Door]:   0x4d9fff,
  [TileType.Window]: 0x38bdf8,
};

const FURNITURE_COLORS: Record<FurnitureType, number> = {
  [FurnitureType.Desk]:         0x8b6914,
  [FurnitureType.Chair]:        0x444444,
  [FurnitureType.Whiteboard]:   0xe8edf4,
  [FurnitureType.ServerRack]:   0x1a2233,
  [FurnitureType.CoffeeMachine]:0x6b3a2a,
  [FurnitureType.Plant]:        0x3ddc84,
  [FurnitureType.Monitor]:      0x111820,
  [FurnitureType.Bookshelf]:    0x8b6914,
  [FurnitureType.KanbanBoard]:  0xe8edf4,
  [FurnitureType.TestStation]:  0x111820,
  [FurnitureType.Couch]:        0x7c6f5b,
};

export class TileMap {
  readonly container: Container;
  private mapData: OfficeMap;

  constructor(mapData: OfficeMap) {
    this.mapData = mapData;
    this.container = new Container();
    this.container.label = 'tilemap';
    this.render();
  }

  private render() {
    const { tiles, tileSize, furniture, rooms } = this.mapData;

    // Batch ALL floor/wall tiles into a single Graphics object
    const tileGraphics = new Graphics();
    tileGraphics.label = 'tiles';
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < (tiles[y]?.length ?? 0); x++) {
        const tile = tiles[y][x];
        const px = x * tileSize;
        const py = y * tileSize;
        tileGraphics.rect(px, py, tileSize, tileSize);
        tileGraphics.fill(TILE_COLORS[tile]);
        tileGraphics.rect(px, py, tileSize, tileSize);
        tileGraphics.stroke({ width: 0.5, color: 0x1e2a38 });
      }
    }
    this.container.addChild(tileGraphics);

    // Batch room overlays into a single Graphics
    const roomGraphics = new Graphics();
    roomGraphics.label = 'rooms';
    for (const room of rooms) {
      roomGraphics.rect(
        room.x * tileSize + 2,
        room.y * tileSize + 2,
        room.width * tileSize - 4,
        room.height * tileSize - 4,
      );
      roomGraphics.fill({ color: 0x4d9fff, alpha: 0.04 });
    }
    this.container.addChild(roomGraphics);

    // Batch furniture into a single Graphics
    const furnitureGraphics = new Graphics();
    furnitureGraphics.label = 'furniture';
    for (const item of furniture) {
      this.drawFurniture(furnitureGraphics, item, tileSize);
    }
    this.container.addChild(furnitureGraphics);
  }

  private drawFurniture(g: Graphics, item: FurniturePlacement, tileSize: number) {
    const px = item.x * tileSize;
    const py = item.y * tileSize;
    const color = FURNITURE_COLORS[item.type];
    const s = tileSize;

    switch (item.type) {
      case FurnitureType.Desk:
        g.roundRect(px + 4, py + 6, s - 8, s - 12, 2);
        g.fill(color);
        g.rect(px + s / 2 - 5, py + 4, 10, 6);
        g.fill(0x4d9fff);
        break;
      case FurnitureType.Chair:
        g.circle(px + s / 2, py + s / 2, 5);
        g.fill(color);
        break;
      case FurnitureType.Whiteboard:
        g.rect(px + 2, py + 4, s - 4, s - 8);
        g.fill(color);
        g.rect(px + 2, py + 4, s - 4, s - 8);
        g.stroke({ width: 1, color: 0x8899aa });
        break;
      case FurnitureType.ServerRack:
        g.roundRect(px + 4, py + 2, s - 8, s - 4, 2);
        g.fill(color);
        for (let i = 0; i < 3; i++) {
          g.circle(px + 10 + i * 5, py + s / 2, 1.5);
          g.fill(i === 1 ? 0x3ddc84 : 0x4d9fff);
        }
        break;
      case FurnitureType.CoffeeMachine:
        g.roundRect(px + 6, py + 4, s - 12, s - 8, 3);
        g.fill(color);
        g.moveTo(px + s / 2 - 3, py + 2);
        g.bezierCurveTo(px + s / 2 - 3, py - 2, px + s / 2 + 3, py, px + s / 2 + 3, py - 3);
        g.stroke({ width: 1, color: 0x888888, alpha: 0.5 });
        break;
      case FurnitureType.Plant:
        g.roundRect(px + s / 2 - 5, py + s - 10, 10, 8, 2);
        g.fill(0x8b6914);
        g.circle(px + s / 2, py + s / 2 - 2, 7);
        g.fill(color);
        g.circle(px + s / 2 - 4, py + s / 2, 5);
        g.fill(0x34d399);
        break;
      case FurnitureType.Bookshelf:
        g.rect(px + 2, py + 2, s - 4, s - 4);
        g.fill(color);
        for (let i = 0; i < 4; i++) {
          const bookColors = [0xff6eb4, 0x4d9fff, 0x3ddc84, 0xffb647];
          g.rect(px + 5 + i * 5, py + 4, 4, s - 10);
          g.fill(bookColors[i]);
        }
        break;
      default:
        g.rect(px + 4, py + 4, s - 8, s - 8);
        g.fill(color);
    }
  }

  getRoomAt(tileX: number, tileY: number): string | null {
    for (const room of this.mapData.rooms) {
      if (
        tileX >= room.x && tileX < room.x + room.width &&
        tileY >= room.y && tileY < room.y + room.height
      ) {
        return room.id;
      }
    }
    return null;
  }

  getDesks() {
    return this.mapData.desks;
  }

  getSpawnPoint() {
    return this.mapData.spawnPoint;
  }
}
