import type { ServerWebSocket } from 'bun';
import type { WSMessage, VentureEvent, Snapshot } from '@ventureos/shared';
import { logger } from '../logger';

export interface WSData {
  id: string;
}

const clients = new Set<ServerWebSocket<WSData>>();

export function getClients(): Set<ServerWebSocket<WSData>> {
  return clients;
}

export function handleOpen(ws: ServerWebSocket<WSData>, snapshot: Snapshot): void {
  clients.add(ws);
  const msg: WSMessage = { type: 'snapshot', payload: snapshot };
  ws.sendText(JSON.stringify(msg));
  logger.info({ clientCount: clients.size }, 'WebSocket client connected');
}

export function handleMessage(ws: ServerWebSocket<WSData>, message: string | Buffer): void {
  try {
    const parsed = JSON.parse(typeof message === 'string' ? message : message.toString()) as WSMessage;
    if (parsed.type === 'ping') {
      ws.sendText(JSON.stringify({ type: 'pong' }));
    }
  } catch {
    // ignore malformed messages
  }
}

export function handleClose(ws: ServerWebSocket<WSData>): void {
  clients.delete(ws);
  logger.info({ clientCount: clients.size }, 'WebSocket client disconnected');
}

export function broadcastEvent(event: VentureEvent): void {
  const msg: WSMessage = { type: 'event', payload: event };
  const data = JSON.stringify(msg);
  for (const client of clients) {
    client.sendText(data);
  }
}
