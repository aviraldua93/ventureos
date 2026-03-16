import type { VentureEvent } from '@ventureos/shared';
import { EventStore } from './events/store';
import { Projections } from './events/projections';
import { createRouter } from './http/routes';
import { DemoEngine } from './demo/engine';
import { demoScenario } from './demo/scenario';
import { logger } from './logger';
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

// Initialize demo engine and auto-start so the office is alive on boot
const demo = new DemoEngine(store);
demo.loadScenario(demoScenario);
demo.start(1);

const router = createRouter(projections, demo);

// Broadcast new events to all WebSocket clients
store.subscribe((event) => {
  broadcastEvent(event);
});

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function withCors(res: Response): Response {
  for (const [k, v] of Object.entries(CORS_HEADERS)) {
    res.headers.set(k, v);
  }
  return res;
}

const server = Bun.serve<WSData>({
  port: PORT,

  fetch(req, server) {
    const url = new URL(req.url);

    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

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
        return withCors(Response.json({ ok: true, count: store.count }));
      })();
    }

    // HTTP routes
    const response = router(req);
    if (response) {
      if (response instanceof Promise) {
        return response.then(withCors);
      }
      return withCors(response);
    }

    // 404
    return withCors(new Response('Not Found', { status: 404 }));
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

logger.info({ port: PORT, version: '0.1.0' }, `VentureOS v0.1.0 running on http://localhost:${PORT}`);

export { server, store, projections, demo };
