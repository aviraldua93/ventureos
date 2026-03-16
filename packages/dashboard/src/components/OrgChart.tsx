import { useState, useMemo, useCallback } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import type { Agent } from '@ventureos/shared';
import { useVentureStore } from '../store';
import css from './OrgChart.module.css';

const STATUS_META: Record<Agent['status'], { color: string; label: string; cssColor: string }> = {
  active: { color: 'var(--color-success)', label: 'Active', cssColor: '#3ddc84' },
  idle: { color: 'var(--color-warning)', label: 'Idle', cssColor: '#ffb647' },
  error: { color: 'var(--color-error)', label: 'Error', cssColor: '#ff5c5c' },
  offline: { color: 'var(--color-offline)', label: 'Offline', cssColor: '#556677' },
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

function countDescendants(node: TreeNode): number {
  return node.children.reduce((n, c) => n + 1 + countDescendants(c), 0);
}

/* Recursive OrgNode — renders card + connecting lines + children */
interface NodeProps {
  node: TreeNode;
  selectedId: string | null;
  onSelect: (id: string) => void;
  collapsedSet: Set<string>;
  onToggle: (id: string) => void;
}

function OrgNodeCard({ node, selectedId, onSelect, collapsedSet, onToggle }: NodeProps) {
  const { agent, children } = node;
  const hasKids = children.length > 0;
  const isOpen = !collapsedSet.has(agent.id);
  const isSelected = agent.id === selectedId;
  const meta = STATUS_META[agent.status];
  const count = useMemo(() => countDescendants(node), [node]);

  return (
    <div className={css.nodeGroup}>
      {/* Agent Card */}
      <button
        className={`${css.card} ${isSelected ? css.cardSelected : ''}`}
        onClick={() => onSelect(agent.id)}
      >
        <div className={css.cardTop}>
          <span
            className={`${css.dot} ${agent.status === 'active' ? css.dotPulse : ''}`}
            style={{ '--dot-color': meta.cssColor } as React.CSSProperties}
          />
          <span className={css.statusText}>{meta.label}</span>
        </div>
        <div className={css.cardName}>{agent.name}</div>
        <div className={css.cardRole}>{agent.role}</div>
        {agent.currentTask && (
          <div className={css.cardTask}>{agent.currentTask}</div>
        )}
        {hasKids && (
          <button
            className={css.collapseBtn}
            onClick={(e) => { e.stopPropagation(); onToggle(agent.id); }}
          >
            <svg
              className={`${css.chevronIcon} ${isOpen ? css.chevronOpen : ''}`}
              width="10" height="10" viewBox="0 0 10 10" fill="none"
            >
              <path d="M3 4L5 6L7 4" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={css.teamCount}>{count}</span> reports
          </button>
        )}
      </button>

      {/* Subtree with connecting lines */}
      {hasKids && isOpen && (
        <div className={css.subtree}>
          <div className={css.connectorDown} />
          <div className={css.childrenRow}>
            {children.map((child) => (
              <div key={child.agent.id} className={css.childBranch}>
                <div className={css.connectorUp} />
                <OrgNodeCard
                  node={child}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  collapsedSet={collapsedSet}
                  onToggle={onToggle}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* Main Component */
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
  const totalIdle = agents.filter(a => a.status === 'idle').length;
  const totalError = agents.filter(a => a.status === 'error').length;

  return (
    <div className={css.container}>
      {/* Toolbar */}
      <div className={css.toolbar}>
        <div className={css.toolbarLeft}>
          <h2 className={css.title}>Org Chart</h2>
          {agents.length > 0 && <span className={css.badge}>{agents.length}</span>}
        </div>

        <div className={css.toolbarRight}>
          <div className={css.statPills}>
            {totalActive > 0 && (
              <span className={css.pill}>
                <span className={css.pillDot} style={{ background: '#3ddc84' }} />
                {totalActive} active
              </span>
            )}
            {totalIdle > 0 && (
              <span className={css.pill}>
                <span className={css.pillDot} style={{ background: '#ffb647' }} />
                {totalIdle} idle
              </span>
            )}
            {totalError > 0 && (
              <span className={css.pill}>
                <span className={css.pillDot} style={{ background: '#ff5c5c' }} />
                {totalError} error
              </span>
            )}
          </div>

          <div className={css.searchWrap}>
            <svg className={css.searchIcon} width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path
                d="M6.5 1a5.5 5.5 0 014.383 8.823l3.896 3.9a.75.75 0 01-1.06 1.06l-3.9-3.896A5.5 5.5 0 116.5 1zM2 6.5a4.5 4.5 0 109 0 4.5 4.5 0 00-9 0z"
                fill="currentColor" fillRule="evenodd"
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
        </div>
      </div>

      {/* Tree area */}
      {agents.length === 0 ? (
        <div className={css.empty}>
          <p className={css.emptyTitle}>No agents connected</p>
          <p className={css.emptyDesc}>Agents will appear here as they register</p>
        </div>
      ) : visible.length === 0 ? (
        <div className={css.empty}>
          <p className={css.emptyTitle}>No matching agents</p>
          <p className={css.emptyDesc}>Try a different search term</p>
        </div>
      ) : (
        <div className={css.canvas}>
          <div className={css.treeRoot}>
            {visible.map((root) => (
              <OrgNodeCard
                key={root.agent.id}
                node={root}
                selectedId={selectedAgentId}
                onSelect={select}
                collapsedSet={collapsed}
                onToggle={toggle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
