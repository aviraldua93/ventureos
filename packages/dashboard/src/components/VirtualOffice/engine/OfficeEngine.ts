import { Application, Container, Graphics } from 'pixi.js';
import { Camera } from './Camera';
import { TileMap } from './TileMap';
import { SpriteManager } from './SpriteManager';
import { PathFinder } from './PathFinder';
import { TimeTravelController } from './TimeTravelController';
import type { OfficeMap } from '../maps/MapSchema';

export interface OfficeEngineOptions {
  canvas: HTMLCanvasElement;
  mapData: OfficeMap;
  width: number;
  height: number;
}

/**
 * Main game engine coordinating Pixi.js rendering.
 * Layers: floor → furniture → characters → effects → UI
 */
export class OfficeEngine {
  app: Application;
  camera: Camera;
  tileMap: TileMap;
  sprites: SpriteManager;
  pathFinder: PathFinder;
  timeTravel: TimeTravelController;

  private worldContainer: Container;
  private effectsContainer: Container;
  private mapData: OfficeMap;
  private _ready = false;
  private _destroyed = false;

  constructor(private options: OfficeEngineOptions) {
    this.app = new Application();
    this.worldContainer = new Container();
    this.worldContainer.label = 'world';
    this.effectsContainer = new Container();
    this.effectsContainer.label = 'effects';
    this.mapData = options.mapData;

    this.tileMap = new TileMap(options.mapData);
    this.sprites = new SpriteManager(options.mapData.tileSize);
    this.pathFinder = new PathFinder(options.mapData.tiles);
    this.timeTravel = new TimeTravelController();
    this.camera = new Camera(this.worldContainer, options.width, options.height);
  }

  async init(): Promise<void> {
    if (this._destroyed) return;

    await this.app.init({
      canvas: this.options.canvas,
      width: this.options.width,
      height: this.options.height,
      background: 0x0a0e14,
      antialias: false,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
    });

    // Build layer hierarchy
    this.worldContainer.addChild(this.tileMap.container);
    this.worldContainer.addChild(this.sprites.container);
    this.worldContainer.addChild(this.effectsContainer);
    this.app.stage.addChild(this.worldContainer);

    // Center camera on office
    const centerX = (this.mapData.width * this.mapData.tileSize) / 2;
    const centerY = (this.mapData.height * this.mapData.tileSize) / 2;
    this.camera.centerOn(centerX, centerY);

    // Auto-fit zoom
    const fitZoom = Math.min(
      this.options.width / (this.mapData.width * this.mapData.tileSize),
      this.options.height / (this.mapData.height * this.mapData.tileSize),
    ) * 0.9;
    this.camera.setZoom(fitZoom);

    // Game loop
    this.app.ticker.add((ticker) => {
      if (this._destroyed) return;
      const dt = ticker.deltaMS;
      this.camera.update(dt);
      this.sprites.update(dt);
      this.timeTravel.update(dt);
    });

    this._ready = true;
  }

  get ready(): boolean {
    return this._ready;
  }

  resize(width: number, height: number) {
    if (this._destroyed) return;
    this.app.renderer.resize(width, height);
    this.camera.resize(width, height);
  }

  /** Spawn effects (sparkles, particles) at a tile position */
  addEffect(tileX: number, tileY: number, type: 'sparkle' | 'code' | 'error') {
    const ts = this.mapData.tileSize;
    const g = new Graphics();
    const px = tileX * ts + ts / 2;
    const py = tileY * ts + ts / 2;

    const colors = { sparkle: 0xffb647, code: 0x4d9fff, error: 0xff5c5c };
    const color = colors[type];

    // Simple particle burst
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const r = 8;
      g.circle(px + Math.cos(angle) * r, py + Math.sin(angle) * r, 2);
      g.fill({ color, alpha: 0.8 });
    }

    this.effectsContainer.addChild(g);

    // Auto-remove after 1s
    setTimeout(() => {
      if (!this._destroyed && g.parent) {
        this.effectsContainer.removeChild(g);
        g.destroy();
      }
    }, 1000);
  }

  destroy() {
    this._destroyed = true;
    this._ready = false;
    try {
      this.app.destroy(true, { children: true });
    } catch {
      // Ignore errors during cleanup
    }
  }
}
