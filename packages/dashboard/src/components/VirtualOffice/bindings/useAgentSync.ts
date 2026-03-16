import { useEffect, useRef } from 'react';
import { useVentureStore } from '../../../store';
import type { OfficeEngine } from '../engine/OfficeEngine';
import type { VentureEvent } from '@ventureos/shared';

/**
 * Binds Zustand agent state to Pixi.js sprite behaviors.
 * Maps events to character animations, positions, and effects.
 */
export function useAgentSync(engine: OfficeEngine | null) {
  const { agents, tasks, eventLog } = useVentureStore();
  const processedEvents = useRef(0);
  const deskAssignments = useRef(new Map<string, number>());

  // Process new events as they arrive
  useEffect(() => {
    if (!engine?.ready) return;

    const newEvents = eventLog.slice(processedEvents.current);
    processedEvents.current = eventLog.length;

    for (const event of newEvents) {
      processEvent(engine, event, deskAssignments.current);
      engine.timeTravel.addEvent(event);
    }
  }, [engine, eventLog.length]);

  // Sync agent statuses
  useEffect(() => {
    if (!engine?.ready) return;

    for (const agent of agents) {
      const sprite = engine.sprites.getSprite(agent.id);
      if (!sprite) continue;

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

      // Update camera follow target
      engine.camera.updateAgentPosition(agent.id, sprite.container.x, sprite.container.y);
    }
  }, [engine, agents]);
}

function processEvent(
  engine: OfficeEngine,
  event: VentureEvent,
  deskAssignments: Map<string, number>,
) {
  const desks = engine.tileMap.getDesks();
  const spawn = engine.tileMap.getSpawnPoint();

  switch (event.type) {
    case 'agent/register': {
      // Spawn at lobby door
      const sprite = engine.sprites.spawn(
        event.data.agentId,
        event.data.name,
        event.data.role,
        spawn.x,
        spawn.y,
      );

      // Assign a desk and walk there
      const deskIdx = deskAssignments.size % desks.length;
      deskAssignments.set(event.data.agentId, deskIdx);
      const desk = desks[deskIdx];

      const path = engine.pathFinder.findPath(spawn.x, spawn.y, desk.x, desk.y + 1);
      if (path.length > 0) {
        engine.sprites.setPath(event.data.agentId, path);
      } else {
        // Teleport if no path
        sprite.container.x = desk.x * 32 + 16;
        sprite.container.y = (desk.y + 1) * 32 + 16;
        sprite.tileX = desk.x;
        sprite.tileY = desk.y + 1;
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

      // If there's a recipient, walk them towards each other (meeting room)
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
          // Walk to meeting room for review
          const meetingTarget = { x: 14, y: 2 };
          const path = engine.pathFinder.findPath(sprite.tileX, sprite.tileY, meetingTarget.x, meetingTarget.y);
          if (path.length > 0) {
            engine.sprites.setPath(event.data.assigneeId, path);
          }
        } else if (event.data.status === 'done') {
          // Walk back to desk
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
