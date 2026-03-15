import type { ServerWebSocket } from 'bun';
import type { WSMessage, VentureEvent, Snapshot } from '@ventureos/shared';

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
  console.log(`[ws] client connected (${clients.size} total)`);
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
  console.log(`[ws] client disconnected (${clients.size} total)`);
}

export function broadcastEvent(event: VentureEvent): void {
  const msg: WSMessage = { type: 'event', payload: event };
  const data = JSON.stringify(msg);
  for (const client of clients) {
    client.sendText(data);
  }
}
