// @ventureos/shared — barrel export

export type {
  VentureEvent,
  AgentRegisterEvent,
  AgentHeartbeatEvent,
  AgentTaskUpdateEvent,
  AgentMessageEvent,
  AgentCodeChangeEvent,
} from './events';

export type {
  Agent,
  Task,
  Message,
  CodeChange,
} from './types';

export type {
  WSMessage,
  Snapshot,
} from './protocol';
