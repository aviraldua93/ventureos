import type { VentureEvent } from '@ventureos/shared';
import { EventStore } from './events/store';
import { Projections } from './events/projections';
import { createRouter } from './http/routes';
import {
  handleOpen,
  handleMessage,
  handleClose,
  broadcastEvent,
  type WSData,
} from './ws/server';

const PORT = Number(process.env.PORT) || 3000;

const store = new EventStore({ persist: false });
const projections = new Projections(store);
const router = createRouter(projections);

// Broadcast new events to all WebSocket clients
store.subscribe((event) => {
  broadcastEvent(event);
});

const server = Bun.serve<WSData>({
  port: PORT,

  fetch(req, server) {
    const url = new URL(req.url);

    // WebSocket upgrade
    if (url.pathname === '/ws') {
      const id = crypto.randomUUID();
      const upgraded = server.upgrade(req, { data: { id } });
      if (upgraded) return undefined;
      return new Response('WebSocket upgrade failed', { status: 400 });
    }

    // POST /api/events — ingest a new event
    if (url.pathname === '/api/events' && req.method === 'POST') {
      return (async () => {
        const event = (await req.json()) as VentureEvent;
        event.timestamp = event.timestamp || Date.now();
        await store.append(event);
        return Response.json({ ok: true, count: store.count });
      })();
    }

    // HTTP routes
    const response = router(req);
    if (response) return response;

    // 404
    return new Response('Not Found', { status: 404 });
  },

  websocket: {
    open(ws) {
      handleOpen(ws, projections.getSnapshot());
    },
    message(ws, message) {
      handleMessage(ws, message);
    },
    close(ws) {
      handleClose(ws);
    },
  },
});

console.log(`
  ╔═══════════════════════════════════════╗
  ║         🚀 VentureOS v0.1.0          ║
  ║   Mission Control for Agent Teams     ║
  ╠═══════════════════════════════════════╣
  ║  HTTP:  http://localhost:${PORT}         ║
  ║  WS:    ws://localhost:${PORT}/ws        ║
  ╚═══════════════════════════════════════╝
`);

export { server, store, projections };
