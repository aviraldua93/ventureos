import { useState, useCallback, useMemo } from 'react';
import { useVentureStore } from '../store';

type Tab = 'activity' | 'messages' | 'stats';

interface TimelineEntry {
  id: string;
  type: 'message_sent' | 'message_received' | 'task_update' | 'code_change';
  timestamp: number;
  label: string;
  detail: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'var(--green)',
  idle: 'var(--yellow)',
  error: 'var(--red)',
  offline: 'var(--text-secondary)',
};

const TYPE_ICONS: Record<TimelineEntry['type'], string> = {
  message_sent: '\U0001f4e4',
  message_received: '\U0001f4e5',
  task_update: '\U0001f4cb',
  code_change: '\U0001f4bb',
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatTimeSince(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ${hrs % 24}h ago`;
}

export function AgentDetail() {
  const {
    selectedAgentId,
    setSelectedAgentId,
    agents,
    messages,
    tasks,
    codeChanges,
  } = useVentureStore();

  const [activeTab, setActiveTab] = useState<Tab>('activity');

  const agent = useMemo(
    () => agents.find((a) => a.id === selectedAgentId) ?? null,
    [agents, selectedAgentId],
  );

  const agentMessages = useMemo(
    () => messages.filter((m) => m.from === selectedAgentId || m.to === selectedAgentId),
    [messages, selectedAgentId],
  );

  const agentTasks = useMemo(
    () => tasks.filter((t) => t.assigneeId === selectedAgentId),
    [tasks, selectedAgentId],
  );

  const agentCodeChanges = useMemo(
    () => codeChanges.filter((c) => c.agentId === selectedAgentId),
    [codeChanges, selectedAgentId],
  );

  const timeline = useMemo<TimelineEntry[]>(() => {
    const entries: TimelineEntry[] = [];
    for (const m of agentMessages) {
      const isSent = m.from === selectedAgentId;
      entries.push({
        id: m.id,
        type: isSent ? 'message_sent' : 'message_received',
        timestamp: m.timestamp,
        label: isSent ? `Sent to ${m.to ?? 'broadcast'}` : `Received from ${m.from}`,
        detail: m.content.length > 80 ? m.content.slice(0, 80) + '\u2026' : m.content,
      });
    }
    for (const t of agentTasks) {
      entries.push({
        id: t.id,
        type: 'task_update',
        timestamp: t.updatedAt,
        label: `Task "${t.title}"`,
        detail: `Status: ${t.status.replace('_', ' ')}`,
      });
    }
    for (const c of agentCodeChanges) {
      entries.push({
        id: c.id,
        type: 'code_change',
        timestamp: c.timestamp,
        label: c.filePath,
        detail: c.description.length > 80 ? c.description.slice(0, 80) + '\u2026' : c.description,
      });
    }
    entries.sort((a, b) => b.timestamp - a.timestamp);
    return entries;
  }, [agentMessages, agentTasks, agentCodeChanges, selectedAgentId]);

  const handleClose = useCallback(() => setSelectedAgentId(null), [setSelectedAgentId]);
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) handleClose();
    },
    [handleClose],
  );

  if (!selectedAgentId) return null;

  return (
    <div className="agent-detail-backdrop" onClick={handleBackdropClick}>
      <div className="agent-detail-panel">
        <div className="agent-detail-header">
          <div className="agent-detail-header-info">
            {agent ? (
              <>
                <div className="agent-detail-name-row">
                  <span
                    className="agent-detail-status-dot"
                    style={{ background: STATUS_COLORS[agent.status] ?? 'var(--text-secondary)' }}
                  />
                  <h2>{agent.name}</h2>
                </div>
                <span className="agent-detail-role">{agent.role}</span>
                {agent.currentTask && (
                  <span className="agent-detail-current-task">\U0001f527 {agent.currentTask}</span>
                )}
              </>
            ) : (
              <h2>Agent not found</h2>
            )}
          </div>
          <button className="agent-detail-close" onClick={handleClose} aria-label="Close">
            \u2715
          </button>
        </div>
        <div className="agent-detail-tabs">
          {(['activity', 'messages', 'stats'] as Tab[]).map((tab) => (
            <button
              key={tab}
              className={`agent-detail-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="agent-detail-content">
          {activeTab === 'activity' && <ActivityTab timeline={timeline} />}
          {activeTab === 'messages' && <MessagesTab messages={agentMessages} agentId={selectedAgentId} />}
          {activeTab === 'stats' && agent && (
            <StatsTab
              agent={agent}
              messagesSent={agentMessages.filter((m) => m.from === selectedAgentId).length}
              tasksCompleted={agentTasks.filter((t) => t.status === 'done').length}
              codeChangesCount={agentCodeChanges.length}
            />
          )}
          {activeTab === 'stats' && !agent && <EmptyState text="Agent not found" />}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="agent-detail-empty">{text}</div>;
}

function ActivityTab({ timeline }: { timeline: TimelineEntry[] }) {
  if (timeline.length === 0) return <EmptyState text="No activity yet" />;
  return (
    <ul className="agent-detail-timeline">
      {timeline.map((entry) => (
        <li key={entry.id} className="timeline-item">
          <span className="timeline-icon">{TYPE_ICONS[entry.type]}</span>
          <div className="timeline-body">
            <div className="timeline-label">{entry.label}</div>
            <div className="timeline-detail">{entry.detail}</div>
          </div>
          <span className="timeline-time">{formatTime(entry.timestamp)}</span>
        </li>
      ))}
    </ul>
  );
}

function MessagesTab({
  messages,
  agentId,
}: {
  messages: { id: string; from: string; to?: string; content: string; messageType: string; timestamp: number }[];
  agentId: string;
}) {
  if (messages.length === 0) return <EmptyState text="No messages yet" />;
  const sorted = [...messages].sort((a, b) => b.timestamp - a.timestamp);
  return (
    <ul className="agent-detail-messages">
      {sorted.map((m) => {
        const isSent = m.from === agentId;
        return (
          <li key={m.id} className={`message-item ${isSent ? 'sent' : 'received'}`}>
            <div className="message-meta">
              <span className="message-direction">{isSent ? '\U0001f4e4 Sent' : '\U0001f4e5 Received'}</span>
              <span className="message-type">{m.messageType}</span>
              <span className="message-time">{formatTime(m.timestamp)}</span>
            </div>
            <div className="message-peer">
              {isSent ? `To: ${m.to ?? 'broadcast'}` : `From: ${m.from}`}
            </div>
            <div className="message-content">{m.content}</div>
          </li>
        );
      })}
    </ul>
  );
}

function StatsTab({
  agent,
  messagesSent,
  tasksCompleted,
  codeChangesCount,
}: {
  agent: { status: string; lastHeartbeat: number };
  messagesSent: number;
  tasksCompleted: number;
  codeChangesCount: number;
}) {
  return (
    <div className="agent-detail-stats">
      <StatRow label="Status" value={agent.status} />
      <StatRow label="Messages sent" value={String(messagesSent)} />
      <StatRow label="Tasks completed" value={String(tasksCompleted)} />
      <StatRow label="Code changes" value={String(codeChangesCount)} />
      <StatRow label="Registered" value={formatTimeSince(agent.lastHeartbeat)} />
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}
