import { useState, useRef, useEffect, useCallback } from 'react';
import { useVentureStore } from '../store';
import './MessageStream.css';

type MessageType = 'chat' | 'task' | 'review' | 'blocker';

const TYPE_BADGES: Record<MessageType, string> = {
  chat: '💬 chat',
  task: '📋 task',
  review: '🔍 review',
  blocker: '⚠️ blocker',
};

const FILTER_OPTIONS: Array<{ value: MessageType | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'chat', label: '💬 Chat' },
  { value: 'task', label: '📋 Task' },
  { value: 'review', label: '🔍 Review' },
  { value: 'blocker', label: '⚠️ Blocker' },
];

const AVATAR_COLORS = [
  '#e06c75', '#61afef', '#c678dd', '#98c379',
  '#e5c07b', '#56b6c2', '#be5046', '#d19a66',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
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

  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export function MessageStream() {
  const messages = useVentureStore((s) => s.messages);
  const agents = useVentureStore((s) => s.agents);

  const [filter, setFilter] = useState<MessageType | 'all'>('all');
  const [isUserScrolled, setIsUserScrolled] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessageCount = useRef(0);

  const agentNameMap = useRef(new Map<string, string>());
  for (const agent of agents) {
    agentNameMap.current.set(agent.id, agent.name);
  }

  const getAgentName = useCallback(
    (id: string) => agentNameMap.current.get(id) ?? id,
    [],
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
    <div className="message-stream">
      <div className="ms-header">
        <div className="ms-title">💬 Message Stream</div>
        <div className="ms-filters">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`ms-filter-btn${filter === opt.value ? ' active' : ''}`}
              onClick={() => setFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {filteredMessages.length === 0 ? (
        <div className="ms-empty">
          No messages yet — waiting for agents to start talking
        </div>
      ) : (
        <div className="ms-messages-wrapper">
          <div
            className="ms-messages"
            ref={scrollRef}
            onScroll={handleScroll}
          >
            {filteredMessages.map((msg) => {
              const senderName = getAgentName(msg.from);
              const recipientName = msg.to
                ? getAgentName(msg.to)
                : 'broadcast';

              return (
                <div key={msg.id} className="ms-message">
                  <div
                    className="ms-avatar"
                    style={{ background: getAvatarColor(senderName) }}
                  >
                    {senderName[0]}
                  </div>
                  <div className="ms-body">
                    <div className="ms-meta">
                      <span className="ms-sender">{senderName}</span>
                      <span className="ms-arrow">→</span>
                      <span className="ms-recipient">{recipientName}</span>
                      <span className="ms-type-badge">
                        {TYPE_BADGES[msg.messageType]}
                      </span>
                    </div>
                    <div className="ms-content">{msg.content}</div>
                    <div className="ms-timestamp">
                      {formatRelativeTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {isUserScrolled && (
            <button className="ms-scroll-btn" onClick={scrollToBottom}>
              ↓ New messages
            </button>
          )}
        </div>
      )}
    </div>
  );
}