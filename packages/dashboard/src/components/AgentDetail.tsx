import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVentureStore } from '../store';
import { Badge } from './ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui';
import css from './AgentDetail.module.css';

const AGENT_COLORS = [
  'var(--agent-color-1)', 'var(--agent-color-2)', 'var(--agent-color-3)',
  'var(--agent-color-4)', 'var(--agent-color-5)', 'var(--agent-color-6)',
];

function getAgentColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AGENT_COLORS[Math.abs(hash) % AGENT_COLORS.length];
}

function getInitials(name: string): string {
  return name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

interface TimelineEntry {
  id: string;
  type: 'message_sent' | 'message_received' | 'task_update' | 'code_change';
  timestamp: number;
  label: string;
  detail: string;
}

const TYPE_ICONS: Record<TimelineEntry['type'], string> = {
  message_sent: '↗',
  message_received: '↙',
  task_update: '◎',
  code_change: '⟨⟩',
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

  const [activeTab, setActiveTab] = useState('activity');

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

  useEffect(() => {
    if (!selectedAgentId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [selectedAgentId, handleClose]);

  if (!selectedAgentId) return null;

  return (
    <AnimatePresence>
      {selectedAgentId && (
        <>
          <motion.div
            className={css.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
          />
          <motion.div
            className={css.panel}
            data-testid="agent-detail-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className={css.header}>
              <div className={css.headerInfo}>
                {agent ? (
                  <>
                    <div className={css.agentRow}>
                      <div
                        className={css.agentAvatar}
                        style={{ background: getAgentColor(agent.name) }}
                      >
                        {getInitials(agent.name)}
                      </div>
                      <div className={css.agentMeta}>
                        <div className={css.agentNameRow}>
                          <span className={css.agentName}>{agent.name}</span>
                          <Badge status={agent.status}>{agent.status}</Badge>
                        </div>
                        <span className={css.agentRole}>{agent.role}</span>
                      </div>
                    </div>
                    {agent.currentTask && (
                      <span className={css.currentTask}>
                        <span className={css.currentTaskIcon}>●</span>
                        {agent.currentTask}
                      </span>
                    )}
                  </>
                ) : (
                  <div className={css.agentName}>Agent not found</div>
                )}
              </div>
              <button className={css.closeBtn} onClick={handleClose} aria-label="Close">
                ✕
              </button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
              </TabsList>

              <TabsContent value="activity">
                <div className={css.tabContent}>
                  <ActivityTab timeline={timeline} />
                </div>
              </TabsContent>
              <TabsContent value="messages">
                <div className={css.tabContent}>
                  <MessagesTab messages={agentMessages} agentId={selectedAgentId} />
                </div>
              </TabsContent>
              <TabsContent value="stats">
                <div className={css.tabContent}>
                  {agent ? (
                    <StatsTab
                      agent={agent}
                      messagesSent={agentMessages.filter((m) => m.from === selectedAgentId).length}
                      tasksCompleted={agentTasks.filter((t) => t.status === 'done').length}
                      codeChangesCount={agentCodeChanges.length}
                    />
                  ) : (
                    <EmptyState text="Agent not found" />
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className={css.emptyState}>{text}</div>;
}

function ActivityTab({ timeline }: { timeline: TimelineEntry[] }) {
  if (timeline.length === 0) return <EmptyState text="No activity yet" />;
  return (
    <ul className={css.timeline}>
      {timeline.map((entry) => (
        <li key={entry.id}>
          <div className={css.timelineItem}>
            <span className={css.timelineIcon}>{TYPE_ICONS[entry.type]}</span>
            <div className={css.timelineBody}>
              <div className={css.timelineLabel}>{entry.label}</div>
              <div className={css.timelineDetail}>{entry.detail}</div>
            </div>
            <span className={css.timelineTime}>{formatTime(entry.timestamp)}</span>
          </div>
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
    <ul className={css.messageList}>
      {sorted.map((m) => {
        const isSent = m.from === agentId;
        return (
          <li key={m.id}>
            <div className={`${css.messageItem} ${isSent ? css.messageSent : css.messageReceived}`}>
              <div className={css.messageMeta}>
                <span className={css.messageDirection}>{isSent ? '↗ Sent' : '↙ Received'}</span>
                <span className={css.messageType}>{m.messageType}</span>
                <span className={css.messageTime}>{formatTime(m.timestamp)}</span>
              </div>
              <div className={css.messagePeer}>
                {isSent ? `To: ${m.to ?? 'broadcast'}` : `From: ${m.from}`}
              </div>
              <div className={css.messageContent}>{m.content}</div>
            </div>
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
    <div className={css.statsGrid}>
      <div className={css.statBox}>
        <span className={css.statBoxValue}>{agent.status}</span>
        <span className={css.statBoxLabel}>Status</span>
      </div>
      <div className={css.statBox}>
        <span className={css.statBoxValue}>{messagesSent}</span>
        <span className={css.statBoxLabel}>Messages sent</span>
      </div>
      <div className={css.statBox}>
        <span className={css.statBoxValue}>{tasksCompleted}</span>
        <span className={css.statBoxLabel}>Tasks completed</span>
      </div>
      <div className={css.statBox}>
        <span className={css.statBoxValue}>{codeChangesCount}</span>
        <span className={css.statBoxLabel}>Code changes</span>
      </div>
      <div className={`${css.statBox} ${css.statBoxFull}`}>
        <span className={css.statBoxValue}>{formatTimeSince(agent.lastHeartbeat)}</span>
        <span className={css.statBoxLabel}>Last heartbeat</span>
      </div>
    </div>
  );
}
