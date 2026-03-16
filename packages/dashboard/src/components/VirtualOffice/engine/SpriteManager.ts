/** Agent palette — matches CSS token agent colors */
const AGENT_COLORS = [
  '#4d9fff', '#3ddc84', '#ff6eb4', '#ffb647', '#a78bfa',
  '#38bdf8', '#fb923c', '#f472b6', '#34d399', '#c084fc',
];

export type AnimationState = 'idle' | 'walking' | 'typing' | 'talking' | 'error' | 'offline';
export type EmotionState = 'neutral' | 'busy' | 'thinking' | 'frustrated' | 'excited' | 'focused';

export interface SpeechBubbleData {
  type: string;
  timer: number;
}

export interface AgentSprite {
  id: string;
  name: string;
  role: string;
  container: { x: number; y: number };
  state: AnimationState;
  emotion: EmotionState;
  color: string;
  tileX: number;
  tileY: number;
  targetX: number;
  targetY: number;
  renderX: number;
  renderY: number;
  path: Array<{ x: number; y: number }>;
  pathIndex: number;
  speechBubble: SpeechBubbleData | null;
  speechTimer: number;
  animFrame: number;
  animTimer: number;
}

export class SpriteManager {
  readonly container = {};
  private sprites = new Map<string, AgentSprite>();
  private tileSize: number;
  private colorIndex = 0;

  constructor(tileSize: number) {
    this.tileSize = tileSize;
  }

  getSprite(agentId: string): AgentSprite | undefined {
    return this.sprites.get(agentId);
  }

  getAllSprites(): AgentSprite[] {
    return Array.from(this.sprites.values());
  }

  spawn(agentId: string, name: string, role: string, tileX: number, tileY: number): AgentSprite {
    if (this.sprites.has(agentId)) return this.sprites.get(agentId)!;

    const color = AGENT_COLORS[this.colorIndex % AGENT_COLORS.length];
    this.colorIndex++;

    const px = tileX * this.tileSize + this.tileSize / 2;
    const py = tileY * this.tileSize + this.tileSize / 2;

    const sprite: AgentSprite = {
      id: agentId,
      name,
      role,
      container: { x: px, y: py },
      state: 'idle',
      emotion: 'neutral',
      color,
      tileX,
      tileY,
      targetX: tileX,
      targetY: tileY,
      renderX: px,
      renderY: py,
      path: [],
      pathIndex: 0,
      speechBubble: null,
      speechTimer: 0,
      animFrame: 0,
      animTimer: 0,
    };

    this.sprites.set(agentId, sprite);
    return sprite;
  }

  remove(agentId: string) {
    this.sprites.delete(agentId);
  }

  setState(agentId: string, state: AnimationState) {
    const sprite = this.sprites.get(agentId);
    if (!sprite || sprite.state === state) return;
    sprite.state = state;
  }

  setEmotion(agentId: string, emotion: EmotionState) {
    const sprite = this.sprites.get(agentId);
    if (!sprite) return;
    sprite.emotion = emotion;
  }

  setPath(agentId: string, path: Array<{ x: number; y: number }>) {
    const sprite = this.sprites.get(agentId);
    if (!sprite) return;
    sprite.path = path;
    sprite.pathIndex = 0;
    if (path.length > 0) {
      sprite.state = 'walking';
    }
  }

  showSpeechBubble(agentId: string, messageType: string, duration = 3000) {
    const sprite = this.sprites.get(agentId);
    if (!sprite) return;
    sprite.speechBubble = { type: messageType, timer: duration };
    sprite.speechTimer = duration;
  }

  hideSpeechBubble(agentId: string) {
    const sprite = this.sprites.get(agentId);
    if (!sprite) return;
    sprite.speechBubble = null;
    sprite.speechTimer = 0;
  }

  update(dt: number) {
    const moveSpeed = 0.06;

    for (const sprite of this.sprites.values()) {
      // Handle path movement
      if (sprite.path.length > 0 && sprite.pathIndex < sprite.path.length) {
        const target = sprite.path[sprite.pathIndex];
        const tx = target.x * this.tileSize + this.tileSize / 2;
        const ty = target.y * this.tileSize + this.tileSize / 2;

        const dx = tx - sprite.renderX;
        const dy = ty - sprite.renderY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 2) {
          sprite.renderX = tx;
          sprite.renderY = ty;
          sprite.tileX = target.x;
          sprite.tileY = target.y;
          sprite.container.x = tx;
          sprite.container.y = ty;
          sprite.pathIndex++;

          if (sprite.pathIndex >= sprite.path.length) {
            sprite.path = [];
            sprite.pathIndex = 0;
            sprite.state = sprite.state === 'walking' ? 'idle' : sprite.state;
          }
        } else {
          sprite.renderX += dx * moveSpeed;
          sprite.renderY += dy * moveSpeed;
          sprite.container.x = sprite.renderX;
          sprite.container.y = sprite.renderY;
        }
      } else {
        // When not walking, snap render position to tile position
        const tx = sprite.tileX * this.tileSize + this.tileSize / 2;
        const ty = sprite.tileY * this.tileSize + this.tileSize / 2;
        sprite.renderX = tx;
        sprite.renderY = ty;
        sprite.container.x = tx;
        sprite.container.y = ty;
      }

      // Animation timer
      sprite.animTimer += dt;
      if (sprite.animTimer > 400) {
        sprite.animTimer = 0;
        sprite.animFrame = (sprite.animFrame + 1) % 4;
      }

      // Speech bubble timer
      if (sprite.speechBubble && sprite.speechTimer > 0) {
        sprite.speechTimer -= dt;
        if (sprite.speechTimer <= 0) {
          this.hideSpeechBubble(sprite.id);
        }
      }
    }
  }
}
