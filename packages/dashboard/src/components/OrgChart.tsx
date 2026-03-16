import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Agent } from '@ventureos/shared';
import { useVentureStore } from '../store';
import { Badge } from './ui';
import css from './OrgChart.module.css';

const AGENT_COLORS = [
  'var(--agent-color-1)', 'var(--agent-color-2)', 'var(--agent-color-3)',
  'var(--agent-color-4)', 'var(--agent-color-5)', 'var(--agent-color-6)',
  'var(--agent-color-7)', 'var(--agent-color-8)', 'var(--agent-color-9)',
  'var(--agent-color-10)',
];

function getAgentColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
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
  depth?: number;
}

function AgentNode({ node, selectedId, onSelect, depth = 0 }: AgentNodeProps) {
  const { agent, children } = node;
  const isSelected = agent.id === selectedId;
  const [expanded, setExpanded] = useState(true);

  const toggleExpand = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setExpanded((prev) => !prev);
    },
    [],
  );

  return (
    <motion.div
      className={css.subtree}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: depth * 0.05 }}
    >
      <div
        className={`${css.nodeCard} ${isSelected ? css.cardSelected : ''}`}
        onClick={() => onSelect(agent.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onSelect(agent.id);
        }}
      >
        <div
          className={css.avatar}
          style={{ background: getAgentColor(agent.name) }}
        >
          {getInitials(agent.name)}
        </div>
        <div className={css.info}>
          <div className={css.nameRow}>
            <span className={css.name}>{agent.name}</span>
            <Badge status={agent.status}>{agent.status}</Badge>
          </div>
          <span className={css.role}>{agent.role}</span>
          {agent.currentTask && (
            <div className={css.task}>🔧 {agent.currentTask}</div>
          )}
          <div className={css.heartbeat}>{timeAgo(agent.lastHeartbeat)}</div>
        </div>
        {children.length > 0 && (
          <button
            className={css.expandBtn}
            onClick={toggleExpand}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? '▾' : '▸'}
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {expanded && children.length > 0 && (
          <motion.div
            className={css.children}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            {children.map((child) => (
              <AgentNode
                key={child.agent.id}
                node={child}
                selectedId={selectedId}
                onSelect={onSelect}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
    <div className={css.container}>
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
