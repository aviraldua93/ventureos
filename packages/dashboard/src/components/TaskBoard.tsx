import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVentureStore } from '../store';
import css from './TaskBoard.module.css';

const STATUS_DOT_CLASS: Record<string, string> = {
  backlog: css.backlog,
  in_progress: css.inProgress,
  review: css.review,
  done: css.done,
};

const COLUMNS = [
  { key: 'backlog', label: 'Backlog', accent: css.columnBacklog },
  { key: 'in_progress', label: 'In Progress', accent: css.columnInProgress },
  { key: 'review', label: 'Review', accent: css.columnReview },
  { key: 'done', label: 'Done', accent: css.columnDone },
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
    <div className={css.container} data-testid="task-board">
      <div className={css.header}>
        <h2 className={css.heading}>Tasks</h2>
        <span className={css.taskCount}>{tasks.length}</span>
      </div>
      <div className={css.board}>
        {COLUMNS.map((col) => {
          const columnTasks = grouped[col.key] || [];
          return (
            <div key={col.key} className={`${css.column} ${col.accent}`}>
              <div className={css.columnHeader}>
                <span className={css.columnLabel}>
                  <span className={css.columnDot} />
                  {col.label}
                </span>
                <span className={css.count}>{columnTasks.length}</span>
              </div>
              {columnTasks.length === 0 ? (
                <div className={css.empty}>No tasks</div>
              ) : (
                <div className={css.cardList}>
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
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.12 }}
                        >
                          <div className={css.taskCard} data-testid={`task-card-${task.id}`}>
                            <div className={css.cardBody}>
                              <span className={css.cardTitle}>{task.title}</span>
                              <span
                                className={`${css.statusDot} ${STATUS_DOT_CLASS[task.status] ?? ''}`}
                              />
                            </div>
                            <div className={css.cardMeta}>
                              <span className={css.assignee}>
                                <span
                                  className={css.assigneeAvatar}
                                  style={{ background: agentColor }}
                                >
                                  {getInitials(assigneeName)}
                                </span>
                                <span className={css.assigneeName}>
                                  {assigneeName}
                                </span>
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
