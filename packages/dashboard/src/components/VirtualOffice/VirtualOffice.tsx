import { useRef, useEffect, useState, useCallback } from 'react';
import { useVentureStore } from '../../store';
import { OfficeEngine } from './engine/OfficeEngine';
import { defaultOffice } from './maps/default-office';
import { useAgentSync } from './bindings/useAgentSync';
import { TimeScrubber } from './hud/TimeScrubber';
import { AgentTooltip } from './hud/AgentTooltip';
import { MiniMap } from './hud/MiniMap';
import { OfficeControls } from './hud/OfficeControls';
import type { Agent } from '@ventureos/shared';
import css from './VirtualOffice.module.css';

export function VirtualOffice() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<OfficeEngine | null>(null);
  const [ready, setReady] = useState(false);
  const [tooltipAgent, setTooltipAgent] = useState<Agent | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const agents = useVentureStore(s => s.agents);

  // Initialize engine with error handling
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let destroyed = false;

    const initEngine = async () => {
      try {
        const rect = container.getBoundingClientRect();
        const engine = new OfficeEngine({
          canvas,
          mapData: defaultOffice,
          width: rect.width || 800,
          height: rect.height || 600,
        });

        if (destroyed) { engine.destroy(); return; }
        await engine.init();
        if (destroyed) { engine.destroy(); return; }

        engineRef.current = engine;
        setReady(true);
        setError(null);
      } catch (err) {
        console.error('[VirtualOffice] Init failed:', err);
        if (!destroyed) {
          setError(err instanceof Error ? err.message : 'Failed to initialize');
        }
      }
    };

    initEngine();

    return () => {
      destroyed = true;
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
      setReady(false);
    };
  }, []);

  // Handle resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !engineRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          engineRef.current?.resize(width, height);
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [ready]);

  // Mouse interaction for camera pan + zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !engineRef.current) return;

    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !engineRef.current) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      engineRef.current.camera.pan(-dx, -dy);
      lastX = e.clientX;
      lastY = e.clientY;

      handleHover(e);
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      engineRef.current?.camera.zoomAt(e.deltaY, e.offsetX, e.offsetY);
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [ready]);

  // Agent sync
  useAgentSync(engineRef.current);

  // Hover handler for agent tooltips
  const handleHover = useCallback((e: MouseEvent) => {
    if (!engineRef.current?.ready) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const cam = engineRef.current.camera.state;
    const worldX = (screenX - rect.width / 2 + cam.x * cam.zoom) / cam.zoom;
    const worldY = (screenY - rect.height / 2 + cam.y * cam.zoom) / cam.zoom;

    const sprites = engineRef.current.sprites.getAllSprites();
    let found = false;
    for (const sprite of sprites) {
      const sx = sprite.renderX ?? (sprite.tileX * 32 + 16);
      const sy = sprite.renderY ?? (sprite.tileY * 32 + 16);
      const dist = Math.sqrt((worldX - sx) ** 2 + (worldY - sy) ** 2);

      if (dist < 20) {
        const agent = agents.find(a => a.id === sprite.id);
        if (agent) {
          setTooltipAgent(agent);
          setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          setTooltipVisible(true);
          found = true;
          break;
        }
      }
    }

    if (!found) {
      setTooltipVisible(false);
    }
  }, [agents]);

  // Non-drag hover
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMove = (e: MouseEvent) => {
      if (e.buttons === 0) handleHover(e);
    };
    canvas.addEventListener('mousemove', onMove);
    return () => canvas.removeEventListener('mousemove', onMove);
  }, [handleHover]);

  return (
    <div className={css.container} ref={containerRef} data-testid="virtual-office">
      <canvas ref={canvasRef} className={css.canvas} />

      {!ready && !error && (
        <div className={css.loadingState}>
          <div className={css.loadingSpinner} />
          <span>Initializing Virtual Office…</span>
        </div>
      )}

      {error && (
        <div className={css.loadingState}>
          <span style={{ fontSize: '2rem' }}>⚠️</span>
          <span style={{ fontWeight: 600 }}>Virtual Office Error</span>
          <span style={{ fontSize: '12px', opacity: 0.7, fontFamily: 'var(--font-mono)' }}>{error}</span>
        </div>
      )}

      {ready && agents.length === 0 && (
        <div className={css.emptyState}>
          <span className={css.emptyIcon}>🏢</span>
          <span className={css.emptyText}>Office is empty</span>
          <span className={css.emptyHint}>Agents will appear as they register</span>
        </div>
      )}

      {ready && (
        <div className={css.hudOverlay}>
          <OfficeControls engine={engineRef.current} agents={agents} />
          <MiniMap engine={engineRef.current} mapData={defaultOffice} />
          <AgentTooltip
            agent={tooltipAgent}
            x={tooltipPos.x}
            y={tooltipPos.y}
            visible={tooltipVisible}
          />
          <TimeScrubber engine={engineRef.current} />
        </div>
      )}
    </div>
  );
}
