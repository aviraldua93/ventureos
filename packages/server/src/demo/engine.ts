import type { EventStore } from '../events/store';
import type { VentureEvent } from '@ventureos/shared';

export interface DemoEvent {
  delayMs: number;
  event: VentureEvent;
}

export interface DemoProgress {
  current: number;
  total: number;
  pct: number;
}

export interface DemoStatus {
  running: boolean;
  paused: boolean;
  speed: number;
  progress: DemoProgress;
}

export class DemoEngine {
  private scenario: DemoEvent[] = [];
  private store: EventStore;
  private currentIndex = 0;
  private speed = 1;
  private running = false;
  private paused = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(store: EventStore) {
    this.store = store;
  }

  loadScenario(scenario: DemoEvent[]): void {
    this.scenario = scenario;
    this.currentIndex = 0;
  }

  start(speed = 1): void {
    if (this.running) return;
    this.speed = speed;
    this.running = true;
    this.paused = false;
    this.currentIndex = 0;
    this.store.clear();
    this.scheduleNext();
  }

  pause(): void {
    if (!this.running || this.paused) return;
    this.paused = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  resume(): void {
    if (!this.running || !this.paused) return;
    this.paused = false;
    this.scheduleNext();
  }

  setSpeed(multiplier: number): void {
    this.speed = multiplier;
    if (this.running && !this.paused && this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
      this.scheduleNext();
    }
  }

  restart(): void {
    this.stop();
    this.store.clear();
    this.currentIndex = 0;
    this.running = true;
    this.paused = false;
    this.scheduleNext();
  }

  stop(): void {
    this.running = false;
    this.paused = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  getProgress(): DemoProgress {
    const total = this.scenario.length;
    const current = this.currentIndex;
    return {
      current,
      total,
      pct: total === 0 ? 0 : Math.round((current / total) * 100),
    };
  }

  getStatus(): DemoStatus {
    return {
      running: this.running,
      paused: this.paused,
      speed: this.speed,
      progress: this.getProgress(),
    };
  }

  private scheduleNext(): void {
    if (!this.running || this.paused) return;
    if (this.currentIndex >= this.scenario.length) {
      this.running = false;
      return;
    }

    const entry = this.scenario[this.currentIndex];
    const delay = entry.delayMs / this.speed;

    this.timer = setTimeout(async () => {
      if (!this.running || this.paused) return;

      const ev = { ...entry.event, timestamp: Date.now() };
      await this.store.append(ev);
      this.currentIndex++;
      this.scheduleNext();
    }, delay);
  }
}
