import { useEffect, useRef } from 'react';
import { useVentureStore } from '../store';
import type { WSMessage } from '@ventureos/shared';

const WS_URL = `ws://${window.location.hostname}:3000/ws`;
const MAX_RETRY_DELAY = 30_000;

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const retryDelay = useRef(1000);
  const { setSnapshot, addEvent, setConnected } = useVentureStore();

  useEffect(() => {
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    function connect() {
      if (!mounted) return;

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[ws] connected');
        setConnected(true);
        retryDelay.current = 1000;
      };

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data) as WSMessage;
          switch (msg.type) {
            case 'snapshot':
              setSnapshot(msg.payload);
              break;
            case 'event':
              addEvent(msg.payload);
              break;
            case 'pong':
              break;
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        console.log('[ws] disconnected, reconnecting...');
        setConnected(false);
        if (mounted) {
          timeoutId = setTimeout(connect, retryDelay.current);
          retryDelay.current = Math.min(retryDelay.current * 2, MAX_RETRY_DELAY);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    // Keepalive ping every 30s
    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30_000);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      clearInterval(pingInterval);
      wsRef.current?.close();
    };
  }, [setSnapshot, addEvent, setConnected]);
}
