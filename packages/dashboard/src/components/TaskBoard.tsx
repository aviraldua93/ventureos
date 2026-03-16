import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVentureStore } from '../store';
import { Card, Badge } from './ui';
import css from './TaskBoard.module.css';

const COLUMNS = [
  { key: 'backlog', label: 'Backlog', emoji: '📋', accent: css.columnBacklog },
  { key: 'in_progress', label: 'In Progress', emoji: '🔄', accent: css.columnInProgress },
  { key: 'review', label: 'Review', emoji: '👀', accent: css.columnReview },
  { key: 'done', label: 'Done', emoji: '✅', accent: css.columnDone },
] as const;

const AGENT_COLORS = [
  'var(--agent-color-1)', 'var(--agent-color-2)', 'var(--agent-color-3)',
  'var(--agent-color-4)', 'var(--agent-color-5)', 'var(--agent-color-6)',
  'var(--agent-color-7)', 'var(--agent-color-8)', 'var(--agent-color-9)',
  'var(--agent-color-10)',
];

function getAgentColor(agentId: string): string {
  let hash = 0;
  for (let i = 0; i < agentId.length; i++) {
    hash = ((hash << 5) - hash + agentId.charCodeAt(i)) | 0;
  }
  return AGENT_COLORS[Math.abs(hash) % AGENT_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
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

const STATUS_MAP: Record<string, 'active' | 'idle' | 'error' | 'offline'> = {
  backlog: 'offline',
  in_progress: 'active',
  review: 'idle',
  done: 'active',
};

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
    <div className={css.container}>
      <h2 className={css.heading}>📋 Task Board</h2>
      <div className={css.board}>
        {COLUMNS.map((col) => {
          const columnTasks = grouped[col.key] || [];
          return (
            <div key={col.key} className={`${css.column} ${col.accent}`}>
              <div className={css.columnHeader}>
                <span>
                  {col.emoji} {col.label}
                </span>
                <span className={css.count}>{columnTasks.length}</span>
              </div>
              <div className={css.cardList}>
                {columnTasks.length === 0 ? (
                  <p className={css.empty}>No tasks</p>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {columnTasks.map((task) => {
                      const assigneeName = task.assigneeId
                        ? (agentMap.get(task.assigneeId) ?? 'Unknown')
                        : 'Unassigned';
                      const agentColor = task.assigneeId
                        ? getAgentColor(task.assigneeId)
                        : 'var(--color-text-muted)';

                      return (
                        <motion.div
                          key={task.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card elevated className={css.taskCard}>
                            <div className={css.cardTitle}>{task.title}</div>
                            <div className={css.cardMeta}>
                              <span className={css.assignee}>
                                <span
                                  className={css.assigneeAvatar}
                                  style={{ background: agentColor }}
                                >
                                  {getInitials(assigneeName)}
                                </span>
                                {assigneeName}
                              </span>
                              <Badge status={STATUS_MAP[task.status] ?? 'offline'}>
                                {task.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className={css.timestamp}>
                              {formatRelativeTime(task.updatedAt)}
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
