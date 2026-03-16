import { create } from 'zustand';
import type {
  Agent,
  Task,
  Message,
  CodeChange,
  Snapshot,
  VentureEvent,
} from '@ventureos/shared';

interface VentureStore {
  agents: Agent[];
  tasks: Task[];
  messages: Message[];
  codeChanges: CodeChange[];
  connected: boolean;
  selectedAgentId: string | null;
  eventLog: VentureEvent[];

  setSnapshot: (snapshot: Snapshot) => void;
  addEvent: (event: VentureEvent) => void;
  setConnected: (connected: boolean) => void;
  setSelectedAgentId: (id: string | null) => void;
}

export const useVentureStore = create<VentureStore>((set, get) => ({
  agents: [],
  tasks: [],
  messages: [],
  codeChanges: [],
  connected: false,
  selectedAgentId: null,
  eventLog: [],

  setSnapshot: (snapshot) =>
    set({
      agents: snapshot.agents,
      tasks: snapshot.tasks,
      messages: snapshot.messages,
      codeChanges: snapshot.codeChanges,
    }),

  addEvent: (event) => {
    const state = get();
    // Immutable eventLog update — ensures Zustand detects the change
    const eventLog = [...state.eventLog, event];

    switch (event.type) {
      case 'agent/register': {
        const existing = state.agents.find((a) => a.id === event.data.agentId);
        if (existing) {
          set({ eventLog });
          return;
        }
        set({
          eventLog,
          agents: [
            ...state.agents,
            {
              id: event.data.agentId,
              name: event.data.name,
              role: event.data.role,
              parentId: event.data.parentId,
              status: 'idle',
              lastHeartbeat: event.timestamp,
              capabilities: event.data.capabilities ?? [],
            },
          ],
        });
        break;
      }

      case 'agent/heartbeat': {
        set({
          eventLog,
          agents: state.agents.map((a) =>
            a.id === event.data.agentId
              ? {
                  ...a,
                  status: event.data.status,
                  currentTask: event.data.currentTask,
                  lastHeartbeat: event.timestamp,
                }
              : a,
          ),
        });
        break;
      }

      case 'agent/task_update': {
        const existingTask = state.tasks.find((t) => t.id === event.data.taskId);
        if (existingTask) {
          set({
            eventLog,
            tasks: state.tasks.map((t) =>
              t.id === event.data.taskId
                ? {
                    ...t,
                    title: event.data.title,
                    status: event.data.status,
                    assigneeId: event.data.assigneeId,
                    description: event.data.description,
                    updatedAt: event.timestamp,
                  }
                : t,
            ),
          });
        } else {
          set({
            eventLog,
            tasks: [
              ...state.tasks,
              {
                id: event.data.taskId,
                title: event.data.title,
                status: event.data.status,
                assigneeId: event.data.assigneeId,
                description: event.data.description,
                updatedAt: event.timestamp,
              },
            ],
          });
        }
        break;
      }

      case 'agent/message': {
        set({
          eventLog,
          messages: [
            ...state.messages,
            {
              id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              from: event.data.from,
              to: event.data.to,
              content: event.data.content,
              messageType: event.data.messageType,
              timestamp: event.timestamp,
            },
          ],
        });
        break;
      }

      case 'agent/code_change': {
        set({
          eventLog,
          codeChanges: [
            ...state.codeChanges,
            {
              id: `cc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              agentId: event.data.agentId,
              filePath: event.data.filePath,
              diff: event.data.diff,
              description: event.data.description,
              timestamp: event.timestamp,
            },
          ],
        });
        break;
      }

      default: {
        set({ eventLog });
        break;
      }
    }
  },

  setConnected: (connected) => set({ connected }),
  setSelectedAgentId: (id) => set({ selectedAgentId: id }),
}));
