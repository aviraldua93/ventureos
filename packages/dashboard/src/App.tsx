import { useRef, useState, useCallback, useEffect } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { useVentureStore } from './store';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui';
import { OrgChart } from './components/OrgChart';
import { AgentListPanel } from './components/AgentListPanel';
import { MessageStream } from './components/MessageStream';
import { TaskBoard } from './components/TaskBoard';
import { CodeDiffView } from './components/CodeDiffView';
import { AgentDetail } from './components/AgentDetail';
import { DemoControls } from './components/DemoControls';
import { VirtualOffice } from './components/VirtualOffice/VirtualOffice';
import './App.css';
import css from './App.module.css';

function useResizablePanels(initL: number, initR: number, minL: number, minR: number, minC: number) {
  const [leftW, setLeftW] = useState(initL);
  const [rightW, setRightW] = useState(initR);
  const dragging = useRef<'left' | 'right' | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const startDrag = useCallback((side: 'left' | 'right') => {
    dragging.current = side;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current || !gridRef.current) return;
      const rect = gridRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (dragging.current === 'left') {
        setLeftW(Math.max(minL, Math.min(x, rect.width - rightW - minC)));
      } else {
        setRightW(Math.max(minR, Math.min(rect.right - e.clientX, rect.width - leftW - minC)));
      }
    };
    const onUp = () => {
      dragging.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [leftW, rightW, minL, minR, minC]);

  return { leftW, rightW, gridRef, startDrag };
}

export default function App() {
  useWebSocket();
  const { agents, tasks, messages, codeChanges, connected } = useVentureStore();
  const eventCount = agents.length + tasks.length + messages.length + codeChanges.length;
  const { leftW, rightW, gridRef, startDrag } = useResizablePanels(260, 320, 180, 200, 300);

  return (
    <Tabs defaultValue="dashboard" className={css.app}>
      {/* Header — Linear-style top bar with integrated navigation */}
      <header className={css.header}>
        <div className={css.headerLeft}>
          <div className={css.logoMark}>⚡</div>
          <h1 className={css.headerTitle}>VentureOS</h1>
          <span className={css.headerDivider} />
          <span className={css.subtitle}>Mission Control</span>
        </div>

        <div className={css.headerCenter}>
          <TabsList className={css.navList}>
            <TabsTrigger value="dashboard" className={css.navTrigger}>Dashboard</TabsTrigger>
            <TabsTrigger value="org" className={css.navTrigger}>Org Chart</TabsTrigger>
            <TabsTrigger value="office" className={css.navTrigger}>Virtual Office</TabsTrigger>
            <TabsTrigger value="settings" className={css.navTrigger}>Settings</TabsTrigger>
          </TabsList>
        </div>

        <div className={css.headerRight}>
          <span className={`${css.connectionBadge} ${connected ? css.connected : css.disconnected}`}>
            <span className={css.statusDot} />
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>
      </header>

      {/* Dashboard tab */}
      <TabsContent value="dashboard" className={css.tabContent}>
        <div
          className={css.dashboardGrid}
          ref={gridRef}
          style={{ gridTemplateColumns: `${leftW}px 4px 1fr 4px ${rightW}px` }}
        >
          <aside className={css.panelLeft} data-testid="panel-left">
            <AgentListPanel />
          </aside>
          <div className={css.resizeHandle} onMouseDown={() => startDrag('left')}>
            <div className={css.resizeGrip} />
          </div>
          <section className={css.panelCenter} data-testid="panel-center">
            <MessageStream />
            <TaskBoard />
          </section>
          <div className={css.resizeHandle} onMouseDown={() => startDrag('right')}>
            <div className={css.resizeGrip} />
          </div>
          <aside className={css.panelRight}>
            <CodeDiffView />
          </aside>
        </div>
      </TabsContent>

      {/* Org Chart tab — full-page org chart view */}
      <TabsContent value="org" className={css.tabContent}>
        <OrgChart />
      </TabsContent>

      {/* Virtual Office tab */}
      <TabsContent value="office" className={css.tabContent}>
        <VirtualOffice />
      </TabsContent>

      {/* Settings tab */}
      <TabsContent value="settings" className={css.tabContent}>
        <div className={css.placeholderView}>
          <div className={css.placeholderIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <p className={css.placeholderTitle}>Settings</p>
          <p className={css.placeholderDesc}>Configuration panel coming in Phase 2</p>
        </div>
      </TabsContent>

      {/* Agent detail slide-out panel */}
      <AgentDetail />

      {/* Demo controls */}
      <DemoControls />

      {/* Status bar — VS Code style */}
      <footer className={css.statusBar} data-testid="status-bar">
        <div className={css.statusLeft}>
          <span className={css.statusItem}>
            <span className={css.statusLabel}>Agents</span>
            <span className={css.statusValue}>{agents.length}</span>
          </span>
          <span className={css.statusSep} />
          <span className={css.statusItem}>
            <span className={css.statusLabel}>Tasks</span>
            <span className={css.statusValue}>{tasks.length}</span>
          </span>
          <span className={css.statusSep} />
          <span className={css.statusItem}>
            <span className={css.statusLabel}>Messages</span>
            <span className={css.statusValue}>{messages.length}</span>
          </span>
          <span className={css.statusSep} />
          <span className={css.statusItem}>
            <span className={css.statusLabel}>Diffs</span>
            <span className={css.statusValue}>{codeChanges.length}</span>
          </span>
        </div>
        <div className={css.statusRight}>
          <span className={css.statusItem}>
            <span className={css.statusLabel}>Events</span>
            <span className={css.statusValue}>{eventCount}</span>
          </span>
          <span className={css.statusSep} />
          <span className={`${css.statusDotSmall} ${connected ? css.connected : css.disconnected}`} />
          <span className={css.statusConnectionLabel}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </footer>
    </Tabs>
  );
}
