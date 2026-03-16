import { useEffect, useCallback, useState } from 'react';
import type { OfficeEngine } from '../engine/OfficeEngine';
import type { TimeTravelState } from '../engine/TimeTravelController';

/**
 * React hook for the time-travel replay engine.
 * Provides play/pause/scrub controls, bookmarks, and current state.
 */
export function useEventReplay(engine: OfficeEngine | null) {
  const [state, setState] = useState<TimeTravelState>({
    mode: 'live',
    currentTime: Date.now(),
    playbackSpeed: 1,
    isPlaying: false,
    minTime: Date.now(),
    maxTime: Date.now(),
    eventCount: 0,
    bookmarks: [],
  });

  useEffect(() => {
    if (!engine?.ready) return;

    const unsub = engine.timeTravel.subscribe((newState) => {
      setState(newState);
    });

    return unsub;
  }, [engine]);

  const play = useCallback(() => engine?.timeTravel.play(), [engine]);
  const pause = useCallback(() => engine?.timeTravel.pause(), [engine]);
  const setSpeed = useCallback((s: number) => engine?.timeTravel.setSpeed(s), [engine]);
  const scrubTo = useCallback((t: number) => engine?.timeTravel.scrubTo(t), [engine]);
  const goLive = useCallback(() => engine?.timeTravel.switchToLive(), [engine]);
  const startReplay = useCallback(() => engine?.timeTravel.switchToReplay(), [engine]);
  const addBookmark = useCallback((ts: number, label: string) => engine?.timeTravel.addBookmark(ts, label), [engine]);

  return {
    ...state,
    play,
    pause,
    setSpeed,
    scrubTo,
    goLive,
    startReplay,
    addBookmark,
  };
}
