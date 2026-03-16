export interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

export class Camera {
  private _x = 0;
  private _y = 0;
  private _zoom = 1;
  private _targetX = 0;
  private _targetY = 0;
  private _targetZoom = 1;
  private _following: string | null = null;
  private _followTargets: Map<string, { x: number; y: number }> = new Map();
  private _viewWidth: number;
  private _viewHeight: number;

  readonly minZoom = 0.3;
  readonly maxZoom = 3;
  private readonly lerpSpeed = 0.08;

  constructor(_container: unknown, viewWidth: number, viewHeight: number) {
    this._viewWidth = viewWidth;
    this._viewHeight = viewHeight;
  }

  get state(): CameraState {
    return { x: this._x, y: this._y, zoom: this._zoom };
  }

  resize(width: number, height: number) {
    this._viewWidth = width;
    this._viewHeight = height;
  }

  pan(dx: number, dy: number) {
    this._following = null;
    this._targetX += dx / this._zoom;
    this._targetY += dy / this._zoom;
  }

  zoomAt(delta: number, screenX: number, screenY: number) {
    const oldZoom = this._targetZoom;
    this._targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, oldZoom * (1 - delta * 0.001)));

    const worldX = (screenX - this._viewWidth / 2) / oldZoom + this._x;
    const worldY = (screenY - this._viewHeight / 2) / oldZoom + this._y;
    this._targetX = worldX - (screenX - this._viewWidth / 2) / this._targetZoom;
    this._targetY = worldY - (screenY - this._viewHeight / 2) / this._targetZoom;
  }

  setZoom(zoom: number) {
    this._targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
  }

  followAgent(agentId: string | null) {
    this._following = agentId;
  }

  updateAgentPosition(agentId: string, x: number, y: number) {
    this._followTargets.set(agentId, { x, y });
  }

  centerOn(worldX: number, worldY: number) {
    this._targetX = worldX;
    this._targetY = worldY;
  }

  update(_dt: number) {
    if (this._following) {
      const target = this._followTargets.get(this._following);
      if (target) {
        this._targetX = target.x;
        this._targetY = target.y;
      }
    }

    this._x += (this._targetX - this._x) * this.lerpSpeed;
    this._y += (this._targetY - this._y) * this.lerpSpeed;
    this._zoom += (this._targetZoom - this._zoom) * this.lerpSpeed;
  }
}
