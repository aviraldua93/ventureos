import { useRef, useEffect, useState, useCallback } from 'react';
import { useVentureStore } from '../../store';
import { ThrongletEngine } from './engine/ThrongletEngine';
import { ResourceBar } from './hud/ResourceBar';
import { CreaturePanel } from './hud/CreaturePanel';
import { habitatTier } from './engine/habitat';
import type { Creature } from './engine/creatures';
import type { Agent } from '@ventureos/shared';
import css from './ThrongletOffice.module.css';

const TIER_LABELS: Record<string, string> = {
  'cozy-room': 'Cozy Room',
  'workshop': 'Workshop',
  'village': 'Village',
  'campus': 'Campus',
};

export function ThrongletOffice() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ThrongletEngine | null>(null);
  const [selectedCreature, setSelectedCreature] = useState<Creature | null>(null);
  const [ready, setReady] = useState(false);

  const agents = useVentureStore(s => s.agents);
  const tasks = useVentureStore(s => s.tasks);

  const handleCreatureClick = useCallback((creature: Creature | null) => {
    setSelectedCreature(creature);
  }, []);

  // Initialize engine
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const engine = new ThrongletEngine({
      canvas,
      width: rect.width || 800,
      height: rect.height || 600,
      onClick: handleCreatureClick,
    });

    engine.resize(rect.width || 800, rect.height || 600);
    engineRef.current = engine;
    setReady(true);

    return () => {
      engine.destroy();
      engineRef.current = null;
      setReady(false);
    };
  }, [handleCreatureClick]);

  // Handle resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !engineRef.current) return;

    const observer = new ResizeObserver(entries => {
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

  // Sync agents → creatures
  useEffect(() => {
    engineRef.current?.sync(agents, tasks);
  }, [agents, tasks]);

  const handlePet = useCallback((id: string) => {
    engineRef.current?.petCreature(id);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedCreature(null);
    if (engineRef.current) {
      engineRef.current.selectedCreatureId = null;
    }
  }, []);

  const selectedAgent: Agent | null = selectedCreature
    ? agents.find(a => a.id === selectedCreature.id) ?? null
    : null;

  const tier = habitatTier(agents.length);

  return (
    <div className={css.container} data-testid="thronglet-office">
      <ResourceBar agents={agents} tasks={tasks} />

      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }} ref={containerRef}>
        <canvas ref={canvasRef} className={css.canvas} />

        {ready && agents.length === 0 && (
          <div className={css.emptyState}>
            <span className={css.emptyIcon}>🥚</span>
            <span className={css.emptyText}>The nursery is empty</span>
            <span className={css.emptyHint}>Creatures will hatch as agents register</span>
          </div>
        )}

        {ready && agents.length > 0 && (
          <div className={css.hudOverlay}>
            {/* Population counter */}
            <div className={css.populationBadge}>
              <span className={css.populationCount}>{agents.length}</span>
              <span className={css.populationLabel}>
                Throng
                <span className={css.populationSublabel}>{TIER_LABELS[tier]}</span>
              </span>
            </div>

            {/* Creature inspector panel */}
            <CreaturePanel
              creature={selectedCreature}
              agent={selectedAgent}
              tasks={tasks}
              onPet={handlePet}
              onClose={handleClosePanel}
            />
          </div>
        )}
      </div>
    </div>
  );
}
