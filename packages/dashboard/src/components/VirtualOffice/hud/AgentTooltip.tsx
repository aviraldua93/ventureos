import type { Agent } from '@ventureos/shared';
import css from './AgentTooltip.module.css';

interface AgentTooltipProps {
  agent: Agent | null;
  x: number;
  y: number;
  visible: boolean;
}

export function AgentTooltip({ agent, x, y, visible }: AgentTooltipProps) {
  if (!visible || !agent) return null;

  const statusClass = css[agent.status] ?? css.idle;

  return (
    <div className={css.tooltip} style={{ left: x, top: y }}>
      <div className={css.tooltipName}>{agent.name}</div>
      <div className={css.tooltipRole}>{agent.role}</div>
      <div className={css.tooltipStatus}>
        <span className={`${css.statusDot} ${statusClass}`} />
        <span>{agent.status}</span>
      </div>
      {agent.currentTask && (
        <div className={css.tooltipTask}>📋 {agent.currentTask}</div>
      )}
    </div>
  );
}
