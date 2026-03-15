// Derived state types — projected from the event log

export interface Agent {
  id: string;
  name: string;
  role: string;
  parentId?: string;
  status: 'active' | 'idle' | 'error' | 'offline';
  currentTask?: string;
  lastHeartbeat: number;
  capabilities: string[];
}

export interface Task {
  id: string;
  title: string;
  status: 'backlog' | 'in_progress' | 'review' | 'done';
  assigneeId?: string;
  description?: string;
  updatedAt: number;
}

export interface Message {
  id: string;
  from: string;
  to?: string;
  content: string;
  messageType: 'chat' | 'task' | 'review' | 'blocker';
  timestamp: number;
}

export interface CodeChange {
  id: string;
  agentId: string;
  filePath: string;
  diff: string;
  description: string;
  timestamp: number;
}
