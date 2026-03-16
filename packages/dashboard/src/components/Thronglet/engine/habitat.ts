// ── Habitat Renderer ───────────────────────────────────────────────────
// Draws a cozy pixel-art environment that evolves with team size.
// All rendering is Canvas2D, no external assets.

export type HabitatTier = 'cozy-room' | 'workshop' | 'village' | 'campus';

export function habitatTier(agentCount: number): HabitatTier {
  if (agentCount <= 4) return 'cozy-room';
  if (agentCount <= 10) return 'workshop';
  if (agentCount <= 20) return 'village';
  return 'campus';
}

export interface HabitatBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export function habitatBounds(tier: HabitatTier): HabitatBounds {
  switch (tier) {
    case 'cozy-room': return { left: -200, top: -150, right: 200, bottom: 150, width: 400, height: 300 };
    case 'workshop':  return { left: -350, top: -250, right: 350, bottom: 250, width: 700, height: 500 };
    case 'village':   return { left: -500, top: -350, right: 500, bottom: 350, width: 1000, height: 700 };
    case 'campus':    return { left: -700, top: -500, right: 700, bottom: 500, width: 1400, height: 1000 };
  }
}

const TILE = 8;

/** Pre-render the habitat background onto an offscreen canvas */
export function renderHabitatToCanvas(tier: HabitatTier): HTMLCanvasElement {
  const bounds = habitatBounds(tier);
  const canvas = document.createElement('canvas');
  canvas.width = bounds.width;
  canvas.height = bounds.height;
  const ctx = canvas.getContext('2d')!;

  // Offset so 0,0 is center
  ctx.translate(-bounds.left, -bounds.top);

  drawFloor(ctx, bounds);
  drawWalls(ctx, bounds, tier);
  drawFurniture(ctx, bounds, tier);

  return canvas;
}

function drawFloor(ctx: CanvasRenderingContext2D, b: HabitatBounds) {
  // Checkerboard floor
  const c1 = '#1e1e2e';
  const c2 = '#232336';
  for (let y = b.top; y < b.bottom; y += TILE) {
    for (let x = b.left; x < b.right; x += TILE) {
      const checker = ((Math.floor((x - b.left) / TILE) + Math.floor((y - b.top) / TILE)) % 2 === 0);
      ctx.fillStyle = checker ? c1 : c2;
      ctx.fillRect(x, y, TILE, TILE);
    }
  }

  // Floor highlight gradient
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, b.width * 0.5);
  grad.addColorStop(0, 'rgba(100, 120, 200, 0.04)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(b.left, b.top, b.width, b.height);
}

function drawWalls(ctx: CanvasRenderingContext2D, b: HabitatBounds, tier: HabitatTier) {
  const wallH = 24;
  const wallColor = '#2a2a3d';
  const trimColor = '#3d3d5c';

  // Top wall
  ctx.fillStyle = wallColor;
  ctx.fillRect(b.left, b.top, b.width, wallH);
  ctx.fillStyle = trimColor;
  ctx.fillRect(b.left, b.top + wallH - 2, b.width, 2);

  // Side walls (thin)
  ctx.fillStyle = wallColor;
  ctx.fillRect(b.left, b.top, 4, b.height);
  ctx.fillRect(b.right - 4, b.top, 4, b.height);

  // Bottom baseboard
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(b.left, b.bottom - 4, b.width, 4);

  // Windows (on top wall)
  const windowCount = tier === 'cozy-room' ? 1 : tier === 'workshop' ? 2 : tier === 'village' ? 4 : 6;
  const spacing = b.width / (windowCount + 1);
  for (let i = 1; i <= windowCount; i++) {
    const wx = b.left + spacing * i - 12;
    const wy = b.top + 3;
    // Window frame
    ctx.fillStyle = '#4a4a6a';
    ctx.fillRect(wx - 1, wy - 1, 26, 18);
    // Window glass
    const wGrad = ctx.createLinearGradient(wx, wy, wx, wy + 16);
    wGrad.addColorStop(0, '#1a1a4a');
    wGrad.addColorStop(0.5, '#2a2a6a');
    wGrad.addColorStop(1, '#1a1a4a');
    ctx.fillStyle = wGrad;
    ctx.fillRect(wx, wy, 24, 16);
    // Stars in window
    ctx.fillStyle = 'rgba(255,255,200,0.6)';
    ctx.fillRect(wx + 5, wy + 3, 2, 2);
    ctx.fillRect(wx + 14, wy + 7, 2, 2);
    ctx.fillRect(wx + 19, wy + 2, 1, 1);
    // Cross bar
    ctx.fillStyle = '#4a4a6a';
    ctx.fillRect(wx + 11, wy, 2, 16);
    ctx.fillRect(wx, wy + 7, 24, 2);
  }
}

function drawFurniture(ctx: CanvasRenderingContext2D, b: HabitatBounds, tier: HabitatTier) {
  // Potted plants
  const plantPositions = tier === 'cozy-room'
    ? [{ x: b.left + 20, y: b.bottom - 30 }]
    : tier === 'workshop'
    ? [{ x: b.left + 20, y: b.bottom - 30 }, { x: b.right - 35, y: b.bottom - 30 }]
    : tier === 'village'
    ? [{ x: b.left + 20, y: b.bottom - 30 }, { x: b.right - 35, y: b.bottom - 30 }, { x: -60, y: b.bottom - 30 }, { x: 60, y: b.bottom - 30 }]
    : [{ x: b.left + 20, y: b.bottom - 30 }, { x: b.right - 35, y: b.bottom - 30 }, { x: -120, y: b.bottom - 30 }, { x: 120, y: b.bottom - 30 }, { x: -250, y: b.bottom - 30 }, { x: 250, y: b.bottom - 30 }];

  for (const p of plantPositions) {
    drawPlant(ctx, p.x, p.y);
  }

  // Desks (workshop+)
  if (tier !== 'cozy-room') {
    const deskCount = tier === 'workshop' ? 2 : tier === 'village' ? 4 : 6;
    const dSpacing = (b.width - 80) / (deskCount);
    for (let i = 0; i < deskCount; i++) {
      const dx = b.left + 40 + dSpacing * i + dSpacing / 2;
      const dy = b.top + 60;
      drawDesk(ctx, dx, dy);
    }
  }

  // Rug in the center
  drawRug(ctx, 0, 20, tier);

  // Lamp/light sources
  if (tier !== 'cozy-room') {
    const lampCount = tier === 'workshop' ? 1 : tier === 'village' ? 2 : 3;
    const lSpacing = b.width / (lampCount + 1);
    for (let i = 1; i <= lampCount; i++) {
      drawCeilingLight(ctx, b.left + lSpacing * i, b.top + 24);
    }
  }

  // Bookshelf (village+)
  if (tier === 'village' || tier === 'campus') {
    drawBookshelf(ctx, b.right - 40, b.top + 30);
    if (tier === 'campus') {
      drawBookshelf(ctx, b.left + 10, b.top + 30);
    }
  }

  // Server rack (campus)
  if (tier === 'campus') {
    drawServerRack(ctx, b.right - 60, b.top + 30);
    drawServerRack(ctx, b.left + 30, b.top + 30);
  }
}

function drawPlant(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Pot
  ctx.fillStyle = '#8b5e3c';
  ctx.fillRect(x, y + 10, 16, 12);
  ctx.fillStyle = '#a0522d';
  ctx.fillRect(x - 2, y + 8, 20, 4);
  // Plant leaves
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.ellipse(x + 8, y, 6, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.ellipse(x + 4, y + 2, 4, 6, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 12, y + 2, 4, 6, 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawDesk(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Desktop
  ctx.fillStyle = '#4a4a3a';
  ctx.fillRect(x - 20, y, 40, 4);
  // Legs
  ctx.fillStyle = '#3a3a2a';
  ctx.fillRect(x - 18, y + 4, 3, 14);
  ctx.fillRect(x + 15, y + 4, 3, 14);
  // Monitor
  ctx.fillStyle = '#2a2a4a';
  ctx.fillRect(x - 8, y - 14, 16, 12);
  // Screen glow
  ctx.fillStyle = '#3d5afe';
  ctx.fillRect(x - 6, y - 12, 12, 8);
  // Stand
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(x - 2, y - 2, 4, 2);
}

function drawRug(ctx: CanvasRenderingContext2D, x: number, y: number, tier: HabitatTier) {
  const w = tier === 'cozy-room' ? 80 : tier === 'workshop' ? 120 : 160;
  const h = tier === 'cozy-room' ? 50 : tier === 'workshop' ? 70 : 90;
  ctx.fillStyle = 'rgba(99, 66, 133, 0.12)';
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(139, 92, 186, 0.15)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y, w - 8, h - 6, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawCeilingLight(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Light cone
  const grad = ctx.createRadialGradient(x, y + 40, 5, x, y + 40, 80);
  grad.addColorStop(0, 'rgba(255, 250, 220, 0.06)');
  grad.addColorStop(1, 'rgba(255, 250, 220, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(x - 80, y, 160, 120);
  // Fixture
  ctx.fillStyle = '#4a4a5a';
  ctx.fillRect(x - 6, y, 12, 4);
  ctx.fillStyle = '#ffe4a0';
  ctx.fillRect(x - 4, y + 4, 8, 3);
}

function drawBookshelf(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Shelf frame
  ctx.fillStyle = '#5c4033';
  ctx.fillRect(x, y, 28, 50);
  // Shelves
  ctx.fillStyle = '#4a3528';
  for (let s = 0; s < 3; s++) {
    ctx.fillRect(x, y + 14 * s + 12, 28, 2);
  }
  // Books (colorful)
  const bookColors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];
  for (let s = 0; s < 3; s++) {
    const shelfY = y + 14 * s + 1;
    let bx = x + 2;
    for (let b = 0; b < 4; b++) {
      const bw = 3 + Math.floor(Math.random() * 3);
      ctx.fillStyle = bookColors[(s * 4 + b) % bookColors.length];
      ctx.fillRect(bx, shelfY, bw, 11);
      bx += bw + 1;
    }
  }
}

function drawServerRack(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Rack body
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(x, y, 20, 50);
  ctx.strokeStyle = '#3a3a5a';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, 20, 50);
  // Server units
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = '#2a2a4e';
    ctx.fillRect(x + 2, y + 3 + i * 12, 16, 9);
    // LEDs
    ctx.fillStyle = i % 2 === 0 ? '#22c55e' : '#3b82f6';
    ctx.fillRect(x + 4, y + 5 + i * 12, 2, 2);
    ctx.fillRect(x + 8, y + 5 + i * 12, 2, 2);
  }
}
