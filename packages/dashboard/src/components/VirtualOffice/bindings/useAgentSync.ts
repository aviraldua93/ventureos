import { useEffect, useRef } from 'react';
import { useVentureStore } from '../../../store';
import type { OfficeEngine } from '../engine/OfficeEngine';
import type { VentureEvent } from '@ventureos/shared';
import type { EmotionState } from '../engine/SpriteManager';

/** Rooms idle agents can wander to for a "living office" feel */
const WANDER_TARGETS = [
  { x: 8, y: 2 },   // Break room (coffee)
  { x: 14, y: 2 },  // Meeting Room A
  { x: 20, y: 2 },  // Meeting Room B
  { x: 14, y: 14 }, // Collab Space
  { x: 5, y: 14 },  // Lobby
  { x: 11, y: 7 },  // Open office center
];

/**
 * Binds Zustand agent state to Canvas2D sprite behaviors.
 * Maps events to character animations, positions, effects, and emotions.
 * Processes events in small batches to avoid blocking the main thread.
 */
export function useAgentSync(engine: OfficeEngine | null) {
  const { agents, tasks, eventLog } = useVentureStore();
  const processedEvents = useRef(0);
  const deskAssignments = useRef(new Map<string, number>());
  const processingRef = useRef(false);
  const wanderTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Process new events in batches
  useEffect(() => {
    if (!engine?.ready) return;

    const newEvents = eventLog.slice(processedEvents.current);
    processedEvents.current = eventLog.length;

    if (newEvents.length === 0) return;

    const BATCH_SIZE = 10;
    let idx = 0;

    if (processingRef.current) return;
    processingRef.current = true;

    const processBatch = () => {
      const end = Math.min(idx + BATCH_SIZE, newEvents.length);
      for (; idx < end; idx++) {
        processEvent(engine, newEvents[idx], deskAssignments.current);
        engine.timeTravel.addEvent(newEvents[idx]);
      }

      if (idx < newEvents.length) {
        requestAnimationFrame(processBatch);
      } else {
        processingRef.current = false;
      }
    };

    if (newEvents.length <= BATCH_SIZE) {
      for (const event of newEvents) {
        processEvent(engine, event, deskAssignments.current);
        engine.timeTravel.addEvent(event);
      }
      processingRef.current = false;
    } else {
      requestAnimationFrame(processBatch);
    }
  }, [engine, eventLog.length]);

  // Sync agent statuses, spawn sprites for snapshot agents, derive emotions
  useEffect(() => {
    if (!engine?.ready) return;

    const desks = engine.tileMap.getDesks();

    for (const agent of agents) {
      let sprite = engine.sprites.getSprite(agent.id);

      // Spawn sprite if missing (snapshot agents or late arrivals)
      if (!sprite) {
        const deskIdx = deskAssignments.current.size % desks.length;
        deskAssignments.current.set(agent.id, deskIdx);
        const desk = desks[deskIdx];
        sprite = engine.sprites.spawn(
          agent.id, agent.name, agent.role,
          desk.x, desk.y + 1,
        );
      }

      // Map agent status to animation state
      switch (agent.status) {
        case 'active':
          if (sprite.path.length === 0) {
            engine.sprites.setState(agent.id, 'typing');
          }
          break;
        case 'idle':
          if (sprite.path.length === 0) {
            engine.sprites.setState(agent.id, 'idle');
          }
          break;
        case 'error':
          engine.sprites.setState(agent.id, 'error');
          break;
        case 'offline':
          engine.sprites.setState(agent.id, 'offline');
          break;
      }

      // Derive emotion from status + context
      const emotion = deriveEmotion(agent.status, agent.currentTask, sprite.state);
      engine.sprites.setEmotion(agent.id, emotion);

      // Update camera follow target
      engine.camera.updateAgentPosition(agent.id, sprite.container.x, sprite.container.y);
    }
  }, [engine, agents]);

  // Idle wandering — periodically move random idle agents for a living office feel
  useEffect(() => {
    if (!engine?.ready) return;

    wanderTimerRef.current = setInterval(() => {
      if (!engine?.ready) return;

      const sprites = engine.sprites.getAllSprites();
      const idleSprites = sprites.filter(s => s.state === 'idle' && s.path.length === 0);
      if (idleSprites.length === 0) return;

      // Pick a random idle agent to wander
      const sprite = idleSprites[Math.floor(Math.random() * idleSprites.length)];

      // 60% chance to wander, 40% stay put
      if (Math.random() > 0.6) return;

      const desks = engine.tileMap.getDesks();
      const deskIdx = deskAssignments.current.get(sprite.id);

      // Pick destination: 50% go somewhere fun, 50% return to desk
      let target: { x: number; y: number };
      const atDesk = deskIdx !== undefined && (() => {
        const desk = desks[deskIdx];
        return sprite.tileX === desk.x && sprite.tileY === desk.y + 1;
      })();

      if (atDesk || Math.random() < 0.5) {
        target = WANDER_TARGETS[Math.floor(Math.random() * WANDER_TARGETS.length)];
      } else if (deskIdx !== undefined) {
        const desk = desks[deskIdx];
        target = { x: desk.x, y: desk.y + 1 };
      } else {
        target = WANDER_TARGETS[Math.floor(Math.random() * WANDER_TARGETS.length)];
      }

      const path = engine.pathFinder.findPath(sprite.tileX, sprite.tileY, target.x, target.y);
      if (path.length > 1) {
        engine.sprites.setPath(sprite.id, path);
      }
    }, 3000);

    return () => {
      if (wanderTimerRef.current) {
        clearInterval(wanderTimerRef.current);
        wanderTimerRef.current = null;
      }
    };
  }, [engine, engine?.ready]);
}

/** Derive emotion from agent operational state */
function deriveEmotion(status: string, currentTask?: string, animState?: string): EmotionState {
  if (status === 'error') return 'frustrated';
  if (status === 'offline') return 'neutral';
  if (status === 'active') {
    if (currentTask?.toLowerCase().includes('review')) return 'thinking';
    if (currentTask?.toLowerCase().includes('deploy')) return 'excited';
    if (animState === 'talking') return 'collaborating';
    if (animState === 'typing') return 'focused';
    return 'busy';
  }
  return 'neutral';
}

function processEvent(
  engine: OfficeEngine,
  event: VentureEvent,
  deskAssignments: Map<string, number>,
) {
  try {
    processEventInner(engine, event, deskAssignments);
  } catch (err) {
    console.warn('[VirtualOffice] Error processing event:', event.type, err);
  }
}

function processEventInner(
  engine: OfficeEngine,
  event: VentureEvent,
  deskAssignments: Map<string, number>,
) {
  const desks = engine.tileMap.getDesks();
  const spawn = engine.tileMap.getSpawnPoint();

  switch (event.type) {
    case 'agent/register': {
      const sprite = engine.sprites.spawn(
        event.data.agentId,
        event.data.name,
        event.data.role,
        spawn.x,
        spawn.y,
      );

      const deskIdx = deskAssignments.size % desks.length;
      deskAssignments.set(event.data.agentId, deskIdx);
      const desk = desks[deskIdx];

      const path = engine.pathFinder.findPath(spawn.x, spawn.y, desk.x, desk.y + 1);
      if (path.length > 0) {
        engine.sprites.setPath(event.data.agentId, path);
      } else {
        const ts = engine.sprites.getSprite(event.data.agentId);
        if (ts) {
          ts.tileX = desk.x;
          ts.tileY = desk.y + 1;
          ts.renderX = desk.x * 32 + 16;
          ts.renderY = (desk.y + 1) * 32 + 16;
        }
      }
      break;
    }

    case 'agent/heartbeat': {
      const sprite = engine.sprites.getSprite(event.data.agentId);
      if (!sprite) break;

      if (event.data.status === 'active') {
        engine.sprites.setState(event.data.agentId, 'typing');
      } else if (event.data.status === 'idle') {
        engine.sprites.setState(event.data.agentId, 'idle');
      } else if (event.data.status === 'error') {
        engine.sprites.setState(event.data.agentId, 'error');
        engine.addEffect(sprite.tileX, sprite.tileY, 'error');
      } else if (event.data.status === 'offline') {
        engine.sprites.setState(event.data.agentId, 'offline');
      }
      break;
    }

    case 'agent/message': {
      const fromSprite = engine.sprites.getSprite(event.data.from);
      if (fromSprite) {
        engine.sprites.setState(event.data.from, 'talking');
        engine.sprites.showSpeechBubble(event.data.from, event.data.messageType, 4000);
      }

      if (event.data.to) {
        const toSprite = engine.sprites.getSprite(event.data.to);
        if (toSprite) {
          engine.sprites.showSpeechBubble(event.data.to, event.data.messageType, 3000);
        }
      }
      break;
    }

    case 'agent/task_update': {
      if (event.data.assigneeId) {
        const sprite = engine.sprites.getSprite(event.data.assigneeId);
        if (!sprite) break;

        if (event.data.status === 'in_progress') {
          engine.sprites.setState(event.data.assigneeId, 'typing');
        } else if (event.data.status === 'review') {
          const meetingTarget = { x: 14, y: 2 };
          const path = engine.pathFinder.findPath(sprite.tileX, sprite.tileY, meetingTarget.x, meetingTarget.y);
          if (path.length > 0) {
            engine.sprites.setPath(event.data.assigneeId, path);
          }
        } else if (event.data.status === 'done') {
          const deskIdx = deskAssignments.get(event.data.assigneeId);
          if (deskIdx !== undefined) {
            const desk = desks[deskIdx];
            const path = engine.pathFinder.findPath(sprite.tileX, sprite.tileY, desk.x, desk.y + 1);
            if (path.length > 0) {
              engine.sprites.setPath(event.data.assigneeId, path);
            }
          }
          engine.addEffect(sprite.tileX, sprite.tileY, 'sparkle');
        }
      }
      break;
    }

    case 'agent/code_change': {
      const sprite = engine.sprites.getSprite(event.data.agentId);
      if (sprite) {
        engine.sprites.setState(event.data.agentId, 'typing');
        engine.addEffect(sprite.tileX, sprite.tileY, 'code');
      }
      break;
    }
  }
}
