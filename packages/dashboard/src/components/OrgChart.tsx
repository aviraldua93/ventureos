import { useState, useMemo, useCallback } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import type { Agent } from '@ventureos/shared';
import { useVentureStore } from '../store';
import css from './OrgChart.module.css';

const STATUS_META: Record<Agent['status'], { color: string; label: string }> = {
  active: { color: 'var(--color-success)', label: 'Active' },
  idle: { color: 'var(--color-warning)', label: 'Idle' },
  error: { color: 'var(--color-error)', label: 'Error' },
  offline: { color: 'var(--color-offline)', label: 'Offline' },
};

function timeAgo(ts: number): string {
  const diff = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

interface TreeNode {
  agent: Agent;
  children: TreeNode[];
}

function buildForest(agents: Agent[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  for (const a of agents) map.set(a.id, { agent: a, children: [] });
  const roots: TreeNode[] = [];
  for (const a of agents) {
    const node = map.get(a.id)!;
    const parent = a.parentId ? map.get(a.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  return roots;
}

function matchTree(node: TreeNode, q: string): TreeNode | null {
  const hit =
    node.agent.name.toLowerCase().includes(q) ||
    node.agent.role.toLowerCase().includes(q);
  if (hit) return node;
  const kids = node.children
    .map((c) => matchTree(c, q))
    .filter(Boolean) as TreeNode[];
  return kids.length ? { agent: node.agent, children: kids } : null;
}

interface NodeProps {
  node: TreeNode;
  selectedId: string | null;
  onSelect: (id: string) => void;
  depth: number;
  collapsedSet: Set<string>;
  onToggle: (id: string) => void;
  isLast: boolean;
}

function OrgNode({
  node, selectedId, onSelect, depth,
  collapsedSet, onToggle, isLast,
}: NodeProps) {
  const { agent, children } = node;
  const hasKids = children.length > 0;
  const isOpen = !collapsedSet.has(agent.id);
  const isSelected = agent.id === selectedId;
  const meta = STATUS_META[agent.status];
  const isRoot = depth === 0;

  return (
    <div
      className={`${css.nodeWrap} ${isLast ? css.nodeWrapLast : ''}`}
      data-depth={depth}
    >
      {!isRoot && <span className={css.lineH} />}

      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            className={`${css.card} ${isSelected ? css.cardSelected : ''} ${isRoot ? css.cardRoot : ''}`}
            onClick={() => onSelect(agent.id)}
          >
            <div
              className={css.avatar}
              style={{ '--avatar-accent': meta.color } as React.CSSProperties}
            >
              {getInitials(agent.name)}
              <span
                className={`${css.statusDot} ${agent.status === 'active' ? css.statusPulse : ''}`}
                style={{ background: meta.color }}
              />
            </div>

            <div className={css.cardBody}>
              <span className={css.name}>{agent.name}</span>
              <span className={css.role}>{agent.role}</span>
            </div>

            {hasKids && (
              <span
                className={`${css.expandBtn} ${isOpen ? css.expandOpen : ''}`}
                onClick={(e) => { e.stopPropagation(); onToggle(agent.id); }}
                role="button"
                tabIndex={-1}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M3 4L5 6L7 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className={css.tip} side="right" sideOffset={8} align="start">
            <p className={css.tipName}>{agent.name}</p>
            <p className={css.tipRole}>{agent.role}</p>
            {agent.currentTask && (
              <div className={css.tipTask}>
                <span className={css.tipLabel}>Current task</span>
                {agent.currentTask}
              </div>
            )}
            <p className={css.tipMeta}>
              {meta.label} \u00B7 {timeAgo(agent.lastHeartbeat)}
              {agent.capabilities.length > 0 && ` \u00B7 ${agent.capabilities.join(', ')}`}
            </p>
            <Tooltip.Arrow className={css.tipArrow} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>

      {hasKids && isOpen && (
        <div className={css.subtree}>
          <span className={css.lineV} />
          {children.map((child, i) => (
            <OrgNode
              key={child.agent.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
              collapsedSet={collapsedSet}
              onToggle={onToggle}
              isLast={i === children.length - 1}
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

  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const forest = useMemo(() => buildForest(agents), [agents]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return forest;
    return forest.map((r) => matchTree(r, q)).filter(Boolean) as TreeNode[];
  }, [forest, query]);

  const toggle = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const select = useCallback(
    (id: string) => setSelectedAgentId(selectedAgentId === id ? null : id),
    [selectedAgentId, setSelectedAgentId],
  );

  const totalActive = agents.filter(a => a.status === 'active').length;

  return (
    <Tooltip.Provider delayDuration={400} skipDelayDuration={100}>
      <div className={css.root}>
        <header className={css.header}>
          <h2 className={css.title}>Org Chart</h2>
          {agents.length > 0 && (
            <span className={css.badge}>
              {totalActive}<span className={css.badgeSep}>/</span>{agents.length}
            </span>
          )}
        </header>

        <div className={css.searchBar}>
          <svg className={css.searchIcon} width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path
              d="M6.5 1a5.5 5.5 0 014.383 8.823l3.896 3.9a.75.75 0 01-1.06 1.06l-3.9-3.896A5.5 5.5 0 116.5 1zM2 6.5a4.5 4.5 0 109 0 4.5 4.5 0 00-9 0z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
          <input
            className={css.searchInput}
            type="text"
            placeholder="Filter agents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            spellCheck={false}
          />
          {query && (
            <button className={css.searchClear} onClick={() => setQuery('')} aria-label="Clear">
              &times;
            </button>
          )}
        </div>

        {agents.length === 0 ? (
          <div className={css.empty}>No agents connected</div>
        ) : visible.length === 0 ? (
          <div className={css.empty}>No matching agents</div>
        ) : (
          <div className={css.scroll}>
            <div className={css.tree}>
              {visible.map((root, i) => (
                <OrgNode
                  key={root.agent.id}
                  node={root}
                  selectedId={selectedAgentId}
                  onSelect={select}
                  depth={0}
                  collapsedSet={collapsed}
                  onToggle={toggle}
                  isLast={i === visible.length - 1}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Tooltip.Provider>
  );
}
