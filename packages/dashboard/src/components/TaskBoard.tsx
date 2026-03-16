import { useMemo } from 'react';
import { useVentureStore } from '../store';

const COLUMNS = [
  { key: 'backlog', label: 'Backlog', emoji: '📋' },
  { key: 'in_progress', label: 'In Progress', emoji: '🔄' },
  { key: 'review', label: 'Review', emoji: '👀' },
  { key: 'done', label: 'Done', emoji: '✅' },
] as const;

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

export function TaskBoard() {
  const tasks = useVentureStore((s) => s.tasks);
  const agents = useVentureStore((s) => s.agents);

  const agentMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const agent of agents) {
      map.set(agent.id, agent.name);
    }
    return map;
  }, [agents]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof tasks> = {
      backlog: [],
      in_progress: [],
      review: [],
      done: [],
    };
    for (const task of tasks) {
      groups[task.status]?.push(task);
    }
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => b.updatedAt - a.updatedAt);
    }
    return groups;
  }, [tasks]);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📋 Task Board</h2>
      <div style={styles.board}>
        {COLUMNS.map((col) => {
          const columnTasks = grouped[col.key] || [];
          return (
            <div key={col.key} style={styles.column}>
              <div style={styles.columnHeader}>
                <span>
                  {col.emoji} {col.label}
                </span>
                <span style={styles.count}>{columnTasks.length}</span>
              </div>
              <div style={styles.cardList}>
                {columnTasks.length === 0 ? (
                  <p style={styles.empty}>No tasks</p>
                ) : (
                  columnTasks.map((task) => {
                    const assigneeName = task.assigneeId
                      ? (agentMap.get(task.assigneeId) ?? 'Unknown')
                      : 'Unassigned';
                    const dotColor = task.assigneeId
                      ? getAgentColor(task.assigneeId)
                      : '#8b949e';
                    return (
                      <div key={task.id} style={styles.card}>
                        <div style={styles.cardTitle}>{task.title}</div>
                        <div style={styles.cardMeta}>
                          <span style={styles.assignee}>
                            <span
                              style={{
                                ...styles.dot,
                                backgroundColor: dotColor,
                                boxShadow: `0 0 4px ${dotColor}`,
                              }}
                            />
                            {assigneeName}
                          </span>
                          <span style={styles.timestamp}>
                            {formatRelativeTime(task.updatedAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '1.25rem',
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
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.75rem',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-secondary)',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    overflow: 'hidden',
  },
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.625rem 0.75rem',
    borderBottom: '1px solid var(--border)',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    flexShrink: 0,
  },
  count: {
    background: 'var(--bg-tertiary)',
    color: 'var(--text-secondary)',
    borderRadius: '10px',
    padding: '0.1rem 0.5rem',
    fontSize: '0.7rem',
    fontWeight: 600,
  },
  cardList: {
    flex: 1,
    overflowY: 'auto',
    padding: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  empty: {
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '1rem 0',
  },
  card: {
    background: '#16213e',
    border: '1px solid #0f3460',
    borderRadius: '6px',
    padding: '0.625rem 0.75rem',
    transition: 'transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease',
  },
  cardTitle: {
    fontSize: '0.825rem',
    fontWeight: 500,
    color: 'var(--text-primary)',
    marginBottom: '0.375rem',
    lineHeight: 1.3,
  },
  cardMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
  },
  assignee: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  dot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    display: 'inline-block',
    flexShrink: 0,
  },
  timestamp: {
    opacity: 0.7,
  },
};
