import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Agent } from '@ventureos/shared';
import { useVentureStore } from '../store';
import css from './OrgChart.module.css';

/* ── Utilities ─────────────────────────────────────────── */

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
    parent ? parent.children.push(node) : roots.push(node);
  }
  return roots;
}

function countAll(node: TreeNode): number {
  return node.children.reduce((n, c) => n + 1 + countAll(c), 0);
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

/* ── Inline SVG Icons ──────────────────────────────────── */

function SearchIcon() {
  return (
    <svg
      className={css.searchIcon}
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M6.5 1a5.5 5.5 0 014.383 8.823l3.896 3.9a.75.75 0 01-1.06 1.06l-3.9-3.896A5.5 5.5 0 116.5 1zM2 6.5a4.5 4.5 0 109 0 4.5 4.5 0 00-9 0z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`${css.chevron} ${open ? css.chevronOpen : ''}`}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
    >
      <path
        d="M4.5 3L7.5 6L4.5 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Tree Branch (recursive) ──────────────────────────── */

const COLLAPSE_EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

interface BranchProps {
  node: TreeNode;
  selectedId: string | null;
  onSelect: (id: string) => void;
  depth: number;
  collapsedSet: Set<string>;
  onToggle: (id: string) => void;
}

function Branch({
  node,
  selectedId,
  onSelect,
  depth,
  collapsedSet,
  onToggle,
}: BranchProps) {
  const { agent, children } = node;
  const hasChildren = children.length > 0;
  const open = !collapsedSet.has(agent.id);
  const selected = agent.id === selectedId;
  const count = useMemo(() => countAll(node), [node]);

  return (
    <div className={css.branch}>
      <div
        className={`${css.row} ${selected ? css.rowSelected : ''}`}
        onClick={() => onSelect(agent.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(agent.id);
          }
        }}
      >
        {hasChildren ? (
          <button
            className={css.toggle}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(agent.id);
            }}
            aria-label={open ? 'Collapse' : 'Expand'}
          >
            <Chevron open={open} />
          </button>
        ) : (
          <span className={css.toggleSpacer} />
        )}

        <span
          className={`${css.dot} ${agent.status === 'active' ? css.dotPulse : ''}`}
          style={
            { '--dot-color': STATUS_COLOR[agent.status] } as React.CSSProperties
          }
        />

        <span className={css.name}>{agent.name}</span>
        <span className={css.role}>{agent.role}</span>

        {hasChildren ? (
          <span className={css.count}>{count}</span>
        ) : (
          <span className={css.heartbeat}>{timeAgo(agent.lastHeartbeat)}</span>
        )}
      </div>

      <AnimatePresence initial={false}>
        {hasChildren && open && (
          <motion.div
            className={css.children}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: COLLAPSE_EASE }}
            style={{ overflow: 'hidden' }}
          >
            {children.map((child) => (
              <Branch
                key={child.agent.id}
                node={child}
                selectedId={selectedId}
                onSelect={onSelect}
                depth={depth + 1}
                collapsedSet={collapsedSet}
                onToggle={onToggle}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────── */

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

  return (
    <div className={css.container}>
      <div className={css.header}>
        <span className={css.headerLabel}>Organization</span>
        {agents.length > 0 && (
          <span className={css.headerCount}>{agents.length}</span>
        )}
      </div>

      <div className={css.search}>
        <SearchIcon />
        <input
          className={css.searchInput}
          type="text"
          placeholder="Search by name or role\u2026"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          spellCheck={false}
        />
        {query && (
          <button
            className={css.searchClear}
            onClick={() => setQuery('')}
            aria-label="Clear search"
          >
            &#215;
          </button>
        )}
      </div>

      {agents.length === 0 ? (
        <p className={css.empty}>No agents connected</p>
      ) : visible.length === 0 ? (
        <p className={css.empty}>No matching agents</p>
      ) : (
        <div className={css.tree}>
          {visible.map((root) => (
            <Branch
              key={root.agent.id}
              node={root}
              selectedId={selectedAgentId}
              onSelect={select}
              depth={0}
              collapsedSet={collapsed}
              onToggle={toggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
