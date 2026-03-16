import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVentureStore } from '../store';
import css from './MessageStream.module.css';

type MessageType = 'chat' | 'task' | 'review' | 'blocker';

const FILTER_OPTIONS: Array<{ value: MessageType | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'chat', label: 'Chat' },
  { value: 'task', label: 'Task' },
  { value: 'review', label: 'Review' },
  { value: 'blocker', label: 'Blocker' },
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
  if (diffSec < 10) return 'now';
  if (diffSec < 60) return `${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  return `${Math.floor(diffHr / 24)}d`;
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

  const filteredMessages = useMemo(
    () =>
      filter === 'all'
        ? messages
        : messages.filter((m) => m.messageType === filter),
    [messages, filter],
  );

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
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    setIsUserScrolled(false);
  }, []);

  return (
    <div className={css.container} data-testid="message-stream">
      <div className={css.header}>
        <span className={css.title}>Activity</span>
        <span className={css.messageCount}>{filteredMessages.length}</span>
        <div className={css.filters} data-testid="message-filters">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`${css.filterBtn} ${filter === opt.value ? css.filterBtnActive : ''}`}
              onClick={() => setFilter(opt.value)}
              aria-label={`Filter by ${opt.label}`}
              data-testid={`message-filter-${opt.value}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {filteredMessages.length === 0 ? (
        <div className={css.empty}>
          <span className={css.emptyText}>No activity yet</span>
          <span className={css.emptySub}>Messages will appear here as agents communicate</span>
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
                    className={css.messageRow}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                  >
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
                        <span className={`${css.typePill} ${css[msg.messageType]}`}>
                          {msg.messageType}
                        </span>
                        <span className={css.timestamp}>
                          {formatRelativeTime(msg.timestamp)}
                        </span>
                      </div>
                      <div className={css.content}>{msg.content}</div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {isUserScrolled && (
              <motion.button
                className={css.scrollBtn}
                onClick={scrollToBottom}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                aria-label="Scroll to new messages"
                data-testid="message-scroll-btn"
              >
                ↓ New messages
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}