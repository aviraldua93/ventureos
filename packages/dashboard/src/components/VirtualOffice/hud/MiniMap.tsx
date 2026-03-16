import { useRef, useEffect } from 'react';
import type { OfficeEngine } from '../engine/OfficeEngine';
import type { OfficeMap } from '../maps/MapSchema';
import { TileType } from '../maps/MapSchema';
import css from './MiniMap.module.css';

const AGENT_COLORS = [
  '#4d9fff', '#3ddc84', '#ff6eb4', '#ffb647', '#a78bfa',
  '#38bdf8', '#fb923c', '#f472b6', '#34d399', '#c084fc',
];

interface MiniMapProps {
  engine: OfficeEngine | null;
  mapData: OfficeMap;
}

export function MiniMap({ engine, mapData }: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!engine?.ready) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = Math.min(canvas.width / mapData.width, canvas.height / mapData.height);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw tiles
      for (let y = 0; y < mapData.tiles.length; y++) {
        for (let x = 0; x < (mapData.tiles[y]?.length ?? 0); x++) {
          const tile = mapData.tiles[y][x];
          if (tile === TileType.Wall || tile === TileType.Window) {
            ctx.fillStyle = '#556677';
          } else if (tile === TileType.Floor || tile === TileType.Door) {
            ctx.fillStyle = '#1a2233';
          } else {
            ctx.fillStyle = '#0a0e14';
          }
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }

      // Draw agent dots
      const sprites = engine.sprites.getAllSprites();
      sprites.forEach((sprite, i) => {
        ctx.fillStyle = AGENT_COLORS[i % AGENT_COLORS.length];
        ctx.beginPath();
        ctx.arc(
          sprite.tileX * scale + scale / 2,
          sprite.tileY * scale + scale / 2,
          Math.max(2, scale / 2),
          0,
          Math.PI * 2,
        );
        ctx.fill();
      });
    };

    const interval = setInterval(draw, 500);
    draw();

    return () => clearInterval(interval);
  }, [engine, mapData]);

  return (
    <div className={css.minimap}>
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
