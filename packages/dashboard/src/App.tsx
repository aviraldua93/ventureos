import { useWebSocket } from './hooks/useWebSocket';
import { useVentureStore } from './store';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui';
import { OrgChart } from './components/OrgChart';
import { MessageStream } from './components/MessageStream';
import { TaskBoard } from './components/TaskBoard';
import { CodeDiffView } from './components/CodeDiffView';
import { AgentDetail } from './components/AgentDetail';
import { DemoControls } from './components/DemoControls';
import './App.css';
import css from './App.module.css';

export default function App() {
  useWebSocket();
  const { agents, tasks, messages, codeChanges, connected } = useVentureStore();
  const eventCount = agents.length + tasks.length + messages.length + codeChanges.length;

  return (
    <div className={css.app}>
      {/* Header */}
      <header className={css.header}>
        <div className={css.headerLeft}>
          <h1 className={css.headerTitle}>🚀 VentureOS</h1>
          <span className={css.subtitle}>Mission Control for Agent Teams</span>
        </div>
        <div className={css.headerRight}>
          <span className={`${css.statusDot} ${connected ? css.connected : css.disconnected}`} />
          <span className={css.statusText}>{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </header>

      {/* Navigation Tabs */}
      <Tabs defaultValue="dashboard" className={css.mainContent}>
        <TabsList>
          <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
          <TabsTrigger value="office">🏢 Virtual Office</TabsTrigger>
          <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" style={{ flex: 1, overflow: 'hidden', padding: 0 }}>
          <div className={css.dashboardGrid}>
            <aside className={css.panelLeft} data-testid="panel-left">
              <OrgChart />
            </aside>
            <section className={css.panelCenter} data-testid="panel-center">
              <MessageStream />
              <TaskBoard />
            </section>
            <aside className={css.panelRight}>
              <CodeDiffView />
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="office" style={{ flex: 1, overflow: 'hidden', padding: 0 }}>
          <div className={css.placeholderView}>
            <span className={css.placeholderIcon}>🏢</span>
            <p>Virtual Office — Coming in Phase 2</p>
          </div>
        </TabsContent>

        <TabsContent value="settings" style={{ flex: 1, overflow: 'hidden', padding: 0 }}>
          <div className={css.placeholderView}>
            <span className={css.placeholderIcon}>⚙️</span>
            <p>Settings — Coming in Phase 2</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Agent detail slide-out panel */}
      <AgentDetail />

      {/* Demo controls bottom bar */}
      <DemoControls />

      {/* Status bar */}
      <footer className={css.statusBar} data-testid="status-bar">
        <span>Agents: {agents.length}</span>
        <span>Tasks: {tasks.length}</span>
        <span>Messages: {messages.length}</span>
        <span>Code Changes: {codeChanges.length}</span>
        <span className={css.statusDivider}>|</span>
        <span>Total Events: {eventCount}</span>
        <span className={`${css.statusDotSmall} ${connected ? css.connected : css.disconnected}`} />
      </footer>
    </div>
  );
}
