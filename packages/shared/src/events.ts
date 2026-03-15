// All event types — the core event schema for VentureOS

export type VentureEvent =
  | AgentRegisterEvent
  | AgentHeartbeatEvent
  | AgentTaskUpdateEvent
  | AgentMessageEvent
  | AgentCodeChangeEvent;

export interface AgentRegisterEvent {
  type: 'agent/register';
  timestamp: number;
  data: {
    agentId: string;
    name: string;
    role: string;
    parentId?: string;
    capabilities?: string[];
  };
}

export interface AgentHeartbeatEvent {
  type: 'agent/heartbeat';
  timestamp: number;
  data: {
    agentId: string;
    status: 'active' | 'idle' | 'error' | 'offline';
    currentTask?: string;
  };
}

export interface AgentTaskUpdateEvent {
  type: 'agent/task_update';
  timestamp: number;
  data: {
    taskId: string;
    title: string;
    status: 'backlog' | 'in_progress' | 'review' | 'done';
    assigneeId?: string;
    description?: string;
  };
}

export interface AgentMessageEvent {
  type: 'agent/message';
  timestamp: number;
  data: {
    from: string;
    to?: string;
    content: string;
    messageType: 'chat' | 'task' | 'review' | 'blocker';
  };
}

export interface AgentCodeChangeEvent {
  type: 'agent/code_change';
  timestamp: number;
  data: {
    agentId: string;
    filePath: string;
    diff: string;
    description: string;
  };
}
