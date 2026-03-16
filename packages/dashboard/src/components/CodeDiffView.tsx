import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVentureStore } from '../store';
import { Card } from './ui';
import css from './CodeDiffView.module.css';

const AGENT_COLORS = [
  'var(--agent-color-1)', 'var(--agent-color-2)', 'var(--agent-color-3)',
  'var(--agent-color-4)', 'var(--agent-color-5)', 'var(--agent-color-6)',
];

function getAgentColor(agentId: string): string {
  let hash = 0;
  for (let i = 0; i < agentId.length; i++) {
    hash = ((hash << 5) - hash + agentId.charCodeAt(i)) | 0;
  }
  return AGENT_COLORS[Math.abs(hash) % AGENT_COLORS.length];
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60_000) return 'just now';
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function diffStats(diff: string): { additions: number; deletions: number } {
  let additions = 0;
  let deletions = 0;
  for (const line of diff.split('\n')) {
    if (line.startsWith('+') && !line.startsWith('+++')) additions++;
    else if (line.startsWith('-') && !line.startsWith('---')) deletions++;
  }
  return { additions, deletions };
}

function getLineClass(line: string): string {
  if (line.startsWith('@@')) return css.lineHunk;
  if (line.startsWith('+')) return css.lineAdd;
  if (line.startsWith('-')) return css.lineDel;
  return '';
}

export function CodeDiffView() {
  const codeChanges = useVentureStore((s) => s.codeChanges);
  const agents = useVentureStore((s) => s.agents);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const agentMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of agents) map.set(a.id, a.name);
    return map;
  }, [agents]);

  const sorted = useMemo(
    () => [...codeChanges].sort((a, b) => b.timestamp - a.timestamp),
    [codeChanges],
  );

  const selected = useMemo(
    () => sorted.find((c) => c.id === selectedId) ?? null,
    [sorted, selectedId],
  );

  const handleSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  if (sorted.length === 0) {
    return (
      <div className={css.container}>
        <h2 className={css.heading}>📝 Code Diffs</h2>
        <div className={css.emptyState}>
          <span className={css.emptyIcon}>📂</span>
          <p className={css.emptyText}>No code changes yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={css.container}>
      <h2 className={css.heading}>📝 Code Diffs</h2>

      <div className={css.changeList}>
        {sorted.map((change) => {
          const { additions, deletions } = diffStats(change.diff);
          const agentName = agentMap.get(change.agentId) ?? change.agentId;
          const isActive = change.id === selectedId;
          const agentColor = getAgentColor(change.agentId);

          return (
            <motion.button
              key={change.id}
              className={`${css.changeItem} ${isActive ? css.changeItemActive : ''}`}
              onClick={() => handleSelect(change.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className={css.changeFilePath}>{change.filePath}</div>
              <div className={css.changeDesc}>{change.description}</div>
              <div className={css.changeMeta}>
                <span className={css.agentBadge}>
                  <span
                    className={css.agentDot}
                    style={{ backgroundColor: agentColor, boxShadow: `0 0 4px ${agentColor}` }}
                  />
                  {agentName}
                </span>
                <span className={css.stats}>
                  {additions > 0 && <span className={css.statAdd}>+{additions}</span>}
                  {deletions > 0 && <span className={css.statDel}>−{deletions}</span>}
                </span>
                <span className={css.timestamp}>{formatRelativeTime(change.timestamp)}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            <DiffViewer
              change={selected}
              agentName={agentMap.get(selected.agentId) ?? selected.agentId}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DiffViewerProps {
  change: { filePath: string; diff: string; description: string; agentId: string; timestamp: number };
  agentName: string;
}

function DiffViewer({ change, agentName }: DiffViewerProps) {
  const lines = change.diff.split('\n');
  const agentColor = getAgentColor(change.agentId);

  return (
    <Card className={css.viewer}>
      <div className={css.viewerHeader}>
        <div className={css.viewerFilePath}>{change.filePath}</div>
        <div className={css.viewerMeta}>
          <span className={css.agentBadge}>
            <span
              className={css.agentDot}
              style={{ backgroundColor: agentColor, boxShadow: `0 0 4px ${agentColor}` }}
            />
            {agentName}
          </span>
          <span className={css.timestamp}>{formatRelativeTime(change.timestamp)}</span>
        </div>
        <div className={css.viewerDesc}>{change.description}</div>
      </div>

      <pre className={css.diffPre}>
        <code>
          {lines.map((line, i) => (
            <div key={i} className={`${css.diffLine} ${getLineClass(line)}`}>
              <span className={css.lineNo}>{i + 1}</span>
              <span className={css.lineText}>{line}</span>
            </div>
          ))}
        </code>
      </pre>
    </Card>
  );
}
