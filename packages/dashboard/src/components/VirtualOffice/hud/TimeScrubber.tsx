import { useRef, useCallback, useMemo } from 'react';
import type { OfficeEngine } from '../engine/OfficeEngine';
import { useEventReplay } from '../bindings/useEventReplay';
import css from './TimeScrubber.module.css';

interface TimeScrubberProps {
  engine: OfficeEngine | null;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const SPEEDS = [1, 2, 5, 10];

export function TimeScrubber({ engine }: TimeScrubberProps) {
  const {
    mode, currentTime, playbackSpeed, isPlaying,
    minTime, maxTime, eventCount, bookmarks,
    play, pause, setSpeed, scrubTo, goLive, startReplay,
  } = useEventReplay(engine);

  const timelineRef = useRef<HTMLDivElement>(null);

  const density = useMemo(() => {
    return engine?.timeTravel.getEventDensity(80) ?? [];
  }, [engine, eventCount]);

  const maxDensity = Math.max(...density, 1);

  const progress = maxTime > minTime
    ? (currentTime - minTime) / (maxTime - minTime)
    : 0;

  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = minTime + pct * (maxTime - minTime);
    scrubTo(time);
  }, [minTime, maxTime, scrubTo]);

  const range = maxTime - minTime || 1;

  return (
    <div className={css.scrubber} data-testid="time-scrubber">
      {/* Timeline heatmap */}
      <div
        className={css.timelineContainer}
        ref={timelineRef}
        onClick={handleTimelineClick}
      >
        <div className={css.heatmap}>
          {density.map((count, i) => (
            <div
              key={i}
              className={css.heatmapBar}
              style={{ height: `${Math.max(6, (count / maxDensity) * 100)}%` }}
            />
          ))}
        </div>
        <div className={css.playhead} style={{ left: `${progress * 100}%` }} />

        {/* Bookmark markers */}
        {bookmarks.map((bm, i) => {
          const pos = ((bm.timestamp - minTime) / range) * 100;
          return (
            <div
              key={i}
              className={`${css.bookmarkMarker} ${bm.type === 'auto' ? css.bookmarkAuto : css.bookmarkManual}`}
              style={{ left: `${pos}%` }}
              title={bm.label}
              onClick={(e) => { e.stopPropagation(); scrubTo(bm.timestamp); }}
            />
          );
        })}
      </div>

      {/* Controls */}
      <div className={css.controls}>
        <button
          className={css.playBtn}
          onClick={() => { isPlaying ? pause() : play(); }}
          data-testid="replay-play-btn"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        {SPEEDS.map(s => (
          <button
            key={s}
            className={`${css.speedBtn} ${playbackSpeed === s ? css.activeSpeed : ''}`}
            onClick={() => setSpeed(s)}
          >
            {s}x
          </button>
        ))}

        <span className={css.timeLabel}>{formatTime(currentTime)}</span>
        <span className={css.eventCount}>{eventCount} events</span>

        {bookmarks.length > 0 && (
          <span className={css.bookmarkCount} data-testid="bookmark-count">📌 {bookmarks.length}</span>
        )}

        <div className={css.modeToggle}>
          <button
            className={`${css.modeBtn} ${mode === 'live' ? css.activeMode : ''}`}
            onClick={goLive}
          >
            🔴 Live
          </button>
          <button
            className={`${css.modeBtn} ${mode === 'replay' ? css.activeMode : ''}`}
            onClick={startReplay}
          >
            ⏪ Replay
          </button>
        </div>
      </div>
    </div>
  );
}
