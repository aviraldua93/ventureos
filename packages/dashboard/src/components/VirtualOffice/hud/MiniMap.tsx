import { useRef, useEffect } from 'react';
import type { OfficeEngine } from '../engine/OfficeEngine';
import type { OfficeMap } from '../maps/MapSchema';
import { TileType } from '../maps/MapSchema';
import css from './MiniMap.module.css';

const AGENT_COLORS = [
  '#4d9fff', '#3ddc84', '#ff6eb4', '#ffb647', '#a78bfa',
  '#38bdf8', '#fb923c', '#f472b6', '#34d399', '#c084fc',
];

const TILE_FILLS: Record<TileType, string> = {
  [TileType.Wall]:   '#667788',
  [TileType.Window]: '#5ba8e0',
  [TileType.Floor]:  '#1e2d3d',
  [TileType.Door]:   '#3a7abf',
  [TileType.Empty]:  '#0d1117',
};

/** Minimap room floor tints — keyed by room type */
const ROOM_MINI_COLORS: Record<string, string> = {
  corner_office:    '#1a3050',
  meeting_room:     '#2a1e40',
  pm_war_room:      '#302818',
  open_office:      '#162e22',
  research_lab:     '#221838',
  qa_lab:           '#142830',
  testing_bay:      '#2a2018',
  community_lounge: '#14302a',
  break_room:       '#2a1828',
  lobby:            '#1e2428',
  server_room:      '#0e1420',
};

interface MiniMapProps {
  engine: OfficeEngine | null;
  mapData: OfficeMap;
}

export function MiniMap({ engine, mapData }: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = Math.min(canvas.width / mapData.width, canvas.height / mapData.height);

    const draw = () => {
      // Solid background fill — ensures canvas is never transparent/blank
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw tiles — uses mapData only, no engine dependency
      for (let y = 0; y < mapData.tiles.length; y++) {
        for (let x = 0; x < (mapData.tiles[y]?.length ?? 0); x++) {
          const tile = mapData.tiles[y][x];
          ctx.fillStyle = TILE_FILLS[tile] ?? '#0d1117';
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }

      // Room-specific floor color overlay
      for (const room of mapData.rooms) {
        const roomColor = ROOM_MINI_COLORS[room.type];
        if (roomColor) {
          ctx.fillStyle = roomColor;
          ctx.fillRect(room.x * scale, room.y * scale, room.width * scale, room.height * scale);
        }
      }

      // Draw room labels
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.font = `${Math.max(5, scale * 0.65)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const room of mapData.rooms) {
        const cx = (room.x + room.width / 2) * scale;
        const cy = (room.y + room.height / 2) * scale;
        ctx.fillText(room.name.slice(0, 8), cx, cy);
      }

      // Engine-dependent rendering: agents + camera viewport
      if (engine?.ready) {
        // Draw agent dots
        const sprites = engine.sprites.getAllSprites();
        sprites.forEach((sprite, i) => {
          const ax = sprite.tileX * scale + scale / 2;
          const ay = sprite.tileY * scale + scale / 2;
          const r = Math.max(2.5, scale * 0.45);

          // Glow
          ctx.globalAlpha = 0.35;
          ctx.fillStyle = AGENT_COLORS[i % AGENT_COLORS.length];
          ctx.beginPath();
          ctx.arc(ax, ay, r + 2, 0, Math.PI * 2);
          ctx.fill();

          // Solid dot
          ctx.globalAlpha = 1;
          ctx.beginPath();
          ctx.arc(ax, ay, r, 0, Math.PI * 2);
          ctx.fill();
        });

        // Camera viewport indicator
        const cam = engine.camera.state;
        const viewW = canvas.width;
        const viewH = canvas.height;
        // Convert camera world-space position to minimap pixel coords
        const ts = mapData.tileSize;
        const vpW = (viewW / cam.zoom) / ts * scale;
        const vpH = (viewH / cam.zoom) / ts * scale;
        const vpX = (cam.x / ts) * scale - vpW / 2;
        const vpY = (cam.y / ts) * scale - vpH / 2;

        ctx.strokeStyle = 'rgba(77, 159, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(vpX, vpY, vpW, vpH);
      }
    };

    const interval = setInterval(draw, 250);
    draw();

    return () => clearInterval(interval);
  }, [engine, engine?.ready, mapData]);

  return (
    <div className={css.minimap} data-testid="minimap">
      <canvas
        ref={canvasRef}
        className={css.minimapCanvas}
        width={160}
        height={120}
      />
      <span className={css.minimapLabel}>MINIMAP</span>
    </div>
  );
}
