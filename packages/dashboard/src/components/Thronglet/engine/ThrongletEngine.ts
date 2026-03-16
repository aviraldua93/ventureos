import type { Agent, Task } from '@ventureos/shared';
import type { Creature } from './creatures';
import { drawCreature, speciesFromRole } from './creatures';
import { computeMood, notifyTaskCompleted } from './moods';
import { habitatTier, habitatBounds, renderHabitatToCanvas, type HabitatTier } from './habitat';

export interface ThrongletEngineOptions {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  onClick?: (creature: Creature | null) => void;
}

export class ThrongletEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private creatures: Map<string, Creature> = new Map();
  private habitatCanvas: HTMLCanvasElement | null = null;
  private currentTier: HabitatTier = 'cozy-room';
  private animFrame = 0;
  private startTime = 0;
  private destroyed = false;
  private cameraX = 0;
  private cameraY = 0;
  private cameraZoom = 1;
  private isDragging = false;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private onClick: ((creature: Creature | null) => void) | undefined;

  selectedCreatureId: string | null = null;

  constructor(opts: ThrongletEngineOptions) {
    this.canvas = opts.canvas;
    this.ctx = opts.canvas.getContext('2d')!;
    this.width = opts.width;
    this.height = opts.height;
    this.onClick = opts.onClick;
    this.startTime = performance.now() / 1000;

    this.rebuildHabitat(0);
    this.setupInput();
    this.loop();
  }

  // ── Public API ───────────────────────────────────────────────────────

  resize(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.canvas.width = w * devicePixelRatio;
    this.canvas.height = h * devicePixelRatio;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
  }

  sync(agents: Agent[], tasks: Task[]) {
    const tier = habitatTier(agents.length);
    if (tier !== this.currentTier) {
      this.rebuildHabitat(agents.length);
    }

    // Detect completed tasks for celebration
    for (const creature of this.creatures.values()) {
      const agentTasks = tasks.filter(t => t.assigneeId === creature.id);
      const doneTasks = agentTasks.filter(t => t.status === 'done');
      if (doneTasks.length > 0) {
        notifyTaskCompleted(creature.id);
      }
    }

    const bounds = habitatBounds(tier);
    const padding = 40;

    // Sync creatures
    const seen = new Set<string>();
    for (const agent of agents) {
      seen.add(agent.id);
      let c = this.creatures.get(agent.id);
      if (!c) {
        c = {
          id: agent.id,
          name: agent.name.split(' ')[0], // short name
          species: speciesFromRole(agent.role),
          mood: computeMood(agent, tasks),
          x: bounds.left + padding + Math.random() * (bounds.width - padding * 2),
          y: bounds.top + padding + 30 + Math.random() * (bounds.height - padding * 2 - 30),
          targetX: 0,
          targetY: 0,
          vx: 0,
          vy: 0,
          bobPhase: Math.random() * Math.PI * 2,
          emoteTimer: 0,
          scale: 1,
          facing: Math.random() > 0.5 ? 1 : -1,
          wanderTimer: Math.random() * 3,
          petFlash: 0,
        };
        c.targetX = c.x;
        c.targetY = c.y;
        this.creatures.set(agent.id, c);
      } else {
        c.mood = computeMood(agent, tasks);
        c.name = agent.name.split(' ')[0];
        c.species = speciesFromRole(agent.role);
      }
    }

    // Remove old creatures
    for (const id of this.creatures.keys()) {
      if (!seen.has(id)) this.creatures.delete(id);
    }
  }

  petCreature(id: string) {
    const c = this.creatures.get(id);
    if (c) {
      c.petFlash = 1;
      notifyTaskCompleted(id); // celebrate!
    }
  }

  getCreatures(): Creature[] {
    return Array.from(this.creatures.values());
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.animFrame);
    this.removeInput();
  }

  // ── Private ──────────────────────────────────────────────────────────

  private rebuildHabitat(agentCount: number) {
    this.currentTier = habitatTier(agentCount);
    this.habitatCanvas = renderHabitatToCanvas(this.currentTier);
  }

  private loop = () => {
    if (this.destroyed) return;
    this.update();
    this.render();
    this.animFrame = requestAnimationFrame(this.loop);
  };

  private update() {
    const dt = 1 / 60;
    const bounds = habitatBounds(this.currentTier);
    const pad = 50;

    for (const c of this.creatures.values()) {
      // Wander
      c.wanderTimer -= dt;
      if (c.wanderTimer <= 0) {
        c.wanderTimer = 2 + Math.random() * 4;
        if (c.mood.mood !== 'sleeping') {
          c.targetX = bounds.left + pad + Math.random() * (bounds.width - pad * 2);
          c.targetY = bounds.top + pad + 30 + Math.random() * (bounds.height - pad * 2 - 30);
        }
      }

      // Move towards target
      if (c.mood.mood !== 'sleeping') {
        const dx = c.targetX - c.x;
        const dy = c.targetY - c.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 2) {
          const speed = c.mood.mood === 'overwhelmed' ? 40 : c.mood.mood === 'happy' ? 25 : 15;
          c.vx += (dx / dist) * speed * dt;
          c.vy += (dy / dist) * speed * dt;
          c.facing = dx > 0 ? 1 : -1;
        }
      }

      // Apply velocity with friction
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.vx *= 0.92;
      c.vy *= 0.92;

      // Clamp to bounds
      c.x = Math.max(bounds.left + pad, Math.min(bounds.right - pad, c.x));
      c.y = Math.max(bounds.top + pad + 30, Math.min(bounds.bottom - pad, c.y));

      // Decay pet flash
      if (c.petFlash > 0) {
        c.petFlash = Math.max(0, c.petFlash - dt * 2);
      }
    }
  }

  private render() {
    const ctx = this.ctx;
    const dpr = devicePixelRatio;
    ctx.save();
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, this.width, this.height);

    // Camera transform
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(this.cameraZoom, this.cameraZoom);
    ctx.translate(-this.cameraX, -this.cameraY);

    // Draw habitat background
    if (this.habitatCanvas) {
      const bounds = habitatBounds(this.currentTier);
      ctx.drawImage(this.habitatCanvas, bounds.left, bounds.top);
    }

    // Sort creatures by y for depth
    const time = performance.now() / 1000 - this.startTime;
    const sorted = Array.from(this.creatures.values()).sort((a, b) => a.y - b.y);

    for (const c of sorted) {
      drawCreature(ctx, c, time, c.id === this.selectedCreatureId);
    }

    ctx.restore();

    // Draw tier label
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.font = '11px "Inter", system-ui, sans-serif';
    ctx.textAlign = 'left';
    const tierLabels: Record<HabitatTier, string> = {
      'cozy-room': '🏠 Cozy Room',
      'workshop': '🏭 Workshop',
      'village': '🏘️ Village',
      'campus': '🏛️ Campus',
    };
    ctx.fillText(tierLabels[this.currentTier], 12, this.height - 12);
    ctx.restore();
  }

  // ── Input Handling ───────────────────────────────────────────────────
  private boundMouseDown = (e: MouseEvent) => this.onMouseDown(e);
  private boundMouseMove = (e: MouseEvent) => this.onMouseMove(e);
  private boundMouseUp = () => this.onMouseUp();
  private boundWheel = (e: WheelEvent) => this.onWheel(e);

  private setupInput() {
    this.canvas.addEventListener('mousedown', this.boundMouseDown);
    window.addEventListener('mousemove', this.boundMouseMove);
    window.addEventListener('mouseup', this.boundMouseUp);
    this.canvas.addEventListener('wheel', this.boundWheel, { passive: false });
  }

  private removeInput() {
    this.canvas.removeEventListener('mousedown', this.boundMouseDown);
    window.removeEventListener('mousemove', this.boundMouseMove);
    window.removeEventListener('mouseup', this.boundMouseUp);
    this.canvas.removeEventListener('wheel', this.boundWheel);
  }

  private onMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
  }

  private onMouseMove(e: MouseEvent) {
    if (!this.isDragging) return;
    const dx = e.clientX - this.lastMouseX;
    const dy = e.clientY - this.lastMouseY;
    this.cameraX -= dx / this.cameraZoom;
    this.cameraY -= dy / this.cameraZoom;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
  }

  private onMouseUp() {
    if (!this.isDragging) return;
    const moved = Math.abs(this.lastMouseX) + Math.abs(this.lastMouseY);
    if (moved < 5) {
      // It was a click, not a drag — handled in onClick below
    }
    this.isDragging = false;

    // Check for creature click
    const rect = this.canvas.getBoundingClientRect();
    const screenX = this.lastMouseX - rect.left;
    const screenY = this.lastMouseY - rect.top;

    // Convert screen to world
    const worldX = (screenX - this.width / 2) / this.cameraZoom + this.cameraX;
    const worldY = (screenY - this.height / 2) / this.cameraZoom + this.cameraY;

    let found: Creature | null = null;
    for (const c of this.creatures.values()) {
      const dist = Math.sqrt((worldX - c.x) ** 2 + (worldY - c.y) ** 2);
      if (dist < 25) {
        found = c;
        break;
      }
    }

    this.selectedCreatureId = found?.id ?? null;
    this.onClick?.(found);
  }

  private onWheel(e: WheelEvent) {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    this.cameraZoom = Math.max(0.3, Math.min(3, this.cameraZoom * factor));
  }
}
