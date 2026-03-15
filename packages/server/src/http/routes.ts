import type { Projections } from '../events/projections';

export function createRouter(projections: Projections) {
  return function handleRequest(req: Request): Response | null {
    const url = new URL(req.url);

    if (url.pathname === '/api/health') {
      return Response.json({ ok: true });
    }

    if (url.pathname === '/api/state') {
      return Response.json(projections.getSnapshot());
    }

    return null;
  };
}
