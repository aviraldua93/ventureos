import type { VentureEvent } from '@ventureos/shared';

export type PlaybackMode = 'live' | 'replay';

export interface TimeTravelState {
  mode: PlaybackMode;
  currentTime: number;
  playbackSpeed: number;
  isPlaying: boolean;
  minTime: number;
  maxTime: number;
  eventCount: number;
}

type TimeTravelListener = (state: TimeTravelState) => void;

/**
 * Time-travel controller: maintains a sorted event log,
 * supports scrubbing to any timestamp, and replaying events
 * at configurable speeds.
 */
export class TimeTravelController {
  private events: VentureEvent[] = [];
  private _mode: PlaybackMode = 'live';
  private _currentTime = Date.now();
  private _playbackSpeed = 1;
  private _isPlaying = false;
  private _replayIndex = 0;
  private listeners = new Set<TimeTravelListener>();
  private onReplayEvent: ((event: VentureEvent) => void) | null = null;

  get state(): TimeTravelState {
    return {
      mode: this._mode,
      currentTime: this._currentTime,
      playbackSpeed: this._playbackSpeed,
      isPlaying: this._isPlaying,
      minTime: this.events[0]?.timestamp ?? Date.now(),
      maxTime: this.events[this.events.length - 1]?.timestamp ?? Date.now(),
      eventCount: this.events.length,
    };
  }

  setReplayCallback(cb: (event: VentureEvent) => void) {
    this.onReplayEvent = cb;
  }

  subscribe(listener: TimeTravelListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.state;
    for (const listener of this.listeners) {
      listener(state);
    }
  }

  addEvent(event: VentureEvent) {
    this.events.push(event);
    // Keep sorted by timestamp
    if (this.events.length > 1) {
      const prev = this.events[this.events.length - 2];
      if (event.timestamp < prev.timestamp) {
        this.events.sort((a, b) => a.timestamp - b.timestamp);
      }
    }

    if (this._mode === 'live') {
      this._currentTime = event.timestamp;
      this.notify();
    }
  }

  /** Get all events up to a given timestamp */
  getEventsUpTo(timestamp: number): VentureEvent[] {
    return this.events.filter(e => e.timestamp <= timestamp);
  }

  /** Get event density for timeline heatmap (bucketed counts) */
  getEventDensity(bucketCount = 100): number[] {
    if (this.events.length === 0) return new Array(bucketCount).fill(0);

    const min = this.events[0].timestamp;
    const max = this.events[this.events.length - 1].timestamp;
    const range = max - min || 1;
    const buckets = new Array(bucketCount).fill(0) as number[];

    for (const event of this.events) {
      const idx = Math.min(
        Math.floor(((event.timestamp - min) / range) * bucketCount),
        bucketCount - 1,
      );
      buckets[idx]++;
    }

    return buckets;
  }

  switchToLive() {
    this._mode = 'live';
    this._isPlaying = false;
    this._currentTime = this.events[this.events.length - 1]?.timestamp ?? Date.now();
    this.notify();
  }

  switchToReplay() {
    this._mode = 'replay';
    this._isPlaying = false;
    this._currentTime = this.events[0]?.timestamp ?? Date.now();
    this._replayIndex = 0;
    this.notify();
  }

  play() {
    this._isPlaying = true;
    this.notify();
  }

  pause() {
    this._isPlaying = false;
    this.notify();
  }

  setSpeed(speed: number) {
    this._playbackSpeed = speed;
    this.notify();
  }

  scrubTo(timestamp: number) {
    this._mode = 'replay';
    this._currentTime = timestamp;
    this._isPlaying = false;

    // Find replay index
    this._replayIndex = 0;
    for (let i = 0; i < this.events.length; i++) {
      if (this.events[i].timestamp <= timestamp) {
        this._replayIndex = i + 1;
      } else {
        break;
      }
    }

    this.notify();
  }

  /** Called each frame to advance replay time */
  update(dt: number) {
    if (this._mode !== 'replay' || !this._isPlaying) return;
    if (this.events.length === 0) return;

    this._currentTime += dt * this._playbackSpeed;

    // Emit events that fall within the new time window
    while (
      this._replayIndex < this.events.length &&
      this.events[this._replayIndex].timestamp <= this._currentTime
    ) {
      if (this.onReplayEvent) {
        this.onReplayEvent(this.events[this._replayIndex]);
      }
      this._replayIndex++;
    }

    // Stop at end
    const maxTime = this.events[this.events.length - 1].timestamp;
    if (this._currentTime >= maxTime) {
      this._currentTime = maxTime;
      this._isPlaying = false;
    }

    this.notify();
  }
}
