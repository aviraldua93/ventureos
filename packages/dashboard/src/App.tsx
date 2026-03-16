import { useRef, useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { useVentureStore } from './store';
import { Tabs, TabsList, TabsTrigger, TabsContent, ErrorBoundary } from './components/ui';
import { OrgChart } from './components/OrgChart';
import { AgentListPanel } from './components/AgentListPanel';
import { MessageStream } from './components/MessageStream';
import { TaskBoard } from './components/TaskBoard';
import { CodeDiffView } from './components/CodeDiffView';
import { AgentDetail } from './components/AgentDetail';
import { DemoControls } from './components/DemoControls';
import './App.css';
import css from './App.module.css';

const VirtualOffice = lazy(() =>
  import('./components/VirtualOffice/VirtualOffice').then(m => ({ default: m.VirtualOffice }))
);

// Spectator mode: read-only view triggered by ?spectator=1 URL param
const isSpectator = new URLSearchParams(window.location.search).get('spectator') === '1';

// Theme management
type ThemeMode = 'dark' | 'light' | 'midnight';
const THEMES: { value: ThemeMode; label: string }[] = [
  { value: 'dark', label: '🌙 Dark (Default)' },
  { value: 'light', label: '☀️ Light' },
  { value: 'midnight', label: '🌌 Midnight' },
];

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
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('ventureos-theme') as ThemeMode) || 'dark';
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('ventureos-theme', theme);
  }, [theme]);

  // Generate spectator share link
  const spectatorLink = `${window.location.origin}${window.location.pathname}?spectator=1`;

  return (
    <Tabs defaultValue="dashboard" className={css.app}>
      {/* Header — Linear-style top bar with integrated navigation */}
      <header className={css.header}>
        <div className={css.headerLeft}>
          <div className={css.logoMark}>⚡</div>
          <h1 className={css.headerTitle}>VentureOS</h1>
          <span className={css.headerDivider} />
          <span className={css.subtitle}>Mission Control</span>
          {isSpectator && (
            <span className={css.spectatorBadge} data-testid="spectator-badge">👁 Spectator</span>
          )}
        </div>

        <div className={css.headerCenter}>
          <TabsList className={css.navList}>
            <TabsTrigger value="dashboard" className={css.navTrigger}>Dashboard</TabsTrigger>
            <TabsTrigger value="org" className={css.navTrigger}>Org Chart</TabsTrigger>
            <TabsTrigger value="office" className={css.navTrigger}>Virtual Office</TabsTrigger>
            {!isSpectator && <TabsTrigger value="settings" className={css.navTrigger}>Settings</TabsTrigger>}
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

      {/* Virtual Office tab — lazy-loaded with error boundary */}
      <TabsContent value="office" className={css.tabContent}>
        <ErrorBoundary fallback={
          <div className={css.placeholderView}>
            <div className={css.placeholderIcon}>⚠️</div>
            <p className={css.placeholderTitle}>Virtual Office Error</p>
            <p className={css.placeholderDesc}>The rendering engine encountered an error. Try refreshing the page.</p>
          </div>
        }>
          <Suspense fallback={
            <div className={css.placeholderView}>
              <div className={css.placeholderIcon}>🏢</div>
              <p className={css.placeholderTitle}>Loading Virtual Office…</p>
              <p className={css.placeholderDesc}>Initializing rendering engine</p>
            </div>
          }>
            <VirtualOffice />
          </Suspense>
        </ErrorBoundary>
      </TabsContent>

      {/* Settings tab */}
      {!isSpectator && (
        <TabsContent value="settings" className={css.tabContent}>
          <div className={css.settingsView} data-testid="settings-panel">
            <div className={css.settingsSection}>
              <h2 className={css.settingsSectionTitle}>Appearance</h2>
              <div className={css.settingsRow}>
                <label className={css.settingsLabel}>Theme</label>
                <select
                  className={css.settingsSelect}
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as ThemeMode)}
                  data-testid="theme-selector"
                >
                  {THEMES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={css.settingsSection}>
              <h2 className={css.settingsSectionTitle}>Spectator Mode</h2>
              <p className={css.settingsDesc}>Share this link to let others watch your office in read-only mode:</p>
              <div className={css.settingsRow}>
                <input
                  className={css.settingsInput}
                  readOnly
                  value={spectatorLink}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  data-testid="spectator-link"
                />
                <button
                  className={css.settingsBtn}
                  onClick={() => {
                    navigator.clipboard.writeText(spectatorLink);
                  }}
                >
                  Copy
                </button>
              </div>
            </div>

            <div className={css.settingsSection}>
              <h2 className={css.settingsSectionTitle}>Office Customization</h2>
              <p className={css.settingsDesc}>Room naming and layout customization coming in Phase 2.</p>
            </div>
          </div>
        </TabsContent>
      )}

      {/* Agent detail slide-out panel */}
      <AgentDetail />

      {/* Demo controls — hidden in spectator mode */}
      {!isSpectator && <DemoControls />}

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
