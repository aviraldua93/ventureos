import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVentureStore } from '../store';
import { Card, Badge } from './ui';
import css from './MessageStream.module.css';

type MessageType = 'chat' | 'task' | 'review' | 'blocker';

const TYPE_BADGE_STATUS: Record<MessageType, 'active' | 'idle' | 'error' | 'offline'> = {
  chat: 'active',
  task: 'idle',
  review: 'offline',
  blocker: 'error',
};

const FILTER_OPTIONS: Array<{ value: MessageType | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'chat', label: '💬 Chat' },
  { value: 'task', label: '📋 Task' },
  { value: 'review', label: '🔍 Review' },
  { value: 'blocker', label: '⚠️ Blocker' },
];

const AVATAR_COLORS = [
  'var(--agent-color-1)', 'var(--agent-color-2)', 'var(--agent-color-3)',
  'var(--agent-color-4)', 'var(--agent-color-5)', 'var(--agent-color-6)',
  'var(--agent-color-7)', 'var(--agent-color-8)', 'var(--agent-color-9)',
  'var(--agent-color-10)',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 10) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

export function MessageStream() {
  const messages = useVentureStore((s) => s.messages);
  const agents = useVentureStore((s) => s.agents);

  const [filter, setFilter] = useState<MessageType | 'all'>('all');
  const [isUserScrolled, setIsUserScrolled] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessageCount = useRef(0);

  const agentNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const agent of agents) {
      map.set(agent.id, agent.name);
    }
    return map;
  }, [agents]);

  const getAgentName = useCallback(
    (id: string) => agentNameMap.get(id) ?? id,
    [agentNameMap],
  );

  const filteredMessages =
    filter === 'all'
      ? messages
      : messages.filter((m) => m.messageType === filter);

  useEffect(() => {
    if (
      !isUserScrolled &&
      scrollRef.current &&
      filteredMessages.length > prevMessageCount.current
    ) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    prevMessageCount.current = filteredMessages.length;
  }, [filteredMessages, isUserScrolled]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setIsUserScrolled(!atBottom);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setIsUserScrolled(false);
    }
  }, []);

  return (
    <div className={css.container}>
      <div className={css.header}>
        <div className={css.title}>💬 Message Stream</div>
        <div className={css.filters}>
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`${css.filterBtn} ${filter === opt.value ? css.filterBtnActive : ''}`}
              onClick={() => setFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {filteredMessages.length === 0 ? (
        <div className={css.empty}>
          No messages yet — waiting for agents to start talking
        </div>
      ) : (
        <div className={css.messagesWrapper}>
          <div
            className={css.messages}
            ref={scrollRef}
            onScroll={handleScroll}
          >
            <AnimatePresence initial={false}>
              {filteredMessages.map((msg) => {
                const senderName = getAgentName(msg.from);
                const recipientName = msg.to
                  ? getAgentName(msg.to)
                  : 'broadcast';

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className={css.messageCard}>
                      <div
                        className={css.avatar}
                        style={{ background: getAvatarColor(senderName) }}
                      >
                        {getInitials(senderName)}
                      </div>
                      <div className={css.body}>
                        <div className={css.meta}>
                          <span className={css.sender}>{senderName}</span>
                          <span className={css.arrow}>→</span>
                          <span className={css.recipient}>{recipientName}</span>
                          <Badge status={TYPE_BADGE_STATUS[msg.messageType]}>
                            {msg.messageType}
                          </Badge>
                        </div>
                        <div className={css.content}>{msg.content}</div>
                        <div className={css.timestamp}>
                          {formatRelativeTime(msg.timestamp)}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {isUserScrolled && (
            <button className={css.scrollBtn} onClick={scrollToBottom}>
              ↓ New messages
            </button>
          )}
        </div>
      )}
    </div>
  );
}