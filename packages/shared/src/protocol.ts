// WebSocket message protocol

import type { VentureEvent } from './events';
import type { Agent, Task, Message, CodeChange } from './types';

export type WSMessage =
  | { type: 'event'; payload: VentureEvent }
  | { type: 'snapshot'; payload: Snapshot }
  | { type: 'ping' }
  | { type: 'pong' };

export interface Snapshot {
  agents: Agent[];
  tasks: Task[];
  messages: Message[];
  codeChanges: CodeChange[];
}
