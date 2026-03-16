import { Camera } from './Camera';
import { SpriteManager } from './SpriteManager';
import { PathFinder } from './PathFinder';
import { TimeTravelController } from './TimeTravelController';
import { TileType, FurnitureType, type OfficeMap, type FurniturePlacement } from '../maps/MapSchema';

export interface OfficeEngineOptions {
  canvas: HTMLCanvasElement;
  mapData: OfficeMap;
  width: number;
  height: number;
}

interface Effect {
  x: number;
  y: number;
  type: 'sparkle' | 'code' | 'error';
  startTime: number;
  duration: number;
}

const TILE_COLORS: Record<TileType, string> = {
  [TileType.Empty]:  '#0a0e14',
  [TileType.Floor]:  '#2a3544',
  [TileType.Wall]:   '#556677',
  [TileType.Door]:   '#4d9fff',
  [TileType.Window]: '#38bdf8',
};

const FURNITURE_COLORS: Record<FurnitureType, string> = {
  [FurnitureType.Desk]:         '#8b6914',
  [FurnitureType.Chair]:        '#444444',
  [FurnitureType.Whiteboard]:   '#e8edf4',
  [FurnitureType.ServerRack]:   '#1a2233',
  [FurnitureType.CoffeeMachine]:'#6b3a2a',
  [FurnitureType.Plant]:        '#3ddc84',
  [FurnitureType.Monitor]:      '#111820',
  [FurnitureType.Bookshelf]:    '#8b6914',
};

/**
 * Canvas2D office engine — no WebGL, no Pixi.js.
 * Renders pixel-art office with camera pan/zoom, agent sprites, and effects.
 */
export class OfficeEngine {
  camera: Camera;
  sprites: SpriteManager;
  pathFinder: PathFinder;
  timeTravel: TimeTravelController;
  tileMap: { getDesks: () => OfficeMap['desks']; getSpawnPoint: () => OfficeMap['spawnPoint']; getRoomAt: (x: number, y: number) => string | null };

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mapData: OfficeMap;
  private _ready = false;
  private _destroyed = false;
  private effects: Effect[] = [];
  private static MAX_EFFECTS = 30;
  private animFrameId: number | null = null;
  private lastTime = 0;
  private _width: number;
  private _height: number;
  // Pre-rendered tilemap for performance
  private tileMapCanvas: OffscreenCanvas | HTMLCanvasElement | null = null;

  constructor(private options: OfficeEngineOptions) {
    this.canvas = options.canvas;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    this.ctx = ctx;
    this.mapData = options.mapData;
    this._width = options.width;
    this._height = options.height;

    this.sprites = new SpriteManager(options.mapData.tileSize);
    this.pathFinder = new PathFinder(options.mapData.tiles);
    this.timeTravel = new TimeTravelController();
    this.camera = new Camera(null, options.width, options.height);

    // Lightweight tileMap accessor (replaces the Pixi TileMap class)
    const rooms = options.mapData.rooms;
    this.tileMap = {
      getDesks: () => options.mapData.desks,
      getSpawnPoint: () => options.mapData.spawnPoint,
      getRoomAt: (tileX: number, tileY: number) => {
        for (const room of rooms) {
          if (tileX >= room.x && tileX < room.x + room.width &&
              tileY >= room.y && tileY < room.y + room.height) {
            return room.id;
          }
        }
        return null;
      },
    };
  }

  async init(): Promise<void> {
    if (this._destroyed) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this._width * dpr;
    this.canvas.height = this._height * dpr;
    this.canvas.style.width = this._width + 'px';
    this.canvas.style.height = this._height + 'px';
    this.ctx.scale(dpr, dpr);

    // Pre-render the static tilemap
    this.prerenderTileMap();

    // Center camera on office
    const centerX = (this.mapData.width * this.mapData.tileSize) / 2;
    const centerY = (this.mapData.height * this.mapData.tileSize) / 2;
    this.camera.centerOn(centerX, centerY);

    // Auto-fit zoom
    const fitZoom = Math.min(
      this._width / (this.mapData.width * this.mapData.tileSize),
      this._height / (this.mapData.height * this.mapData.tileSize),
    ) * 0.9;
    this.camera.setZoom(fitZoom);

    this._ready = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  get ready(): boolean {
    return this._ready;
  }

  /** Pre-render the static tilemap + furniture to an offscreen canvas */
  private prerenderTileMap() {
    const { tiles, tileSize, furniture, rooms } = this.mapData;
    const w = this.mapData.width * tileSize;
    const h = this.mapData.height * tileSize;

    let offscreen: OffscreenCanvas | HTMLCanvasElement;
    try {
      offscreen = new OffscreenCanvas(w, h);
    } catch {
      offscreen = document.createElement('canvas');
      offscreen.width = w;
      offscreen.height = h;
    }
    const octx = offscreen.getContext('2d')!;

    // Draw tiles
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < (tiles[y]?.length ?? 0); x++) {
        const tile = tiles[y][x];
        const px = x * tileSize;
        const py = y * tileSize;
        octx.fillStyle = TILE_COLORS[tile];
        octx.fillRect(px, py, tileSize, tileSize);
        octx.strokeStyle = '#1e2a38';
        octx.lineWidth = 0.5;
        octx.strokeRect(px, py, tileSize, tileSize);
      }
    }

    // Room overlays
    octx.fillStyle = 'rgba(77, 159, 255, 0.04)';
    for (const room of rooms) {
      octx.fillRect(
        room.x * tileSize + 2, room.y * tileSize + 2,
        room.width * tileSize - 4, room.height * tileSize - 4,
      );
    }

    // Room labels
    octx.fillStyle = 'rgba(255,255,255,0.08)';
    octx.font = '9px monospace';
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    for (const room of rooms) {
      const cx = (room.x + room.width / 2) * tileSize;
      const cy = (room.y + room.height / 2) * tileSize;
      octx.fillText(room.name, cx, cy);
    }

    // Furniture
    for (const item of furniture) {
      this.drawFurniture(octx, item, tileSize);
    }

    this.tileMapCanvas = offscreen;
  }

  private drawFurniture(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, item: FurniturePlacement, s: number) {
    const px = item.x * s;
    const py = item.y * s;
    const color = FURNITURE_COLORS[item.type];

    ctx.fillStyle = color;
    switch (item.type) {
      case FurnitureType.Desk:
        this.roundRect(ctx, px + 4, py + 6, s - 8, s - 12, 2);
        ctx.fill();
        ctx.fillStyle = '#4d9fff';
        ctx.fillRect(px + s / 2 - 5, py + 4, 10, 6);
        break;
      case FurnitureType.Chair:
        ctx.beginPath();
        ctx.arc(px + s / 2, py + s / 2, 5, 0, Math.PI * 2);
        ctx.fill();
        break;
      case FurnitureType.Whiteboard:
        ctx.fillRect(px + 2, py + 4, s - 4, s - 8);
        ctx.strokeStyle = '#8899aa';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 2, py + 4, s - 4, s - 8);
        break;
      case FurnitureType.ServerRack:
        this.roundRect(ctx, px + 4, py + 2, s - 8, s - 4, 2);
        ctx.fill();
        const dotColors = ['#4d9fff', '#3ddc84', '#4d9fff'];
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = dotColors[i];
          ctx.beginPath();
          ctx.arc(px + 10 + i * 5, py + s / 2, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case FurnitureType.CoffeeMachine:
        this.roundRect(ctx, px + 6, py + 4, s - 12, s - 8, 3);
        ctx.fill();
        break;
      case FurnitureType.Plant:
        ctx.fillStyle = '#8b6914';
        this.roundRect(ctx, px + s / 2 - 5, py + s - 10, 10, 8, 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px + s / 2, py + s / 2 - 2, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(px + s / 2 - 4, py + s / 2, 5, 0, Math.PI * 2);
        ctx.fill();
        break;
      case FurnitureType.Bookshelf:
        ctx.fillRect(px + 2, py + 2, s - 4, s - 4);
        const bookColors = ['#ff6eb4', '#4d9fff', '#3ddc84', '#ffb647'];
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = bookColors[i];
          ctx.fillRect(px + 5 + i * 5, py + 4, 4, s - 10);
        }
        break;
      default:
        ctx.fillRect(px + 4, py + 4, s - 8, s - 8);
    }
  }

  private roundRect(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  private gameLoop = () => {
    if (this._destroyed) return;

    const now = performance.now();
    const dt = now - this.lastTime;
    this.lastTime = now;

    // Update logic
    this.camera.update(dt);
    this.sprites.update(dt);
    this.timeTravel.update(dt);

    // Render
    this.render(dt);

    this.animFrameId = requestAnimationFrame(this.gameLoop);
  };

  private render(_dt: number) {
    const ctx = this.ctx;
    const cam = this.camera.state;

    // Clear
    ctx.fillStyle = '#0a0e14';
    ctx.fillRect(0, 0, this._width, this._height);

    ctx.save();
    // Camera transform
    ctx.translate(this._width / 2 - cam.x * cam.zoom, this._height / 2 - cam.y * cam.zoom);
    ctx.scale(cam.zoom, cam.zoom);

    // Draw pre-rendered tilemap
    if (this.tileMapCanvas) {
      ctx.drawImage(this.tileMapCanvas as any, 0, 0);
    }

    // Draw agents
    const sprites = this.sprites.getAllSprites();
    const ts = this.mapData.tileSize;
    for (const sprite of sprites) {
      const sx = sprite.tileX * ts + ts / 2;
      const sy = sprite.tileY * ts + ts / 2;
      // Smooth position interpolation
      const renderX = sprite.renderX ?? sx;
      const renderY = sprite.renderY ?? sy;

      ctx.save();
      ctx.translate(renderX, renderY);

      // Animation offset
      const animY = this.getAnimOffset(sprite);
      ctx.translate(0, animY);

      // Emotion glow ring
      const glowColors: Record<string, string> = {
        busy: '#ff5c5c',          // red for busy
        thinking: '#a78bfa',      // purple pulse for thinking
        frustrated: '#ff5c5c',    // red for error/frustrated
        excited: '#ffb647',       // orange for excited
        focused: '#3ddc84',       // green for active/focused
        collaborating: '#4d9fff', // blue for collaborating
        neutral: '#666677',       // subtle gray for idle
      };
      const glow = glowColors[sprite.emotion] || null;
      if (glow) {
        const pulseRate = sprite.emotion === 'thinking' ? 300 : 500;
        ctx.globalAlpha = sprite.emotion === 'neutral'
          ? 0.12
          : 0.25 + Math.sin(performance.now() / pulseRate) * 0.1;
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Body
      const alpha = sprite.state === 'offline' ? 0.35 : 1;
      ctx.globalAlpha = alpha;

      // Head
      ctx.fillStyle = '#f0d6b0';
      ctx.beginPath();
      ctx.arc(0, -6, 5, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = sprite.color;
      ctx.fillRect(-5, -12, 10, 4);

      // Body
      ctx.fillStyle = sprite.color;
      this.roundRect(ctx, -6, -1, 12, 10, 2);
      ctx.fill();

      ctx.globalAlpha = 1;

      // Error mark
      if (sprite.state === 'error') {
        ctx.fillStyle = '#ff5c5c';
        ctx.beginPath();
        ctx.arc(8, -10, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', 8, -10);
      }

      // Emotion indicator
      if (sprite.emotion && sprite.emotion !== 'neutral') {
        const emotionIcons: Record<string, string> = {
          busy: '🔥', thinking: '💭', frustrated: '😤',
          excited: '⚡', focused: '🎯', collaborating: '🤝',
        };
        const icon = emotionIcons[sprite.emotion];
        if (icon) {
          ctx.font = '8px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(icon, -8, -14);
        }
      }

      // Name label
      ctx.font = '8px monospace';
      ctx.fillStyle = '#e8edf4';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText((sprite.name ?? '').split(' ')[0] || '?', 0, 12);

      // Speech bubble
      if (sprite.speechBubble) {
        const bubbleColors: Record<string, string> = {
          chat: '#e8edf4', blocker: '#ff5c5c', review: '#ffb647', task: '#4d9fff',
        };
        const bg = bubbleColors[sprite.speechBubble.type] ?? '#e8edf4';
        ctx.fillStyle = bg;
        this.roundRect(ctx, -12, -28, 24, 14, 4);
        ctx.fill();
        // Tail
        ctx.beginPath();
        ctx.moveTo(-3, -14);
        ctx.lineTo(0, -8);
        ctx.lineTo(3, -14);
        ctx.fill();
        // Dots
        const dotColor = sprite.speechBubble.type === 'chat' ? '#556677' : '#ffffff';
        ctx.fillStyle = dotColor;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(-6 + i * 6, -21, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }

    // Draw effects
    const now = performance.now();
    this.effects = this.effects.filter(e => now - e.startTime < e.duration);
    for (const effect of this.effects) {
      const age = (now - effect.startTime) / effect.duration;
      const alpha = 1 - age;
      const colors = { sparkle: '#ffb647', code: '#4d9fff', error: '#ff5c5c' };
      ctx.fillStyle = colors[effect.type];
      ctx.globalAlpha = alpha * 0.8;
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const r = 8 + age * 12;
        ctx.beginPath();
        ctx.arc(effect.x + Math.cos(angle) * r, effect.y + Math.sin(angle) * r, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  private getAnimOffset(sprite: { state: string; animFrame: number }): number {
    switch (sprite.state) {
      case 'idle': return Math.sin(sprite.animFrame * Math.PI / 2) * 1;
      case 'walking': return -Math.abs(Math.sin(sprite.animFrame * Math.PI / 2)) * 2;
      case 'typing': return 0;
      case 'talking': return Math.sin(sprite.animFrame * Math.PI / 2) * 1.5;
      default: return 0;
    }
  }

  resize(width: number, height: number) {
    if (this._destroyed) return;
    this._width = width;
    this._height = height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.camera.resize(width, height);
  }

  addEffect(tileX: number, tileY: number, type: 'sparkle' | 'code' | 'error') {
    if (this.effects.length >= OfficeEngine.MAX_EFFECTS) return;
    const ts = this.mapData.tileSize;
    this.effects.push({
      x: tileX * ts + ts / 2,
      y: tileY * ts + ts / 2,
      type,
      startTime: performance.now(),
      duration: 1000,
    });
  }

  destroy() {
    this._destroyed = true;
    this._ready = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.tileMapCanvas = null;
  }
}
