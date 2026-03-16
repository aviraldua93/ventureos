import { useWebSocket } from './hooks/useWebSocket';
import { useVentureStore } from './store';
import { OrgChart } from './components/OrgChart';
import { MessageStream } from './components/MessageStream';
import { TaskBoard } from './components/TaskBoard';
import { CodeDiffView } from './components/CodeDiffView';
import { AgentDetail } from './components/AgentDetail';
import './App.css';

export default function App() {
  useWebSocket();
  const { agents, tasks, messages, codeChanges, connected } = useVentureStore();
  const eventCount = agents.length + tasks.length + messages.length + codeChanges.length;

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1>🚀 VentureOS</h1>
          <span className="subtitle">Mission Control for Agent Teams</span>
        </div>
        <div className="header-right">
          <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`} />
          <span className="status-text">{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </header>

      {/* Main 3-panel layout */}
      <main className="main-grid">
        <aside className="panel-left">
          <OrgChart />
        </aside>

        <section className="panel-center">
          <MessageStream />
          <TaskBoard />
        </section>

        <aside className="panel-right">
          <CodeDiffView />
        </aside>
      </main>

      {/* Agent detail slide-out panel */}
      <AgentDetail />

      {/* Status bar */}
      <footer className="status-bar">
        <span>Agents: {agents.length}</span>
        <span>Tasks: {tasks.length}</span>
        <span>Messages: {messages.length}</span>
        <span>Code Changes: {codeChanges.length}</span>
        <span className="status-bar-divider">|</span>
        <span>Total Events: {eventCount}</span>
        <span className={`status-dot-small ${connected ? 'connected' : 'disconnected'}`} />
      </footer>
    </div>
  );
}
