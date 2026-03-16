import type { Projections } from '../events/projections';
import type { DemoEngine } from '../demo/engine';

export function createRouter(projections: Projections, demo?: DemoEngine) {
  return function handleRequest(req: Request): Response | null {
    const url = new URL(req.url);

    if (url.pathname === '/api/health') {
      return Response.json({ ok: true });
    }

    if (url.pathname === '/api/state') {
      return Response.json(projections.getSnapshot());
    }

    // Demo endpoints
    if (!demo) return null;

    if (url.pathname === '/api/demo/status' && req.method === 'GET') {
      return Response.json(demo.getStatus());
    }

    if (url.pathname === '/api/demo/start' && req.method === 'POST') {
      return (async () => {
        const body = await req.json().catch(() => ({})) as { speed?: number };
        demo.start(body.speed ?? 1);
        return Response.json({ ok: true });
      })();
    }

    if (url.pathname === '/api/demo/pause' && req.method === 'POST') {
      demo.pause();
      return Response.json({ ok: true });
    }

    if (url.pathname === '/api/demo/resume' && req.method === 'POST') {
      demo.resume();
      return Response.json({ ok: true });
    }

    if (url.pathname === '/api/demo/speed' && req.method === 'POST') {
      return (async () => {
        const body = await req.json().catch(() => ({})) as { speed?: number };
        demo.setSpeed(body.speed ?? 1);
        return Response.json({ ok: true });
      })();
    }

    if (url.pathname === '/api/demo/restart' && req.method === 'POST') {
      demo.restart();
      return Response.json({ ok: true });
    }

    return null;
  };
}
