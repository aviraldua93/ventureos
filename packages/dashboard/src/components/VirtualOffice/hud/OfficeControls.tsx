import { useCallback } from 'react';
import type { Agent } from '@ventureos/shared';
import type { OfficeEngine } from '../engine/OfficeEngine';
import { defaultOffice } from '../maps/default-office';
import css from './OfficeControls.module.css';

interface OfficeControlsProps {
  engine: OfficeEngine | null;
  agents: Agent[];
}

export function OfficeControls({ engine, agents }: OfficeControlsProps) {
  const zoomIn = useCallback(() => {
    if (!engine) return;
    const { zoom } = engine.camera.state;
    engine.camera.setZoom(zoom * 1.3);
  }, [engine]);

  const zoomOut = useCallback(() => {
    if (!engine) return;
    const { zoom } = engine.camera.state;
    engine.camera.setZoom(zoom / 1.3);
  }, [engine]);

  const resetView = useCallback(() => {
    if (!engine) return;
    const mapW = defaultOffice.width * defaultOffice.tileSize;
    const mapH = defaultOffice.height * defaultOffice.tileSize;
    engine.camera.centerOn(mapW / 2, mapH / 2);
    engine.camera.setZoom(1);
    engine.camera.followAgent(null);
  }, [engine]);

  const handleFollow = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!engine) return;
    const val = e.target.value;
    engine.camera.followAgent(val || null);
  }, [engine]);

  return (
    <div className={css.controls} data-testid="office-controls">
      <button className={css.controlBtn} onClick={zoomIn} title="Zoom In" aria-label="Zoom in" data-testid="office-zoom-in">+</button>
      <button className={css.controlBtn} onClick={zoomOut} title="Zoom Out" aria-label="Zoom out" data-testid="office-zoom-out">−</button>
      <button className={css.controlBtn} onClick={resetView} title="Reset View" aria-label="Reset view" data-testid="office-reset-view">⌂</button>
      <div className={css.separator} />
      <select className={css.followSelect} onChange={handleFollow} defaultValue="" title="Follow Agent" aria-label="Follow agent" data-testid="office-follow-select">
        <option value="">👁 Free</option>
        {agents.map(a => (
          <option key={a.id} value={a.id}>{(a.name ?? a.id).split(' ')[0]}</option>
        ))}
      </select>
    </div>
  );
}
