import { TileType } from '../maps/MapSchema';

interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

/** A* pathfinding on the tile grid */
export class PathFinder {
  private grid: TileType[][];
  private width: number;
  private height: number;

  constructor(tiles: TileType[][]) {
    this.grid = tiles;
    this.height = tiles.length;
    this.width = tiles[0]?.length ?? 0;
  }

  private isWalkable(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false;
    const tile = this.grid[y][x];
    return tile === TileType.Floor || tile === TileType.Door;
  }

  private heuristic(ax: number, ay: number, bx: number, by: number): number {
    return Math.abs(ax - bx) + Math.abs(ay - by);
  }

  findPath(startX: number, startY: number, endX: number, endY: number): Array<{ x: number; y: number }> {
    if (!this.isWalkable(endX, endY)) {
      // Find nearest walkable tile
      const nearest = this.findNearestWalkable(endX, endY);
      if (!nearest) return [];
      endX = nearest.x;
      endY = nearest.y;
    }

    if (!this.isWalkable(startX, startY)) return [];
    if (startX === endX && startY === endY) return [{ x: endX, y: endY }];

    const open: Node[] = [];
    const closed = new Set<string>();
    const key = (x: number, y: number) => `${x},${y}`;

    const startNode: Node = {
      x: startX, y: startY,
      g: 0,
      h: this.heuristic(startX, startY, endX, endY),
      f: 0,
      parent: null,
    };
    startNode.f = startNode.g + startNode.h;
    open.push(startNode);

    const directions = [
      { dx: 0, dy: -1 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
    ];

    while (open.length > 0) {
      // Get node with lowest f
      open.sort((a, b) => a.f - b.f);
      const current = open.shift()!;

      if (current.x === endX && current.y === endY) {
        // Reconstruct path
        const path: Array<{ x: number; y: number }> = [];
        let node: Node | null = current;
        while (node) {
          path.unshift({ x: node.x, y: node.y });
          node = node.parent;
        }
        return path;
      }

      closed.add(key(current.x, current.y));

      for (const dir of directions) {
        const nx = current.x + dir.dx;
        const ny = current.y + dir.dy;

        if (!this.isWalkable(nx, ny) || closed.has(key(nx, ny))) continue;

        const g = current.g + 1;
        const existing = open.find(n => n.x === nx && n.y === ny);

        if (!existing) {
          const h = this.heuristic(nx, ny, endX, endY);
          open.push({ x: nx, y: ny, g, h, f: g + h, parent: current });
        } else if (g < existing.g) {
          existing.g = g;
          existing.f = g + existing.h;
          existing.parent = current;
        }
      }
    }

    return []; // No path found
  }

  private findNearestWalkable(x: number, y: number): { x: number; y: number } | null {
    for (let r = 1; r < Math.max(this.width, this.height); r++) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          if (Math.abs(dx) === r || Math.abs(dy) === r) {
            if (this.isWalkable(x + dx, y + dy)) {
              return { x: x + dx, y: y + dy };
            }
          }
        }
      }
    }
    return null;
  }
}
