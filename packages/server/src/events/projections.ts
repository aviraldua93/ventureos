import type {
  VentureEvent,
  Agent,
  Task,
  Message,
  CodeChange,
  Snapshot,
} from '@ventureos/shared';
import type { EventStore } from './store';

export class Projections {
  constructor(private store: EventStore) {}

  getAgents(): Agent[] {
    const agents = new Map<string, Agent>();

    for (const event of this.store.getAll()) {
      if (event.type === 'agent/register') {
        agents.set(event.data.agentId, {
          id: event.data.agentId,
          name: event.data.name,
          role: event.data.role,
          parentId: event.data.parentId,
          status: 'idle',
          lastHeartbeat: event.timestamp,
          capabilities: event.data.capabilities ?? [],
        });
      } else if (event.type === 'agent/heartbeat') {
        const agent = agents.get(event.data.agentId);
        if (agent) {
          agent.status = event.data.status;
          agent.currentTask = event.data.currentTask;
          agent.lastHeartbeat = event.timestamp;
        }
      }
    }

    return Array.from(agents.values());
  }

  getTasks(): Task[] {
    const tasks = new Map<string, Task>();

    for (const event of this.store.getAll()) {
      if (event.type === 'agent/task_update') {
        tasks.set(event.data.taskId, {
          id: event.data.taskId,
          title: event.data.title,
          status: event.data.status,
          assigneeId: event.data.assigneeId,
          description: event.data.description,
          updatedAt: event.timestamp,
        });
      }
    }

    return Array.from(tasks.values());
  }

  getMessages(): Message[] {
    const messages: Message[] = [];
    let counter = 0;

    for (const event of this.store.getAll()) {
      if (event.type === 'agent/message') {
        messages.push({
          id: `msg-${counter++}`,
          from: event.data.from,
          to: event.data.to,
          content: event.data.content,
          messageType: event.data.messageType,
          timestamp: event.timestamp,
        });
      }
    }

    return messages;
  }

  getCodeChanges(): CodeChange[] {
    const changes: CodeChange[] = [];
    let counter = 0;

    for (const event of this.store.getAll()) {
      if (event.type === 'agent/code_change') {
        changes.push({
          id: `cc-${counter++}`,
          agentId: event.data.agentId,
          filePath: event.data.filePath,
          diff: event.data.diff,
          description: event.data.description,
          timestamp: event.timestamp,
        });
      }
    }

    return changes;
  }

  getSnapshot(): Snapshot {
    return {
      agents: this.getAgents(),
      tasks: this.getTasks(),
      messages: this.getMessages(),
      codeChanges: this.getCodeChanges(),
    };
  }
}
