import { useEffect, useRef } from 'react';
import { useVentureStore } from '../../../store';
import { defaultOffice } from '../maps/default-office';
import type { RoomDef } from '../maps/MapSchema';
import type { OfficeEngine } from '../engine/OfficeEngine';
import type { VentureEvent } from '@ventureos/shared';
import type { Agent } from '@ventureos/shared';
import type { EmotionState } from '../engine/SpriteManager';

// ── Department Room Mapping ─────────────────────────────────────

/** Direct agent-id to room overrides */
const AGENT_ROOM_MAP: Record<string, string> = {
  'jordan-park': 'ceo-suite',
  'max': 'holding-co',
  'niko-reyes': 'holding-co',
  'priya-sharma': 'holding-co',
};

/** Department heads mapped to their room */
const DEPT_HEAD_ROOMS: Record<string, string> = {
  'sana-okafor': 'engineering',
  'lex-morales': 'qa-lab',
  'noor-abbasi': 'ai-research',
  'ava-chen': 'community-hub',
  'dana-whitfield': 'product-mgmt',
  'riley-nakamura': 'playwright-lab',
};

/** Resolve which room an agent belongs to */
function getAgentRoom(agentId: string, parentId?: string): string {
  if (AGENT_ROOM_MAP[agentId]) return AGENT_ROOM_MAP[agentId];
  if (DEPT_HEAD_ROOMS[agentId]) return DEPT_HEAD_ROOMS[agentId];
  if (parentId && DEPT_HEAD_ROOMS[parentId]) return DEPT_HEAD_ROOMS[parentId];
  return 'lobby';
}

// ── Grid Spacing Algorithm ──────────────────────────────────────

/** Max agent slots per room (for stable grid positions) */
const ROOM_CAPACITY: Record<string, number> = {
  'ceo-suite': 2,
  'holding-co': 4,
  'engineering': 14,
  'ai-research': 4,
  'product-mgmt': 6,
  'qa-lab': 4,
  'playwright-lab': 5,
  'community-hub': 5,
  'lobby': 8,
  'break-room': 2,
  'meeting-a': 6,
  'meeting-b': 4,
  'collab-space': 6,
  'server-room': 2,
};

/**
 * Compute a grid position for agent index within a room.
 * Uses fixed capacity so positions are stable as agents arrive.
 * Guarantees minimum 2-tile (64px) spacing between agents.
 */
function getGridPosition(
  room: RoomDef,
  index: number,
  capacity: number,
): { x: number; y: number } {
  const padding = 1;
  const innerW = room.width - padding * 2;
  const innerH = room.height - padding * 2;

  if (capacity <= 1) {
    return {
      x: room.x + Math.floor(room.width / 2),
      y: room.y + Math.floor(room.height / 2),
    };
  }

  const aspect = innerW / Math.max(1, innerH);
  const cols = Math.max(1, Math.min(
    Math.ceil(Math.sqrt(capacity * aspect)),
    innerW,
  ));
  const rows = Math.max(1, Math.ceil(capacity / cols));

  const col = index % cols;
  const row = Math.floor(index / cols);
  const xStep = innerW / cols;
  const yStep = innerH / rows;

  return {
    x: Math.min(
      room.x + room.width - padding - 1,
      Math.max(room.x + padding, Math.floor(room.x + padding + col * xStep + xStep / 2)),
    ),
    y: Math.min(
      room.y + room.height - padding - 1,
      Math.max(room.y + padding, Math.floor(room.y + padding + row * yStep + yStep / 2)),
    ),
  };
}

// ── Wander Targets (common areas for idle agents) ───────────────

const WANDER_TARGETS = [
  { x: 44, y: 3 },   // Break Room
  { x: 4,  y: 12 },  // Meeting Room A
  { x: 44, y: 12 },  // Meeting Room B
  { x: 31, y: 21 },  // Collab Space
  { x: 6,  y: 21 },  // Lobby
  { x: 24, y: 8 },   // Corridor (center top)
  { x: 24, y: 17 },  // Corridor (center bottom)
];

// ── Room Assignment State ───────────────────────────────────────

interface RoomAssignment {
  roomId: string;
  homeX: number;
  homeY: number;
}

const TS = defaultOffice.tileSize;
const mapRooms = defaultOffice.rooms;

// ── Main Hook ───────────────────────────────────────────────────

/**
 * Binds Zustand agent state to Canvas2D sprite behaviors.
 * Maps agents to department rooms, computes grid positions,
 * and processes events for character animations and effects.
 */
export function useAgentSync(engine: OfficeEngine | null) {
  const { agents, eventLog } = useVentureStore();
  const processedEvents = useRef(0);
  const roomAssignments = useRef(new Map<string, RoomAssignment>());
  const roomCounts = useRef(new Map<string, number>());
  const processingRef = useRef(false);
  const wanderTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Event Processing ──────────────────────────────────────────
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
        processEvent(
          engine, newEvents[idx],
          roomAssignments.current, roomCounts.current,
        );
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
        processEvent(
          engine, event,
          roomAssignments.current, roomCounts.current,
        );
        engine.timeTravel.addEvent(event);
      }
      processingRef.current = false;
    } else {
      requestAnimationFrame(processBatch);
    }
  }, [engine, eventLog.length]);

  // ── Agent Sync (snapshot + status + emotions) ─────────────────
  useEffect(() => {
    if (!engine?.ready) return;

    for (const agent of agents) {
      let sprite = engine.sprites.getSprite(agent.id);

      // Spawn missing sprites at their department grid position
      if (!sprite) {
        const assignment = getOrAssignRoom(
          agent.id, agent.parentId,
          roomAssignments.current, roomCounts.current,
        );
        sprite = engine.sprites.spawn(
          agent.id, agent.name, agent.role,
          assignment.homeX, assignment.homeY,
        );
      }

      // Map agent status to animation state
      switch (agent.status) {
        case 'active':
          if (sprite.path.length === 0) engine.sprites.setState(agent.id, 'typing');
          break;
        case 'idle':
          if (sprite.path.length === 0) engine.sprites.setState(agent.id, 'idle');
          break;
        case 'error':
          engine.sprites.setState(agent.id, 'error');
          break;
        case 'offline':
          engine.sprites.setState(agent.id, 'offline');
          break;
      }

      const emotion = deriveEmotion(agent.status, agent.currentTask, sprite.state);
      engine.sprites.setEmotion(agent.id, emotion);
      engine.camera.updateAgentPosition(agent.id, sprite.container.x, sprite.container.y);
    }
  }, [engine, agents]);

  // ── Idle Wandering ────────────────────────────────────────────
  useEffect(() => {
    if (!engine?.ready) return;

    wanderTimerRef.current = setInterval(() => {
      if (!engine?.ready) return;

      const sprites = engine.sprites.getAllSprites();
      const idleSprites = sprites.filter(s => s.state === 'idle' && s.path.length === 0);
      if (idleSprites.length === 0) return;

      const sprite = idleSprites[Math.floor(Math.random() * idleSprites.length)];
      if (Math.random() > 0.6) return;

      const assignment = roomAssignments.current.get(sprite.id);

      // Pick destination: 50% wander to common area, 50% return home
      let target: { x: number; y: number };
      const atHome = assignment && sprite.tileX === assignment.homeX && sprite.tileY === assignment.homeY;

      if (atHome || Math.random() < 0.5) {
        target = WANDER_TARGETS[Math.floor(Math.random() * WANDER_TARGETS.length)];
      } else if (assignment) {
        target = { x: assignment.homeX, y: assignment.homeY };
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

// ── Helpers ─────────────────────────────────────────────────────

/** Assign a room + grid slot for an agent (idempotent) */
function getOrAssignRoom(
  agentId: string,
  parentId: string | undefined,
  assignments: Map<string, RoomAssignment>,
  counts: Map<string, number>,
): RoomAssignment {
  const existing = assignments.get(agentId);
  if (existing) return existing;

  const roomId = getAgentRoom(agentId, parentId);
  const room = mapRooms.find(r => r.id === roomId) ?? mapRooms[0];
  const slotIdx = counts.get(roomId) ?? 0;
  counts.set(roomId, slotIdx + 1);

  const capacity = ROOM_CAPACITY[roomId] ?? 4;
  const pos = getGridPosition(room, slotIdx, capacity);

  const assignment: RoomAssignment = { roomId, homeX: pos.x, homeY: pos.y };
  assignments.set(agentId, assignment);
  return assignment;
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

// ── Event Processing ────────────────────────────────────────────

function processEvent(
  engine: OfficeEngine,
  event: VentureEvent,
  assignments: Map<string, RoomAssignment>,
  counts: Map<string, number>,
) {
  try {
    processEventInner(engine, event, assignments, counts);
  } catch (err) {
    console.warn('[VirtualOffice] Error processing event:', event.type, err);
  }
}

function processEventInner(
  engine: OfficeEngine,
  event: VentureEvent,
  assignments: Map<string, RoomAssignment>,
  counts: Map<string, number>,
) {
  const spawn = engine.tileMap.getSpawnPoint();

  switch (event.type) {
    case 'agent/register': {
      const assignment = getOrAssignRoom(
        event.data.agentId, event.data.parentId,
        assignments, counts,
      );

      engine.sprites.spawn(
        event.data.agentId, event.data.name, event.data.role,
        spawn.x, spawn.y,
      );

      // Walk from lobby to department room
      const path = engine.pathFinder.findPath(
        spawn.x, spawn.y, assignment.homeX, assignment.homeY,
      );
      if (path.length > 0) {
        engine.sprites.setPath(event.data.agentId, path);
      } else {
        // Fallback: teleport
        const sprite = engine.sprites.getSprite(event.data.agentId);
        if (sprite) {
          sprite.tileX = assignment.homeX;
          sprite.tileY = assignment.homeY;
          sprite.renderX = assignment.homeX * TS + TS / 2;
          sprite.renderY = assignment.homeY * TS + TS / 2;
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
          // Walk to Meeting Room A for reviews
          const meetingRoom = mapRooms.find(r => r.id === 'meeting-a');
          if (meetingRoom) {
            const target = {
              x: meetingRoom.x + Math.floor(meetingRoom.width / 2),
              y: meetingRoom.y + Math.floor(meetingRoom.height / 2),
            };
            const path = engine.pathFinder.findPath(sprite.tileX, sprite.tileY, target.x, target.y);
            if (path.length > 0) {
              engine.sprites.setPath(event.data.assigneeId, path);
            }
          }
        } else if (event.data.status === 'done') {
          // Return to home position
          const assignment = assignments.get(event.data.assigneeId);
          if (assignment) {
            const path = engine.pathFinder.findPath(
              sprite.tileX, sprite.tileY,
              assignment.homeX, assignment.homeY,
            );
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
