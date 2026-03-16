import type { Agent, Task } from '@ventureos/shared';
import { computeTeamHappiness } from '../engine/moods';
import css from '../ThrongletOffice.module.css';

interface ResourceBarProps {
  agents: Agent[];
  tasks: Task[];
}

export function ResourceBar({ agents, tasks }: ResourceBarProps) {
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const remaining = totalTasks - doneTasks;
  const happiness = computeTeamHappiness(agents, tasks);

  const happinessColor = happiness >= 80 ? '#3ddc84' : happiness >= 50 ? '#ffc940' : '#ff5c5c';
  const happinessEmoji = happiness >= 80 ? '😊' : happiness >= 50 ? '😐' : '😟';

  return (
    <div className={css.resourceBar}>
      <div className={css.resourceItem}>
        <span className={css.resourceIcon}>🐾</span>
        <span className={css.resourceLabel}>Creatures</span>
        <span className={css.resourceValue}>{agents.length}</span>
      </div>
      <div className={css.resourceDivider} />
      <div className={css.resourceItem}>
        <span className={css.resourceIcon}>📋</span>
        <span className={css.resourceLabel}>Tasks Left</span>
        <span className={css.resourceValue}>{remaining}</span>
      </div>
      <div className={css.resourceDivider} />
      <div className={css.resourceItem}>
        <span className={css.resourceIcon}>⚡</span>
        <span className={css.resourceLabel}>Active</span>
        <span className={css.resourceValue}>{inProgress}</span>
      </div>
      <div className={css.resourceDivider} />
      <div className={css.resourceItem}>
        <span className={css.resourceIcon}>✅</span>
        <span className={css.resourceLabel}>Done</span>
        <span className={css.resourceValue}>{doneTasks}</span>
      </div>
      <div className={css.resourceDivider} />
      <div className={css.resourceItem}>
        <span className={css.resourceIcon}>{happinessEmoji}</span>
        <span className={css.resourceLabel}>Happiness</span>
        <span className={css.resourceValue} style={{ color: happinessColor }}>{happiness}%</span>
      </div>
    </div>
  );
}
