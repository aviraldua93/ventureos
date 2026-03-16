import { useState, useMemo, useCallback } from 'react';
import { useVentureStore } from '../store';

const AGENT_COLORS = [
  '#58a6ff', '#3fb950', '#d29922', '#f85149',
  '#bc8cff', '#f778ba', '#79c0ff', '#56d364',
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

/** Count additions and deletions in a unified diff string. */
function diffStats(diff: string): { additions: number; deletions: number } {
  let additions = 0;
  let deletions = 0;
  for (const line of diff.split('\n')) {
    if (line.startsWith('+') && !line.startsWith('+++')) additions++;
    else if (line.startsWith('-') && !line.startsWith('---')) deletions++;
  }
  return { additions, deletions };
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

  // Newest first
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

  // --- Empty state ---
  if (sorted.length === 0) {
    return (
      <div style={styles.container}>
        <h2 style={styles.heading}>📝 Code Diffs</h2>
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>📂</span>
          <p style={styles.emptyText}>No code changes yet</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📝 Code Diffs</h2>

      {/* Change list */}
      <div style={styles.changeList}>
        {sorted.map((change) => {
          const { additions, deletions } = diffStats(change.diff);
          const agentName = agentMap.get(change.agentId) ?? change.agentId;
          const isActive = change.id === selectedId;
          return (
            <button
              key={change.id}
              style={{
                ...styles.changeItem,
                ...(isActive ? styles.changeItemActive : {}),
              }}
              onClick={() => handleSelect(change.id)}
            >
              <div style={styles.changeFilePath}>{change.filePath}</div>
              <div style={styles.changeDesc}>{change.description}</div>
              <div style={styles.changeMeta}>
                <span style={styles.agentBadge}>
                  <span
                    style={{
                      ...styles.dot,
                      backgroundColor: getAgentColor(change.agentId),
                      boxShadow: `0 0 4px ${getAgentColor(change.agentId)}`,
                    }}
                  />
                  {agentName}
                </span>
                <span style={styles.stats}>
                  {additions > 0 && (
                    <span style={styles.statAdd}>+{additions}</span>
                  )}
                  {deletions > 0 && (
                    <span style={styles.statDel}>−{deletions}</span>
                  )}
                </span>
                <span style={styles.timestamp}>
                  {formatRelativeTime(change.timestamp)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Diff viewer */}
      {selected && <DiffViewer change={selected} agentName={agentMap.get(selected.agentId) ?? selected.agentId} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Diff viewer sub-component
// ---------------------------------------------------------------------------

interface DiffViewerProps {
  change: { filePath: string; diff: string; description: string; agentId: string; timestamp: number };
  agentName: string;
}

function DiffViewer({ change, agentName }: DiffViewerProps) {
  const lines = change.diff.split('\n');

  return (
    <div style={styles.viewer}>
      {/* Header */}
      <div style={styles.viewerHeader}>
        <div style={styles.viewerFilePath}>{change.filePath}</div>
        <div style={styles.viewerMeta}>
          <span style={styles.agentBadge}>
            <span
              style={{
                ...styles.dot,
                backgroundColor: getAgentColor(change.agentId),
                boxShadow: `0 0 4px ${getAgentColor(change.agentId)}`,
              }}
            />
            {agentName}
          </span>
          <span style={styles.timestamp}>
            {formatRelativeTime(change.timestamp)}
          </span>
        </div>
        <div style={styles.viewerDesc}>{change.description}</div>
      </div>

      {/* Diff content */}
      <pre style={styles.diffPre}>
        <code>
          {lines.map((line, i) => (
            <div key={i} style={lineStyle(line)}>
              <span style={styles.lineNo}>{i + 1}</span>
              <span style={styles.lineText}>{line}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Line-level styling for diff content
// ---------------------------------------------------------------------------

function lineStyle(line: string): React.CSSProperties {
  if (line.startsWith('@@')) return { ...styles.diffLine, backgroundColor: 'rgba(56,139,253,0.15)', color: '#79c0ff' };
  if (line.startsWith('+')) return { ...styles.diffLine, backgroundColor: 'rgba(35,134,54,0.2)', color: '#3fb950' };
  if (line.startsWith('-')) return { ...styles.diffLine, backgroundColor: 'rgba(218,54,51,0.2)', color: '#f85149' };
  return styles.diffLine;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '1rem',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  heading: {
    fontSize: '1.1rem',
    marginBottom: '0.75rem',
    color: 'var(--text-primary)',
    flexShrink: 0,
  },

  // Empty state
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  emptyIcon: { fontSize: '2rem', opacity: 0.5 },
  emptyText: {
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
    fontStyle: 'italic',
  },

  // Change list
  changeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
    overflowY: 'auto',
    flexShrink: 0,
    maxHeight: '40%',
    paddingBottom: '0.25rem',
  },
  changeItem: {
    all: 'unset',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    padding: '0.5rem 0.625rem',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    background: 'var(--bg-secondary)',
    transition: 'background 0.15s, border-color 0.15s',
  },
  changeItemActive: {
    borderColor: 'var(--accent)',
    background: 'var(--bg-tertiary)',
  },
  changeFilePath: {
    fontSize: '0.8rem',
    fontWeight: 600,
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    color: 'var(--accent)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  changeDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  changeMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
  },

  // Shared
  agentBadge: { display: 'flex', alignItems: 'center', gap: '0.3rem' },
  dot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    display: 'inline-block',
    flexShrink: 0,
  },
  stats: { display: 'flex', gap: '0.35rem', marginLeft: 'auto' },
  statAdd: { color: '#3fb950', fontWeight: 600 },
  statDel: { color: '#f85149', fontWeight: 600 },
  timestamp: { opacity: 0.7, fontSize: '0.7rem' },

  // Diff viewer
  viewer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    marginTop: '0.5rem',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    overflow: 'hidden',
    minHeight: 0,
  },
  viewerHeader: {
    padding: '0.625rem 0.75rem',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-secondary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    flexShrink: 0,
  },
  viewerFilePath: {
    fontSize: '0.825rem',
    fontWeight: 600,
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    color: 'var(--text-primary)',
  },
  viewerMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
  },
  viewerDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontStyle: 'italic',
  },

  // Diff pre block
  diffPre: {
    flex: 1,
    margin: 0,
    padding: 0,
    overflowY: 'auto',
    overflowX: 'auto',
    background: '#0d1117',
    fontSize: '0.75rem',
    lineHeight: 1.6,
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  },
  diffLine: {
    display: 'flex',
    minHeight: '1.4em',
    paddingRight: '0.75rem',
  },
  lineNo: {
    display: 'inline-block',
    width: '3rem',
    textAlign: 'right',
    paddingRight: '0.75rem',
    color: 'var(--text-secondary)',
    opacity: 0.5,
    userSelect: 'none',
    flexShrink: 0,
  },
  lineText: {
    whiteSpace: 'pre',
  },
};
