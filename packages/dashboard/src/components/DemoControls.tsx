import { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface DemoStatus {
  running: boolean;
  paused: boolean;
  speed: number;
  progress: { current: number; total: number; pct: number };
}

const SPEEDS = [1, 2, 5, 10];

export function DemoControls() {
  const [status, setStatus] = useState<DemoStatus>({
    running: false,
    paused: false,
    speed: 1,
    progress: { current: 0, total: 0, pct: 0 },
  });

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(\`\${API}/api/demo/status\`);
      if (res.ok) setStatus(await res.json());
    } catch {
      // server unreachable
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, 500);
    return () => clearInterval(id);
  }, [fetchStatus]);

  const post = async (apiPath: string, body?: object) => {
    try {
      await fetch(\`\${API}\${apiPath}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      await fetchStatus();
    } catch {
      // server unreachable
    }
  };

  const handlePlayPause = () => {
    if (!status.running) {
      post('/api/demo/start', { speed: status.speed });
    } else if (status.paused) {
      post('/api/demo/resume');
    } else {
      post('/api/demo/pause');
    }
  };

  const handleSpeed = (speed: number) => {
    post('/api/demo/speed', { speed });
  };

  const handleRestart = () => {
    post('/api/demo/restart');
  };

  const playLabel = !status.running
    ? '▶️ Play'
    : status.paused
    ? '▶️ Resume'
    : '⏸ Pause';

  return (
    <>
      {status.running && (
        <div className="demo-banner">
          🎬 Demo Mode — {status.paused ? 'Paused' : 'Playing'} at {status.speed}x
        </div>
      )}

      <div className="demo-controls">
        <div className="demo-controls-left">
          <button className="demo-btn demo-btn-play" onClick={handlePlayPause}>
            {playLabel}
          </button>
          <button className="demo-btn" onClick={handleRestart} title="Restart">
            🔄 Restart
          </button>
        </div>

        <div className="demo-controls-center">
          <div className="demo-progress-track">
            <div
              className="demo-progress-fill"
              style={{ width: \`\${status.progress.pct}%\` }}
            />
          </div>
          <span className="demo-progress-text">
            {status.progress.current}/{status.progress.total} ({status.progress.pct}%)
          </span>
        </div>

        <div className="demo-controls-right">
          {SPEEDS.map((s) => (
            <button
              key={s}
              className={\`demo-btn demo-btn-speed \${status.speed === s ? 'active' : ''}\`}
              onClick={() => handleSpeed(s)}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      <style>{\`
        .demo-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: linear-gradient(90deg, #0f3460 0%, #1a1a4e 50%, #0f3460 100%);
          color: #e6edf3;
          text-align: center;
          padding: 6px 0;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #30363d;
        }
        .demo-controls {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.5rem 1.5rem;
          background: #161b22;
          border-top: 1px solid #30363d;
        }
        .demo-controls-left,
        .demo-controls-right {
          display: flex;
          gap: 0.4rem;
          flex-shrink: 0;
        }
        .demo-controls-center {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .demo-btn {
          background: #21262d;
          border: 1px solid #30363d;
          color: #e6edf3;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 0.78rem;
          cursor: pointer;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .demo-btn:hover {
          background: #30363d;
        }
        .demo-btn-play {
          background: #0f3460;
          border-color: #1a5276;
        }
        .demo-btn-play:hover {
          background: #1a5276;
        }
        .demo-btn-speed.active {
          background: #0f3460;
          border-color: #58a6ff;
          color: #58a6ff;
        }
        .demo-progress-track {
          flex: 1;
          height: 6px;
          background: #21262d;
          border-radius: 3px;
          overflow: hidden;
        }
        .demo-progress-fill {
          height: 100%;
          background: #0f3460;
          border-radius: 3px;
          transition: width 0.3s ease;
        }
        .demo-progress-text {
          font-size: 0.72rem;
          color: #8b949e;
          white-space: nowrap;
        }
      \`}</style>
    </>
  );
}
