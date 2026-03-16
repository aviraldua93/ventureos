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

  const agents = useVentureStore(s => s.agents);

  // Initialize engine
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();

    const engine = new OfficeEngine({
      canvas,
      mapData: defaultOffice,
      width: rect.width || 800,
      height: rect.height || 600,
    });

    engineRef.current = engine;

    engine.init().then(() => {
      setReady(true);
    });

    return () => {
      engineRef.current = null;
      engine.destroy();
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

      // Check hover on agents
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

    // Convert screen coords to world coords
    const cam = engineRef.current.camera.state;
    const worldContainer = engineRef.current.app.stage.children[0];
    if (!worldContainer) return;

    const worldX = (screenX - worldContainer.x) / cam.zoom;
    const worldY = (screenY - worldContainer.y) / cam.zoom;

    // Check proximity to any agent sprite
    const sprites = engineRef.current.sprites.getAllSprites();
    let found = false;
    for (const sprite of sprites) {
      const sx = sprite.container.x;
      const sy = sprite.container.y;
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
    <div className={css.container} ref={containerRef}>
      <canvas ref={canvasRef} className={css.canvas} />

      {!ready && (
        <div className={css.loadingState}>
          <div className={css.loadingSpinner} />
          <span>Initializing Virtual Office…</span>
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
