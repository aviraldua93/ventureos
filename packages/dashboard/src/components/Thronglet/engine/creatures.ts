import type { CreatureMood, MoodState } from './moods';
import { MOOD_COLORS } from './moods';

// ── Species ────────────────────────────────────────────────────────────
export type CreatureSpecies = 'robot' | 'cat' | 'owl' | 'fox' | 'blob';

export function speciesFromRole(role: string): CreatureSpecies {
  const r = role.toLowerCase();
  if (r.includes('engineer') || r.includes('dev') || r.includes('backend') || r.includes('frontend') || r.includes('fullstack')) return 'robot';
  if (r.includes('qa') || r.includes('test') || r.includes('quality')) return 'cat';
  if (r.includes('pm') || r.includes('manager') || r.includes('lead') || r.includes('ceo') || r.includes('cto') || r.includes('director')) return 'owl';
  if (r.includes('design') || r.includes('ux') || r.includes('ui') || r.includes('creative')) return 'fox';
  return 'blob';
}

export const SPECIES_META: Record<CreatureSpecies, { label: string; baseColor: string; accent: string }> = {
  robot: { label: 'Robot',         baseColor: '#4db8ff', accent: '#1a8cff' },
  cat:   { label: 'Detective Cat', baseColor: '#c084fc', accent: '#9333ea' },
  owl:   { label: 'Owl Manager',   baseColor: '#fb923c', accent: '#ea580c' },
  fox:   { label: 'Painter Fox',   baseColor: '#f472b6', accent: '#db2777' },
  blob:  { label: 'Blobby',        baseColor: '#4ade80', accent: '#16a34a' },
};

// ── Creature State ─────────────────────────────────────────────────────
export interface Creature {
  id: string;
  name: string;
  species: CreatureSpecies;
  mood: MoodState;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  bobPhase: number;
  emoteTimer: number;
  scale: number;
  facing: 1 | -1;
  wanderTimer: number;
  petFlash: number;
}

// ── Drawing ────────────────────────────────────────────────────────────
const PX = 3; // pixel scale factor

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w * PX, h * PX);
}

/** Draw a single creature on the canvas */
export function drawCreature(
  ctx: CanvasRenderingContext2D,
  c: Creature,
  time: number,
  selected: boolean,
) {
  const { species, mood } = c;
  const meta = SPECIES_META[species];
  const moodColors = MOOD_COLORS[mood.mood];

  ctx.save();
  ctx.translate(c.x, c.y);

  // Bob animation
  const bob = mood.mood === 'sleeping'
    ? 0
    : Math.sin(time * 3 + c.bobPhase) * (mood.mood === 'happy' ? 4 : mood.mood === 'celebrating' ? 6 : 2);

  ctx.translate(0, bob);
  ctx.scale(c.facing * c.scale, c.scale);

  // Glow ring
  const glowAlpha = 0.3 + Math.sin(time * 2) * 0.15;
  ctx.shadowColor = moodColors.glow;
  ctx.shadowBlur = selected ? 20 : 10;
  ctx.globalAlpha = glowAlpha;
  ctx.beginPath();
  ctx.ellipse(0, 10 * PX, 10 * PX, 4 * PX, 0, 0, Math.PI * 2);
  ctx.fillStyle = moodColors.glow;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  // Selection ring
  if (selected) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = -time * 20;
    ctx.beginPath();
    ctx.ellipse(0, 10 * PX, 12 * PX, 5 * PX, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Pet flash overlay
  if (c.petFlash > 0) {
    ctx.globalAlpha = c.petFlash;
    ctx.fillStyle = '#ffe066';
    ctx.beginPath();
    ctx.arc(0, 0, 16 * PX, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Draw species body
  switch (species) {
    case 'robot': drawRobot(ctx, meta, mood.mood, time); break;
    case 'cat': drawCat(ctx, meta, mood.mood, time); break;
    case 'owl': drawOwl(ctx, meta, mood.mood, time); break;
    case 'fox': drawFox(ctx, meta, mood.mood, time); break;
    default: drawBlob(ctx, meta, mood.mood, time); break;
  }

  // Mood effects
  drawMoodEffects(ctx, mood.mood, time);

  ctx.restore();

  // Name label (not scaled/flipped)
  ctx.save();
  ctx.translate(c.x, c.y + bob);
  ctx.font = 'bold 11px "Inter", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = moodColors.primary;
  ctx.globalAlpha = 0.9;
  ctx.fillText(c.name, 0, 18 * PX);
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ── Species Renderers ──────────────────────────────────────────────────

function drawRobot(ctx: CanvasRenderingContext2D, meta: typeof SPECIES_META.robot, mood: CreatureMood, _t: number) {
  const bc = meta.baseColor;
  const ac = meta.accent;
  // Body
  px(ctx, -5 * PX, -4 * PX, 10, 10, bc);
  // Head
  px(ctx, -4 * PX, -8 * PX, 8, 4, ac);
  // Antenna
  px(ctx, -1 * PX, -10 * PX, 2, 2, '#ffffff');
  // Eyes
  const eyeColor = mood === 'sleeping' ? '#666' : '#ffffff';
  px(ctx, -3 * PX, -7 * PX, 2, 2, eyeColor);
  px(ctx,  1 * PX, -7 * PX, 2, 2, eyeColor);
  if (mood !== 'sleeping') {
    px(ctx, -2 * PX, -6 * PX, 1, 1, '#111');
    px(ctx,  2 * PX, -6 * PX, 1, 1, '#111');
  }
  // Mouth
  if (mood === 'happy' || mood === 'celebrating') {
    px(ctx, -2 * PX, -5 * PX, 4, 1, '#111');
  } else if (mood === 'overwhelmed') {
    px(ctx, -1 * PX, -5 * PX, 2, 1, '#ff5c5c');
  }
  // Arms
  px(ctx, -7 * PX, -2 * PX, 2, 4, ac);
  px(ctx,  5 * PX, -2 * PX, 2, 4, ac);
  // Legs
  px(ctx, -3 * PX,  6 * PX, 2, 3, ac);
  px(ctx,  1 * PX,  6 * PX, 2, 3, ac);
}

function drawCat(ctx: CanvasRenderingContext2D, meta: typeof SPECIES_META.cat, mood: CreatureMood, _t: number) {
  const bc = meta.baseColor;
  const ac = meta.accent;
  // Body (round)
  ctx.fillStyle = bc;
  ctx.beginPath();
  ctx.ellipse(0, 0, 6 * PX, 7 * PX, 0, 0, Math.PI * 2);
  ctx.fill();
  // Ears
  ctx.fillStyle = ac;
  ctx.beginPath();
  ctx.moveTo(-5 * PX, -7 * PX);
  ctx.lineTo(-3 * PX, -11 * PX);
  ctx.lineTo(-1 * PX, -7 * PX);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(1 * PX, -7 * PX);
  ctx.lineTo(3 * PX, -11 * PX);
  ctx.lineTo(5 * PX, -7 * PX);
  ctx.fill();
  // Eyes
  const eyeColor = mood === 'sleeping' ? ac : '#ffffff';
  px(ctx, -3 * PX, -3 * PX, 2, 2, eyeColor);
  px(ctx,  1 * PX, -3 * PX, 2, 2, eyeColor);
  if (mood !== 'sleeping') {
    px(ctx, -2 * PX, -2 * PX, 1, 1, '#111');
    px(ctx,  2 * PX, -2 * PX, 1, 1, '#111');
  } else {
    // Closed eyes: horizontal lines
    px(ctx, -3 * PX, -2 * PX, 2, 0.5, '#111');
    px(ctx,  1 * PX, -2 * PX, 2, 0.5, '#111');
  }
  // Nose + Whiskers
  px(ctx, 0, -1 * PX, 1, 1, '#f9a8d4');
  // Detective hat (magnifying glass hint)
  ctx.fillStyle = '#5b21b6';
  ctx.fillRect(-4 * PX, -8 * PX, 8 * PX, 1.5 * PX);
  ctx.fillRect(-3 * PX, -9.5 * PX, 6 * PX, 1.5 * PX);
  // Tail
  ctx.strokeStyle = bc;
  ctx.lineWidth = 2 * PX;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(5 * PX, 3 * PX);
  ctx.quadraticCurveTo(9 * PX, 0, 8 * PX, -4 * PX);
  ctx.stroke();
}

function drawOwl(ctx: CanvasRenderingContext2D, meta: typeof SPECIES_META.owl, mood: CreatureMood, t: number) {
  const bc = meta.baseColor;
  const ac = meta.accent;
  // Body
  ctx.fillStyle = bc;
  ctx.beginPath();
  ctx.ellipse(0, 2 * PX, 6 * PX, 8 * PX, 0, 0, Math.PI * 2);
  ctx.fill();
  // Belly
  ctx.fillStyle = '#fde68a';
  ctx.beginPath();
  ctx.ellipse(0, 4 * PX, 4 * PX, 5 * PX, 0, 0, Math.PI * 2);
  ctx.fill();
  // Eyes (big round owl eyes)
  const eyeSize = mood === 'overwhelmed' ? 3.5 : 3;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-2.5 * PX, -3 * PX, eyeSize * PX, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(2.5 * PX, -3 * PX, eyeSize * PX, 0, Math.PI * 2);
  ctx.fill();
  if (mood !== 'sleeping') {
    const blink = Math.sin(t * 0.5) > 0.95;
    if (!blink) {
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(-2.5 * PX, -3 * PX, 1.5 * PX, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(2.5 * PX, -3 * PX, 1.5 * PX, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.strokeStyle = '#111';
    ctx.lineWidth = PX;
    ctx.beginPath();
    ctx.moveTo(-4 * PX, -3 * PX);
    ctx.lineTo(-1 * PX, -3 * PX);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(1 * PX, -3 * PX);
    ctx.lineTo(4 * PX, -3 * PX);
    ctx.stroke();
  }
  // Beak
  ctx.fillStyle = ac;
  ctx.beginPath();
  ctx.moveTo(-1 * PX, -1 * PX);
  ctx.lineTo(0, 1 * PX);
  ctx.lineTo(1 * PX, -1 * PX);
  ctx.fill();
  // Ear tufts
  ctx.fillStyle = ac;
  ctx.beginPath();
  ctx.moveTo(-5 * PX, -6 * PX);
  ctx.lineTo(-3 * PX, -10 * PX);
  ctx.lineTo(-1 * PX, -6 * PX);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(1 * PX, -6 * PX);
  ctx.lineTo(3 * PX, -10 * PX);
  ctx.lineTo(5 * PX, -6 * PX);
  ctx.fill();
  // Wings
  ctx.fillStyle = ac;
  ctx.beginPath();
  ctx.ellipse(-6 * PX, 2 * PX, 2 * PX, 5 * PX, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(6 * PX, 2 * PX, 2 * PX, 5 * PX, 0.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawFox(ctx: CanvasRenderingContext2D, meta: typeof SPECIES_META.fox, mood: CreatureMood, _t: number) {
  const bc = meta.baseColor;
  const ac = meta.accent;
  // Body
  ctx.fillStyle = bc;
  ctx.beginPath();
  ctx.ellipse(0, 1 * PX, 5 * PX, 7 * PX, 0, 0, Math.PI * 2);
  ctx.fill();
  // Belly
  ctx.fillStyle = '#fce7f3';
  ctx.beginPath();
  ctx.ellipse(0, 3 * PX, 3 * PX, 4 * PX, 0, 0, Math.PI * 2);
  ctx.fill();
  // Ears (big triangular)
  ctx.fillStyle = ac;
  ctx.beginPath();
  ctx.moveTo(-4 * PX, -6 * PX);
  ctx.lineTo(-2 * PX, -12 * PX);
  ctx.lineTo(0, -6 * PX);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, -6 * PX);
  ctx.lineTo(2 * PX, -12 * PX);
  ctx.lineTo(4 * PX, -6 * PX);
  ctx.fill();
  // Inner ears
  ctx.fillStyle = '#fce7f3';
  ctx.beginPath();
  ctx.moveTo(-3 * PX, -6 * PX);
  ctx.lineTo(-2 * PX, -10 * PX);
  ctx.lineTo(-1 * PX, -6 * PX);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(1 * PX, -6 * PX);
  ctx.lineTo(2 * PX, -10 * PX);
  ctx.lineTo(3 * PX, -6 * PX);
  ctx.fill();
  // Eyes
  const eyeColor = mood === 'sleeping' ? ac : '#ffffff';
  px(ctx, -3 * PX, -4 * PX, 2, 2, eyeColor);
  px(ctx,  1 * PX, -4 * PX, 2, 2, eyeColor);
  if (mood !== 'sleeping') {
    px(ctx, -2 * PX, -3 * PX, 1, 1, '#111');
    px(ctx,  2 * PX, -3 * PX, 1, 1, '#111');
  }
  // Nose
  px(ctx, 0, -2 * PX, 1, 1, '#111');
  // Paintbrush tail
  ctx.strokeStyle = ac;
  ctx.lineWidth = 2 * PX;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(4 * PX, 3 * PX);
  ctx.quadraticCurveTo(10 * PX, -2 * PX, 8 * PX, -6 * PX);
  ctx.stroke();
  // Brush tip
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(8 * PX, -6 * PX, 2 * PX, 0, Math.PI * 2);
  ctx.fill();
}

function drawBlob(ctx: CanvasRenderingContext2D, meta: typeof SPECIES_META.blob, mood: CreatureMood, t: number) {
  const bc = meta.baseColor;
  // Jiggly blob body
  const jiggle = Math.sin(t * 4) * PX * 0.5;
  ctx.fillStyle = bc;
  ctx.beginPath();
  ctx.ellipse(0, 0, (7 + jiggle) * PX, (6 - jiggle * 0.5) * PX, 0, 0, Math.PI * 2);
  ctx.fill();
  // Cheeks
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.ellipse(-3 * PX, 1 * PX, 2 * PX, 1.5 * PX, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(3 * PX, 1 * PX, 2 * PX, 1.5 * PX, 0, 0, Math.PI * 2);
  ctx.fill();
  // Eyes
  if (mood !== 'sleeping') {
    px(ctx, -3 * PX, -3 * PX, 2, 2.5, '#ffffff');
    px(ctx,  1 * PX, -3 * PX, 2, 2.5, '#ffffff');
    px(ctx, -2 * PX, -2 * PX, 1, 1, '#111');
    px(ctx,  2 * PX, -2 * PX, 1, 1, '#111');
  } else {
    px(ctx, -3 * PX, -2 * PX, 2, 0.5, '#111');
    px(ctx,  1 * PX, -2 * PX, 2, 0.5, '#111');
  }
  // Smile
  if (mood === 'happy' || mood === 'celebrating') {
    ctx.strokeStyle = '#111';
    ctx.lineWidth = PX * 0.7;
    ctx.beginPath();
    ctx.arc(0, -0.5 * PX, 2 * PX, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
}

// ── Mood Effects ───────────────────────────────────────────────────────

function drawMoodEffects(ctx: CanvasRenderingContext2D, mood: CreatureMood, t: number) {
  switch (mood) {
    case 'sleeping': {
      // Floating Z's
      for (let i = 0; i < 3; i++) {
        const offset = ((t * 0.8 + i * 1.2) % 3);
        const alpha = 1 - offset / 3;
        ctx.globalAlpha = alpha * 0.7;
        ctx.font = `bold ${10 + offset * 4}px monospace`;
        ctx.fillStyle = '#8b8ba8';
        ctx.fillText('z', (4 + offset * 5) * PX, (-8 - offset * 8) * PX);
      }
      ctx.globalAlpha = 1;
      break;
    }
    case 'overwhelmed': {
      // Sweat drops
      const sweatY = -10 * PX + Math.sin(t * 5) * 2;
      ctx.fillStyle = '#87ceeb';
      ctx.beginPath();
      ctx.moveTo(5 * PX, sweatY);
      ctx.quadraticCurveTo(6 * PX, sweatY + 3, 5 * PX, sweatY + 5);
      ctx.quadraticCurveTo(4 * PX, sweatY + 3, 5 * PX, sweatY);
      ctx.fill();
      // Stress lines
      ctx.strokeStyle = 'rgba(255,92,92,0.5)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const a = -0.5 + i * 0.5;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 10 * PX, Math.sin(a) * 10 * PX - 8 * PX);
        ctx.lineTo(Math.cos(a) * 13 * PX, Math.sin(a) * 13 * PX - 8 * PX);
        ctx.stroke();
      }
      break;
    }
    case 'celebrating': {
      // Sparkles
      for (let i = 0; i < 6; i++) {
        const angle = (t * 2 + i * Math.PI / 3) % (Math.PI * 2);
        const r = 12 * PX + Math.sin(t * 3 + i) * 3 * PX;
        const sx = Math.cos(angle) * r;
        const sy = Math.sin(angle) * r - 4 * PX;
        const sparkAlpha = 0.5 + Math.sin(t * 8 + i * 2) * 0.5;
        ctx.globalAlpha = sparkAlpha;
        drawSparkle(ctx, sx, sy, 2 + Math.sin(t * 4 + i) * 1);
      }
      ctx.globalAlpha = 1;
      break;
    }
    case 'hungry': {
      // Thought bubble with "..."
      const bubbleY = -14 * PX + Math.sin(t * 1.5) * 2;
      ctx.fillStyle = 'rgba(255,201,64,0.15)';
      ctx.beginPath();
      ctx.ellipse(0, bubbleY, 6 * PX, 3 * PX, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffc940';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('···', 0, bubbleY + 3);
      break;
    }
    case 'happy': {
      // Subtle hearts
      const heartAlpha = 0.3 + Math.sin(t * 2) * 0.2;
      ctx.globalAlpha = heartAlpha;
      ctx.fillStyle = '#f472b6';
      ctx.font = '8px serif';
      ctx.fillText('♥', 7 * PX, -9 * PX + Math.sin(t * 3) * 2);
      ctx.globalAlpha = 1;
      break;
    }
  }
}

function drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size * PX;
  ctx.fillStyle = '#fde68a';
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.lineTo(x + s * 0.3, y);
  ctx.lineTo(x, y + s);
  ctx.lineTo(x - s * 0.3, y);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - s, y);
  ctx.lineTo(x, y + s * 0.3);
  ctx.lineTo(x + s, y);
  ctx.lineTo(x, y - s * 0.3);
  ctx.closePath();
  ctx.fill();
}
