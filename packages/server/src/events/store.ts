import type { VentureEvent } from '@ventureos/shared';
import { appendFile } from 'fs/promises';

type EventSubscriber = (event: VentureEvent) => void;

const JSONL_PATH = 'events.jsonl';

export class EventStore {
  private events: VentureEvent[] = [];
  private subscribers: Set<EventSubscriber> = new Set();
  private persistToFile: boolean;

  constructor(options?: { persist?: boolean }) {
    this.persistToFile = options?.persist ?? false;
  }

  async append(event: VentureEvent): Promise<void> {
    this.events.push(event);

    if (this.persistToFile) {
      await appendFile(JSONL_PATH, JSON.stringify(event) + '\n');
    }

    for (const subscriber of this.subscribers) {
      subscriber(event);
    }
  }

  getAll(): VentureEvent[] {
    return [...this.events];
  }

  subscribe(callback: EventSubscriber): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  get count(): number {
    return this.events.length;
  }
}
