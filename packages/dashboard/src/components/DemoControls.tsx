import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui';
import css from './DemoControls.module.css';

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
      const res = await fetch(`${API}/api/demo/status`);
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
      await fetch(`${API}${apiPath}`, {
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
        <motion.div
          className={css.banner}
          initial={{ y: -40 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          🎬 Demo Mode — {status.paused ? 'Paused' : 'Playing'} at {status.speed}x
        </motion.div>
      )}

      <div className={css.controls} data-testid="demo-controls">
        <div className={css.left}>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button variant="primary" size="sm" onClick={handlePlayPause}>
              {playLabel}
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button variant="secondary" size="sm" onClick={handleRestart}>
              🔄 Restart
            </Button>
          </motion.div>
        </div>

        <div className={css.center}>
          <div className={css.progressTrack}>
            <motion.div
              className={css.progressFill}
              animate={{ width: `${status.progress.pct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className={css.progressText}>
            {status.progress.current}/{status.progress.total} ({status.progress.pct}%)
          </span>
        </div>

        <div className={css.right}>
          {SPEEDS.map((s) => (
            <motion.div key={s} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                className={status.speed === s ? css.speedActive : undefined}
                onClick={() => handleSpeed(s)}
              >
                {s}x
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
