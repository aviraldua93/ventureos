import { Container, Graphics, Text, TextStyle } from 'pixi.js';

/** Agent palette — matches CSS token agent colors */
const AGENT_COLORS = [
  0x4d9fff, 0x3ddc84, 0xff6eb4, 0xffb647, 0xa78bfa,
  0x38bdf8, 0xfb923c, 0xf472b6, 0x34d399, 0xc084fc,
];

export type AnimationState = 'idle' | 'walking' | 'typing' | 'talking' | 'error' | 'offline';

export interface AgentSprite {
  id: string;
  name: string;
  role: string;
  container: Container;
  state: AnimationState;
  color: number;
  tileX: number;
  tileY: number;
  targetX: number;
  targetY: number;
  path: Array<{ x: number; y: number }>;
  pathIndex: number;
  speechBubble: Container | null;
  speechTimer: number;
  animFrame: number;
  animTimer: number;
}

export class SpriteManager {
  readonly container: Container;
  private sprites = new Map<string, AgentSprite>();
  private tileSize: number;
  private colorIndex = 0;

  constructor(tileSize: number) {
    this.tileSize = tileSize;
    this.container = new Container();
    this.container.label = 'sprites';
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

    const container = new Container();
    container.label = `agent-${agentId}`;
    container.x = tileX * this.tileSize + this.tileSize / 2;
    container.y = tileY * this.tileSize + this.tileSize / 2;

    // Draw the pixel art character
    this.drawCharacter(container, color, 'idle');

    // Name label
    const label = new Text({
      text: (name ?? '').split(' ')[0] || name || '?',
      style: new TextStyle({
        fontSize: 8,
        fill: 0xe8edf4,
        fontFamily: 'monospace',
        align: 'center',
      }),
    });
    label.anchor.set(0.5, 0);
    label.y = 12;
    label.label = 'name-label';
    container.addChild(label);

    this.container.addChild(container);

    const sprite: AgentSprite = {
      id: agentId,
      name,
      role,
      container,
      state: 'idle',
      color,
      tileX,
      tileY,
      targetX: tileX,
      targetY: tileY,
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
    const sprite = this.sprites.get(agentId);
    if (sprite) {
      this.container.removeChild(sprite.container);
      sprite.container.destroy({ children: true });
      this.sprites.delete(agentId);
    }
  }

  setState(agentId: string, state: AnimationState) {
    const sprite = this.sprites.get(agentId);
    if (!sprite || sprite.state === state) return;
    sprite.state = state;
    this.redrawCharacter(sprite);
  }

  setPath(agentId: string, path: Array<{ x: number; y: number }>) {
    const sprite = this.sprites.get(agentId);
    if (!sprite) return;
    sprite.path = path;
    sprite.pathIndex = 0;
    if (path.length > 0) {
      sprite.state = 'walking';
      this.redrawCharacter(sprite);
    }
  }

  showSpeechBubble(agentId: string, messageType: string, duration = 3000) {
    const sprite = this.sprites.get(agentId);
    if (!sprite) return;

    this.hideSpeechBubble(agentId);

    const bubble = new Container();
    bubble.label = 'speech-bubble';

    const bubbleColors: Record<string, number> = {
      chat: 0xe8edf4,
      blocker: 0xff5c5c,
      review: 0xffb647,
      task: 0x4d9fff,
    };
    const bgColor = bubbleColors[messageType] ?? 0xe8edf4;

    const bg = new Graphics();
    bg.roundRect(-12, -28, 24, 14, 4);
    bg.fill(bgColor);
    // Bubble tail
    bg.moveTo(-3, -14);
    bg.lineTo(0, -8);
    bg.lineTo(3, -14);
    bg.fill(bgColor);
    bubble.addChild(bg);

    // Dots (typing indicator style)
    for (let i = 0; i < 3; i++) {
      const dot = new Graphics();
      dot.circle(-6 + i * 6, -21, 1.5);
      dot.fill(messageType === 'chat' ? 0x556677 : 0xffffff);
      bubble.addChild(dot);
    }

    sprite.container.addChild(bubble);
    sprite.speechBubble = bubble;
    sprite.speechTimer = duration;
  }

  hideSpeechBubble(agentId: string) {
    const sprite = this.sprites.get(agentId);
    if (!sprite || !sprite.speechBubble) return;
    sprite.container.removeChild(sprite.speechBubble);
    sprite.speechBubble.destroy({ children: true });
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

        const dx = tx - sprite.container.x;
        const dy = ty - sprite.container.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 2) {
          sprite.container.x = tx;
          sprite.container.y = ty;
          sprite.tileX = target.x;
          sprite.tileY = target.y;
          sprite.pathIndex++;

          if (sprite.pathIndex >= sprite.path.length) {
            sprite.path = [];
            sprite.pathIndex = 0;
            sprite.state = sprite.state === 'walking' ? 'idle' : sprite.state;
            this.redrawCharacter(sprite);
          }
        } else {
          sprite.container.x += dx * moveSpeed;
          sprite.container.y += dy * moveSpeed;
        }
      }

      // Animation timer
      sprite.animTimer += dt;
      if (sprite.animTimer > 400) {
        sprite.animTimer = 0;
        sprite.animFrame = (sprite.animFrame + 1) % 4;
        this.updateAnimation(sprite);
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

  private drawCharacter(container: Container, color: number, state: AnimationState) {
    const g = new Graphics();
    g.label = 'character';

    // Head
    g.circle(0, -6, 5);
    g.fill(0xf0d6b0); // skin tone
    // Hair
    g.rect(-5, -12, 10, 4);
    g.fill(color);
    // Body
    g.roundRect(-6, -1, 12, 10, 2);
    g.fill(color);

    if (state === 'error') {
      // Red exclamation mark
      const err = new Graphics();
      err.label = 'error-mark';
      err.circle(8, -10, 5);
      err.fill(0xff5c5c);
      const txt = new Text({
        text: '!',
        style: new TextStyle({ fontSize: 8, fill: 0xffffff, fontWeight: 'bold' }),
      });
      txt.anchor.set(0.5);
      txt.x = 8;
      txt.y = -10;
      container.addChild(err);
      container.addChild(txt);
    }

    if (state === 'offline') {
      g.alpha = 0.35;
    }

    container.addChild(g);
  }

  private redrawCharacter(sprite: AgentSprite) {
    // Remove old character graphic
    const old = sprite.container.getChildByLabel('character');
    if (old) {
      sprite.container.removeChild(old);
      old.destroy();
    }
    const oldErr = sprite.container.getChildByLabel('error-mark');
    if (oldErr) {
      sprite.container.removeChild(oldErr);
      oldErr.destroy();
    }
    this.drawCharacter(sprite.container, sprite.color, sprite.state);
  }

  private updateAnimation(sprite: AgentSprite) {
    const charGraphic = sprite.container.getChildByLabel('character');
    if (!charGraphic) return;

    switch (sprite.state) {
      case 'idle':
        // Gentle bob
        charGraphic.y = Math.sin(sprite.animFrame * Math.PI / 2) * 1;
        break;
      case 'walking':
        // Walk bounce
        charGraphic.y = -Math.abs(Math.sin(sprite.animFrame * Math.PI / 2)) * 2;
        break;
      case 'typing':
        // Subtle typing motion
        charGraphic.x = Math.sin(sprite.animFrame * Math.PI) * 0.5;
        break;
      case 'talking':
        charGraphic.y = Math.sin(sprite.animFrame * Math.PI / 2) * 1.5;
        break;
      default:
        charGraphic.x = 0;
        charGraphic.y = 0;
    }
  }
}
