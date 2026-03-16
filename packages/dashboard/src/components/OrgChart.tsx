import { useMemo, useCallback } from 'react';
import type { Agent } from '@ventureos/shared';
import { useVentureStore } from '../store';
import css from './OrgChart.module.css';

const STATUS_CLASS: Record<Agent['status'], string> = {
  active: css.dotActive,
  idle: css.dotIdle,
  error: css.dotError,
  offline: css.dotOffline,
};

function timeAgo(ts: number): string {
  const diff = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface TreeNode {
  agent: Agent;
  children: TreeNode[];
}

function buildForest(agents: Agent[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();
  for (const agent of agents) {
    nodeMap.set(agent.id, { agent, children: [] });
  }

  const roots: TreeNode[] = [];
  for (const agent of agents) {
    const node = nodeMap.get(agent.id)!;
    const parent = agent.parentId ? nodeMap.get(agent.parentId) : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

interface AgentNodeProps {
  node: TreeNode;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function AgentNode({ node, selectedId, onSelect }: AgentNodeProps) {
  const { agent, children } = node;
  const isSelected = agent.id === selectedId;

  return (
    <div className={css.subtree}>
      <div
        className={`${css.card} ${isSelected ? css.cardSelected : ''}`}
        onClick={() => onSelect(agent.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onSelect(agent.id);
        }}
      >
        <span className={`${css.dot} ${STATUS_CLASS[agent.status]}`} />
        <div className={css.info}>
          <div className={css.nameRow}>
            <span className={css.name}>{agent.name}</span>
            <span className={css.role}>— {agent.role}</span>
          </div>
          {agent.currentTask && (
            <div className={css.task}>{agent.currentTask}</div>
          )}
          <div className={css.heartbeat}>{timeAgo(agent.lastHeartbeat)}</div>
        </div>
      </div>

      {children.length > 0 && (
        <div className={css.children}>
          {children.map((child) => (
            <AgentNode
              key={child.agent.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function OrgChart() {
  const agents = useVentureStore((s) => s.agents);
  const selectedAgentId = useVentureStore((s) => s.selectedAgentId);
  const setSelectedAgentId = useVentureStore((s) => s.setSelectedAgentId);

  const forest = useMemo(() => buildForest(agents), [agents]);

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedAgentId(selectedAgentId === id ? null : id);
    },
    [selectedAgentId, setSelectedAgentId],
  );

  return (
    <div className={`panel ${css.container}`}>
      <h2 className={css.header}>🏢 Org Chart</h2>

      {agents.length === 0 ? (
        <p className={css.empty}>No agents connected</p>
      ) : (
        <div className={css.tree}>
          {forest.map((root) => (
            <AgentNode
              key={root.agent.id}
              node={root}
              selectedId={selectedAgentId}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
