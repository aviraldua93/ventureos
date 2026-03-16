import { useMemo, useCallback } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import * as Tooltip from '@radix-ui/react-tooltip';
import type { Agent } from '@ventureos/shared';
import { useVentureStore } from '../store';
import css from './OrgChart.module.css';

/* ═══════════════════════════════════════
   Utilities
   ═══════════════════════════════════════ */

function timeAgo(ts: number): string {
  const diff = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* ═══════════════════════════════════════
   Tree & Department Logic
   ═══════════════════════════════════════ */

interface TreeNode {
  agent: Agent;
  children: TreeNode[];
}

interface Department {
  head: Agent;
  label: string;
  accent: string;
  members: Agent[];
}

interface OrgData {
  leaders: Agent[];
  departments: Department[];
}

function buildTree(agents: Agent[]): TreeNode[] {
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

function flattenTree(node: TreeNode): Agent[] {
  const out: Agent[] = [];
  for (const c of node.children) {
    out.push(c.agent);
    out.push(...flattenTree(c));
  }
  return out;
}

function extractLabel(role: string): string {
  let m = role.match(/VP\s+(?:of\s+)?(.+)/i);
  if (m) return m[1].trim();
  m = role.match(/(.+?)\s+(?:Lead|Head|Director)$/i);
  if (m) return m[1].trim();
  m = role.match(/(?:Lead|Head|Director)\s+(?:of\s+)?(.+)/i);
  if (m) return m[1].trim();
  return role;
}

const ACCENTS: Record<string, string> = {
  engineer: 'var(--agent-color-1)',
  quality:  'var(--agent-color-2)',
  ai:       'var(--agent-color-5)',
  llm:      'var(--agent-color-5)',
  product:  'var(--agent-color-4)',
  community:'var(--agent-color-3)',
  playwright:'var(--agent-color-6)',
  test:     'var(--agent-color-6)',
};

function accentFor(label: string): string {
  const l = label.toLowerCase();
  for (const [k, v] of Object.entries(ACCENTS)) {
    if (l.includes(k)) return v;
  }
  return 'var(--color-text-muted)';
}

function isDeptHead(agent: Agent, hasChildren: boolean): boolean {
  if (!hasChildren) return false;
  const r = agent.role.toLowerCase();
  return (
    r.includes('vp') ||
    r.includes('lead') ||
    r.includes('head') ||
    r.includes('director')
  );
}

function organize(agents: Agent[]): OrgData {
  const roots = buildTree(agents);
  const leaders: Agent[] = [];
  const departments: Department[] = [];

  function walk(nodes: TreeNode[]) {
    for (const n of nodes) {
      if (isDeptHead(n.agent, n.children.length > 0)) {
        const label = extractLabel(n.agent.role);
        departments.push({
          head: n.agent,
          label,
          accent: accentFor(label),
          members: flattenTree(n),
        });
      } else if (n.children.length > 0) {
        leaders.push(n.agent);
        walk(n.children);
      } else {
        leaders.push(n.agent);
      }
    }
  }

  walk(roots);
  return { leaders, departments };
}

/* ═══════════════════════════════════════
   Sub-Components
   ═══════════════════════════════════════ */

function StatusDot({ status }: { status: string }) {
  const cls =
    status === 'active'
      ? css.dotActive
      : status === 'error'
        ? css.dotError
        : status === 'offline'
          ? css.dotOffline
          : css.dotIdle;
  return <span className={`${css.dot} ${cls}`} />;
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
    >
      <path
        d="M3.5 5.25L7 8.75L10.5 5.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface CardProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function AgentCard({ agent, isSelected, onSelect }: CardProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          className={`${css.card} ${isSelected ? css.cardActive : ''}`}
          onClick={() => onSelect(agent.id)}
        >
          <StatusDot status={agent.status} />
          <div className={css.cardBody}>
            <span className={css.name}>{agent.name}</span>
            <span className={css.role}>{agent.role}</span>
            {agent.currentTask && (
              <span className={css.task}>{agent.currentTask}</span>
            )}
          </div>
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className={css.tip}
          side="right"
          sideOffset={8}
          align="start"
        >
          <p className={css.tipName}>{agent.name}</p>
          <p className={css.tipRole}>{agent.role}</p>
          {agent.currentTask && (
            <div className={css.tipTask}>
              <span className={css.tipLabel}>Current task</span>
              {agent.currentTask}
            </div>
          )}
          <p className={css.tipMeta}>
            {agent.status} · {timeAgo(agent.lastHeartbeat)}
            {agent.capabilities.length > 0 &&
              ` · ${agent.capabilities.join(', ')}`}
          </p>
          <Tooltip.Arrow className={css.tipArrow} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

interface DeptProps {
  dept: Department;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function DeptSection({ dept, selectedId, onSelect }: DeptProps) {
  return (
    <Collapsible.Root defaultOpen className={css.dept}>
      <Collapsible.Trigger className={css.deptTrigger}>
        <span
          className={css.deptBar}
          style={{ background: dept.accent }}
        />
        <span className={css.deptLabel}>{dept.label}</span>
        <span className={css.deptCount}>{1 + dept.members.length}</span>
        <Chevron className={css.deptChevron} />
      </Collapsible.Trigger>
      <Collapsible.Content className={css.deptBody}>
        <AgentCard
          agent={dept.head}
          isSelected={selectedId === dept.head.id}
          onSelect={onSelect}
        />
        {dept.members.map((m) => (
          <AgentCard
            key={m.id}
            agent={m}
            isSelected={selectedId === m.id}
            onSelect={onSelect}
          />
        ))}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

/* ═══════════════════════════════════════
   Main Component
   ═══════════════════════════════════════ */

export function OrgChart() {
  const agents = useVentureStore((s) => s.agents);
  const selectedAgentId = useVentureStore((s) => s.selectedAgentId);
  const setSelectedAgentId = useVentureStore((s) => s.setSelectedAgentId);

  const org = useMemo(() => organize(agents), [agents]);

  const handleSelect = useCallback(
    (id: string) => setSelectedAgentId(selectedAgentId === id ? null : id),
    [selectedAgentId, setSelectedAgentId],
  );

  return (
    <Tooltip.Provider delayDuration={400} skipDelayDuration={100}>
      <div className={css.root}>
        <header className={css.header}>
          <h2 className={css.title}>Org Chart</h2>
          {agents.length > 0 && (
            <span className={css.badge}>{agents.length}</span>
          )}
        </header>

        {agents.length === 0 ? (
          <div className={css.empty}>No agents connected</div>
        ) : (
          <div className={css.scroll}>
            {org.leaders.length > 0 && (
              <section className={css.leaders}>
                {org.leaders.map((a) => (
                  <AgentCard
                    key={a.id}
                    agent={a}
                    isSelected={selectedAgentId === a.id}
                    onSelect={handleSelect}
                  />
                ))}
              </section>
            )}

            {org.departments.map((d) => (
              <DeptSection
                key={d.head.id}
                dept={d}
                selectedId={selectedAgentId}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </div>
    </Tooltip.Provider>
  );
}
