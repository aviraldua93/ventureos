import { useMemo, useCallback } from 'react';
import type { Agent } from '@ventureos/shared';
import { useVentureStore } from '../store';
import css from './AgentListPanel.module.css';

const STATUS_COLOR: Record<Agent['status'], string> = {
  active: 'var(--color-success)',
  idle: 'var(--color-warning)',
  error: 'var(--color-error)',
  offline: 'var(--color-offline)',
};

function timeAgo(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export function AgentListPanel() {
  const agents = useVentureStore((s) => s.agents);
  const selectedAgentId = useVentureStore((s) => s.selectedAgentId);
  const setSelectedAgentId = useVentureStore((s) => s.setSelectedAgentId);

  const stats = useMemo(
    () => ({
      active: agents.filter((a) => a.status === 'active').length,
      idle: agents.filter((a) => a.status === 'idle').length,
      error: agents.filter((a) => a.status === 'error').length,
      offline: agents.filter((a) => a.status === 'offline').length,
    }),
    [agents],
  );

  const select = useCallback(
    (id: string) => setSelectedAgentId(selectedAgentId === id ? null : id),
    [selectedAgentId, setSelectedAgentId],
  );

  return (
    <div className={css.container} data-testid="agent-list-panel">
      <div className={css.header}>
        <span className={css.headerLabel}>Agents</span>
        {agents.length > 0 && <span className={css.headerCount}>{agents.length}</span>}
      </div>

      <div className={css.stats}>
        <div className={css.stat}>
          <span className={css.statDot} style={{ background: 'var(--color-success)' }} />
          <span className={css.statNum}>{stats.active}</span>
          <span className={css.statLabel}>active</span>
        </div>
        <div className={css.stat}>
          <span className={css.statDot} style={{ background: 'var(--color-warning)' }} />
          <span className={css.statNum}>{stats.idle}</span>
          <span className={css.statLabel}>idle</span>
        </div>
        <div className={css.stat}>
          <span className={css.statDot} style={{ background: 'var(--color-error)' }} />
          <span className={css.statNum}>{stats.error}</span>
          <span className={css.statLabel}>error</span>
        </div>
        <div className={css.stat}>
          <span className={css.statDot} style={{ background: 'var(--color-offline, #555)' }} />
          <span className={css.statNum}>{stats.offline}</span>
          <span className={css.statLabel}>offline</span>
        </div>
      </div>

      {agents.length === 0 ? (
        <p className={css.empty}>No agents connected</p>
      ) : (
        <div className={css.list}>
          {agents.map((agent) => (
            <div
              key={agent.id}
              className={`${css.row} ${agent.id === selectedAgentId ? css.rowSelected : ''}`}
              onClick={() => select(agent.id)}
              role="button"
              tabIndex={0}
              data-testid={`agent-row-${agent.id}`}
              aria-label={`${agent.name}, ${agent.role}, ${agent.status}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  select(agent.id);
                }
              }}
            >
              <span
                className={`${css.dot} ${agent.status === 'active' ? css.dotPulse : ''}`}
                style={{ '--dot-color': STATUS_COLOR[agent.status] } as React.CSSProperties}
              />
              <div className={css.info}>
                <span className={css.name}>{agent.name}</span>
                <span className={css.role}>{agent.role}</span>
              </div>
              <span className={css.heartbeat}>{timeAgo(agent.lastHeartbeat)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
