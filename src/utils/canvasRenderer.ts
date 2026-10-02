import {
  ActiveLoot,
  BackgroundBuilding,
  Cloud,
  CrowPlayer,
  FloatingBalloonPacket,
  FloatingText,
  Obstacle,
  Particle,
  PoopDecal,
  PoopProjectile,
  TownBuilding,
  TownNPC,
  TownTrafficVehicle,
} from '../types/game';
import { GAME_PHYSICS, LOOT_CONFIGS } from './constants';

/**
 * Naif Gouache & Storybook 2D Canvas Renderer for Airswiper (闪光怪盗).
 * Scaled up visuals with bidirectional flight, perching, poop decals,
 * animated fountains, drifting clouds, and floating balloon parcels.
 */

// Draw procedural drifting clouds in the sky
export function drawCloud(ctx: CanvasRenderingContext2D, cloud: Cloud) {
  ctx.save();
  ctx.translate(cloud.x, cloud.y);
  ctx.scale(cloud.scale, cloud.scale);
  ctx.globalAlpha = cloud.opacity;

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, Math.PI * 2);
  ctx.arc(-22, 6, 18, 0, Math.PI * 2);
  ctx.arc(22, 6, 20, 0, Math.PI * 2);
  ctx.arc(38, 10, 14, 0, Math.PI * 2);
  ctx.arc(-36, 10, 14, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// Draw Amelicart / Pokapoka Style Multi-tiered Background Building (Far Skyline & Mid Townhouses)
export function drawBackgroundBuilding(
  ctx: CanvasRenderingContext2D,
  bg: BackgroundBuilding,
  screenX: number,
  groundY: number,
  time: number
) {
  const bX = screenX;
  const bH = bg.height;
  const bW = bg.width;
  const bY = groundY - bH;
  const isFar = bg.layer === 'far';

  ctx.save();

  // Atmospheric distance haze: softer for far skyline, crisp for mid townhouses
  ctx.globalAlpha = isFar ? 0.68 : 0.94;

  // Main facade
  ctx.fillStyle = bg.color;
  ctx.fillRect(bX, bY, bW, bH);

  // Fachwerk half-timbered wooden beams pattern (Amelicart Pokapoka style)
  if (bg.timberPattern && !isFar) {
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.35)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(bX, bY);
    ctx.lineTo(bX + bW / 2, bY + 60);
    ctx.lineTo(bX + bW, bY);
    ctx.moveTo(bX, bY + 120);
    ctx.lineTo(bX + bW, bY + 120);
    ctx.moveTo(bX + bW / 2, bY);
    ctx.lineTo(bX + bW / 2, bY + bH);
    ctx.stroke();
  }

  // Roof
  ctx.fillStyle = bg.roofColor;
  ctx.beginPath();
  if (bg.roofType === 'mansard') {
    ctx.moveTo(bX - 6, bY);
    ctx.lineTo(bX + 22, bY - 62);
    ctx.lineTo(bX + bW - 22, bY - 62);
    ctx.lineTo(bX + bW + 6, bY);
  } else if (bg.roofType === 'gable_timber') {
    ctx.moveTo(bX - 8, bY);
    ctx.lineTo(bX + bW / 2, bY - 72);
    ctx.lineTo(bX + bW + 8, bY);
  } else if (bg.roofType === 'steeple') {
    ctx.moveTo(bX - 6, bY);
    ctx.lineTo(bX + bW / 2, bY - 130);
    ctx.lineTo(bX + bW + 6, bY);
  } else {
    // Spire
    ctx.moveTo(bX - 6, bY);
    ctx.lineTo(bX + bW / 2, bY - 115);
    ctx.lineTo(bX + bW + 6, bY);
  }
  ctx.closePath();
  ctx.fill();

  // Special Features: Windmill, Clock Belfry, or Church Cross!
  if (bg.feature === 'windmill') {
    // Windmill cap & turning sails
    const hubX = bX + bW / 2;
    const hubY = bY - 45;
    ctx.save();
    ctx.translate(hubX, hubY);
    const sailAngle = time * 0.75;
    ctx.rotate(sailAngle);

    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -52);
      ctx.stroke();
      // Sail canvas lattice
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fillRect(3, -48, 14, 44);
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1;
      ctx.strokeRect(3, -48, 14, 44);
      ctx.restore();
    }
    // Center brass cap
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (bg.feature === 'clock_belfry') {
    // Clock tower belfry with arched bell & working clock
    const clockX = bX + bW / 2;
    const clockY = bY - 40;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(clockX, clockY, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Clock hands
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(clockX, clockY);
    ctx.lineTo(clockX, clockY - 10);
    ctx.moveTo(clockX, clockY);
    ctx.lineTo(clockX + 7, clockY + 2);
    ctx.stroke();

    // Arched belfry opening
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(clockX, clockY + 26, 9, Math.PI, 0);
    ctx.lineTo(clockX + 9, clockY + 45);
    ctx.lineTo(clockX - 9, clockY + 45);
    ctx.closePath();
    ctx.fill();

    // Bronze church bell
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(clockX, clockY + 34, 5, 0, Math.PI);
    ctx.fill();
  } else if (bg.feature === 'church_cross' || bg.roofType === 'spire') {
    // Cross / Weathervane on Spire (Sara Nicely background church style)
    const tipX = bX + bW / 2;
    const tipY = bY - (bg.roofType === 'steeple' ? 130 : 115);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX, tipY - 22);
    ctx.moveTo(tipX - 7, tipY - 15);
    ctx.lineTo(tipX + 7, tipY - 15);
    ctx.stroke();
  }

  // Arched Dormer Attic Windows (Pokapoka style)
  bg.dormers.forEach((dormer) => {
    const dx = bX + dormer.x;
    const dy = bY + dormer.y;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(dx + 10, dy, 10, Math.PI, 0);
    ctx.lineTo(dx + 20, dy + 18);
    ctx.lineTo(dx, dy + 18);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(dx + 3, dy - 2, 14, 16);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(dx + 3, dy - 2, 14, 16);
  });

  // Tall Brick Chimney with stepped zig-zag smoke (Amelicart signature!)
  if (bg.chimney) {
    const cx = bX + bg.chimney.x;
    const cy = bY - 50;
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(cx - 8, cy - bg.chimney.height, 16, bg.chimney.height);

    if (bg.chimney.hasSmoke) {
      ctx.fillStyle = isFar ? 'rgba(255, 255, 255, 0.6)' : '#ffffff';
      const smokeBaseY = cy - bg.chimney.height - 4;
      for (let s = 0; s < 4; s++) {
        const stepOffset = ((time * 28 + s * 18) % 85);
        const sy = smokeBaseY - stepOffset;
        const sx = cx + (s % 2 === 0 ? 8 : -8) + Math.sin(time * 2 + s) * 5;
        ctx.fillRect(sx - 5, sy - 5, 10 + s * 2, 8 + s * 2);
      }
    }
  }

  // Background windows grid
  ctx.fillStyle = isFar ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.65)';
  const rows = Math.floor(bH / 65);
  const cols = Math.floor(bW / 55);
  for (let r = 1; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillRect(bX + 16 + c * 48, bY + 14 + r * 55, 18, 26);
    }
  }

  ctx.restore();
}

// Draw Foreground Wooden Fence Bollards & Rope (Sara Nicely illustration foreground!)
export function drawForegroundFence(
  ctx: CanvasRenderingContext2D,
  camX: number,
  width: number,
  groundY: number
) {
  ctx.save();
  const startX = Math.floor((camX - 100) / 100) * 100;
  const endX = camX + width + 100;

  for (let fx = startX; fx < endX; fx += 100) {
    // Wooden post
    ctx.fillStyle = '#78350f';
    ctx.fillRect(fx - 7, groundY - 26, 14, 26);
    // Beveled post top
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(fx - 7, groundY - 26);
    ctx.lineTo(fx, groundY - 31);
    ctx.lineTo(fx + 7, groundY - 26);
    ctx.closePath();
    ctx.fill();

    // Sagging rope between posts
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(fx, groundY - 20);
    ctx.quadraticCurveTo(fx + 50, groundY - 10, fx + 100, groundY - 20);
    ctx.stroke();

    // Occasional cute Naif sparrow perched on top of post
    if (Math.sin(fx * 0.05) > 0.6) {
      ctx.save();
      ctx.translate(fx, groundY - 32);
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(0, -5, 7, 5, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(4, -8, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(7, -8);
      ctx.lineTo(11, -7);
      ctx.lineTo(7, -6);
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.restore();
}

// Draw Wind Streaks & Floating Autumn Leaves in the breeze
export function drawWindStreaks(ctx: CanvasRenderingContext2D, time: number, camX: number, width: number) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([22, 16]);

  const windYOffsets = [55, 95, 145, 195];
  windYOffsets.forEach((wy, idx) => {
    const windSpeed = 85 + idx * 25;
    const wx = ((time * windSpeed) % (width + 500)) - 250;
    ctx.beginPath();
    ctx.moveTo(camX + wx, wy + Math.sin(time * 2 + idx) * 8);
    ctx.lineTo(camX + wx + 130, wy + Math.sin(time * 2 + idx + 1) * 8);
    ctx.stroke();

    // Swirling green & autumn golden leaf caught in wind
    const leafX = camX + wx + 65;
    const leafY = wy + Math.sin(time * 3 + idx) * 12;
    ctx.save();
    ctx.translate(leafX, leafY);
    ctx.rotate(time * 4 + idx);
    ctx.fillStyle = idx % 2 === 0 ? '#f59e0b' : '#16a34a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  ctx.setLineDash([]);
  ctx.restore();
}

// Draw Refined Naif European Storybook Building with Detailed Facade & Window Occupants
export function drawBuilding(ctx: CanvasRenderingContext2D, building: TownBuilding, screenX: number, groundY: number) {
  const bX = screenX;
  const bY = groundY - building.height;
  const bW = building.width;
  const bH = building.height;

  ctx.save();

  // 1. Main building body with soft gouache paper feel
  ctx.fillStyle = building.color;
  ctx.fillRect(bX, bY, bW, bH);

  // 2. Foundation stone plinth & cellar grates
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.fillRect(bX, groundY - 20, bW, 20);
  ctx.fillStyle = '#1e293b';
  for (let gx = bX + 22; gx < bX + bW - 30; gx += 70) {
    ctx.fillRect(gx, groundY - 14, 20, 8);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(gx, groundY - 14, 20, 8);
  }

  // 3. Ashlar Stone Corner Quoins (Alternating corner masonry blocks)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
  const quoinH = 18;
  const quoinCount = Math.floor(bH / quoinH);
  for (let q = 0; q < quoinCount; q++) {
    const qy = groundY - (q + 1) * quoinH;
    const isLong = q % 2 === 0;
    const qw = isLong ? 16 : 10;
    // Left corner
    ctx.fillRect(bX, qy, qw, quoinH - 1.5);
    // Right corner
    ctx.fillRect(bX + bW - qw, qy, qw, quoinH - 1.5);
  }

  // 4. Half-timbering wooden beams (Colombage) on upper floors
  ctx.strokeStyle = 'rgba(120, 53, 15, 0.28)';
  ctx.lineWidth = 2.5;
  const floor2Y = groundY - 110;
  if (bH > 220) {
    ctx.beginPath();
    // Horizontal beam separating ground shop and upper floor
    ctx.moveTo(bX, floor2Y);
    ctx.lineTo(bX + bW, floor2Y);
    if (bH > 340) {
      // 3rd floor beam
      ctx.moveTo(bX, floor2Y - 80);
      ctx.lineTo(bX + bW, floor2Y - 80);
    }
    // Decorative diagonal cross braces on piers
    ctx.moveTo(bX + 16, floor2Y);
    ctx.lineTo(bX + 36, floor2Y - 40);
    ctx.moveTo(bX + bW - 16, floor2Y);
    ctx.lineTo(bX + bW - 36, floor2Y - 40);
    ctx.stroke();
  }

  // 5. Roof Architecture
  ctx.fillStyle = building.roofColor;
  ctx.beginPath();
  if (building.roofType === 'gable') {
    ctx.moveTo(bX - 8, bY);
    ctx.lineTo(bX + bW / 2, bY - 48);
    ctx.lineTo(bX + bW + 8, bY);
  } else if (building.roofType === 'mansard') {
    ctx.moveTo(bX - 6, bY);
    ctx.lineTo(bX + 22, bY - 42);
    ctx.lineTo(bX + bW - 22, bY - 42);
    ctx.lineTo(bX + bW + 6, bY);
  } else if (building.roofType === 'steep') {
    ctx.moveTo(bX - 6, bY);
    ctx.lineTo(bX + bW / 2, bY - 65);
    ctx.lineTo(bX + bW + 6, bY);
  } else {
    ctx.moveTo(bX - 8, bY);
    ctx.quadraticCurveTo(bX + bW / 2, bY - 50, bX + bW + 8, bY);
  }
  ctx.closePath();
  ctx.fill();

  // Roof scalloped tile texture lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(bX + 10, bY - 14);
  ctx.lineTo(bX + bW - 10, bY - 14);
  ctx.moveTo(bX + 24, bY - 28);
  ctx.lineTo(bX + bW - 24, bY - 28);
  ctx.stroke();

  // Chimney with playful smoke puffs
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(bX + bW * 0.72, bY - 46, 18, 28);
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(bX + bW * 0.72 - 2, bY - 50, 22, 5);
  // Terracotta chimney pots
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.arc(bX + bW * 0.72 + 5, bY - 53, 3, 0, Math.PI * 2);
  ctx.arc(bX + bW * 0.72 + 13, bY - 53, 3, 0, Math.PI * 2);
  ctx.fill();

  // 6. Ground Floor Shop Entrance Door & Display Showcase
  const doorW = 32;
  const doorH = 72;
  const doorX = bX + bW - 46;
  const doorY = groundY - doorH;

  // Door frame
  ctx.fillStyle = '#78350f';
  ctx.fillRect(doorX - 2, doorY - 4, doorW + 4, doorH + 4);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(doorX, doorY, doorW, doorH);

  // Door panels & brass knocker
  ctx.fillStyle = '#78350f';
  ctx.fillRect(doorX + 3, doorY + 6, doorW - 6, 26);
  ctx.fillRect(doorX + 3, doorY + 36, doorW - 6, 28);
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(doorX + doorW - 6, doorY + 38, 2.5, 0, Math.PI * 2); // brass knob
  ctx.fill();
  ctx.fillRect(doorX + 4, doorY + doorH - 6, doorW - 8, 4); // brass kickplate

  // Ground level storefront multi-pane display window
  const shopWinX = bX + 16;
  const shopWinY = groundY - 78;
  const shopWinW = bW - 74;
  const shopWinH = 54;
  if (shopWinW > 40) {
    ctx.fillStyle = '#fef3c7'; // warm interior amber glow
    ctx.fillRect(shopWinX, shopWinY, shopWinW, shopWinH);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.strokeRect(shopWinX, shopWinY, shopWinW, shopWinH);

    // Multi-pane dividers
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(shopWinX + shopWinW / 2, shopWinY);
    ctx.lineTo(shopWinX + shopWinW / 2, shopWinY + shopWinH);
    ctx.moveTo(shopWinX, shopWinY + shopWinH / 2);
    ctx.lineTo(shopWinX + shopWinW, shopWinY + shopWinH / 2);
    ctx.stroke();

    // Display merchandise inside window
    if (building.type === 'bakery') {
      // Golden Croissants on brass cake stand
      ctx.fillStyle = '#b45309';
      ctx.fillRect(shopWinX + 8, shopWinY + shopWinH - 12, shopWinW - 16, 3);
      ctx.fillStyle = '#f59e0b';
      for (let cx = shopWinX + 14; cx < shopWinX + shopWinW - 12; cx += 14) {
        ctx.beginPath();
        ctx.ellipse(cx, shopWinY + shopWinH - 15, 5, 3.5, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (building.type === 'bookshop') {
      // Colorful books
      const bookColors = ['#dc2626', '#16a34a', '#2563eb', '#ca8a04'];
      for (let bx = shopWinX + 6; bx < shopWinX + shopWinW - 8; bx += 8) {
        ctx.fillStyle = bookColors[Math.floor((bx - shopWinX) / 8) % bookColors.length];
        ctx.fillRect(bx, shopWinY + shopWinH - 18, 6, 15);
      }
    } else if (building.type === 'florist') {
      // Potted flowers
      for (let fx = shopWinX + 10; fx < shopWinX + shopWinW - 10; fx += 16) {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(fx - 4, shopWinY + shopWinH - 10, 8, 8);
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(fx, shopWinY + shopWinH - 14, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 7. Upper Floor Windows with Louvered Shutters, Flower Boxes & Occupants (窗里的人!)
  building.windows.forEach((win) => {
    const wx = bX + win.x;
    const wy = bY + win.y;

    // Stone lintel & sill
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.fillRect(wx - 2, wy - 3, win.w + 4, 3);
    ctx.fillRect(wx - 3, wy + win.h, win.w + 6, 3);

    // Window opening & warm light
    ctx.fillStyle = win.lit ? '#fef08a' : '#bfdbfe';
    ctx.fillRect(wx, wy, win.w, win.h);

    // Louvered Shutters in charming pastel (Sage green / Powder blue)
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(wx - 9, wy - 1, 7, win.h + 2);
    ctx.fillRect(wx + win.w + 2, wy - 1, 7, win.h + 2);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(wx - 9, wy - 1, 7, win.h + 2);
    ctx.strokeRect(wx + win.w + 2, wy - 1, 7, win.h + 2);
    // Shutter louvers
    for (let sy = wy + 4; sy < wy + win.h; sy += 5) {
      ctx.beginPath();
      ctx.moveTo(wx - 8, sy);
      ctx.lineTo(wx - 3, sy);
      ctx.moveTo(wx + win.w + 3, sy);
      ctx.lineTo(wx + win.w + 8, sy);
      ctx.stroke();
    }

    // -------------------------------------------------------------
    // 窗里的人 (People visible inside windows!)
    // -------------------------------------------------------------
    if (win.occupant) {
      const pCenterX = wx + win.w / 2;
      const pBaseY = wy + win.h;

      // 1. Grandpa in spectacles & wool cap reading / tea
      if (win.occupant === 'grandpa') {
        // Waistcoat
        ctx.fillStyle = '#78350f';
        ctx.fillRect(pCenterX - 8, pBaseY - 14, 16, 14);
        // Head
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(pCenterX, pBaseY - 20, 6.5, 0, Math.PI * 2);
        ctx.fill();
        // White mustache
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(pCenterX - 3.5, pBaseY - 19, 7, 2.5);
        // Glasses
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.strokeRect(pCenterX - 4.5, pBaseY - 22, 4, 3);
        ctx.strokeRect(pCenterX + 0.5, pBaseY - 22, 4, 3);
        // Wool cap
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.ellipse(pCenterX, pBaseY - 26, 7.5, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // 2. Cheerful Girl waving both arms!
      else if (win.occupant === 'girl') {
        // Dress
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(pCenterX - 7, pBaseY - 14, 14, 14);
        // Head
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(pCenterX, pBaseY - 19, 6.5, 0, Math.PI * 2);
        ctx.fill();
        // Dark brown hair & pigtails with red bows
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(pCenterX - 6, pBaseY - 20, 3, 0, Math.PI * 2);
        ctx.arc(pCenterX + 6, pBaseY - 20, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(pCenterX - 7, pBaseY - 23, 2.5, 2.5);
        ctx.fillRect(pCenterX + 5, pBaseY - 23, 2.5, 2.5);
        // Waving hands resting on window sill
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(pCenterX - 8, pBaseY - 2, 2.5, 0, Math.PI * 2);
        ctx.arc(pCenterX + 8, pBaseY - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // 3. Baker in white chef toque
      else if (win.occupant === 'baker') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(pCenterX - 7, pBaseY - 14, 14, 14);
        // Head
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(pCenterX, pBaseY - 19, 6.5, 0, Math.PI * 2);
        ctx.fill();
        // Tall chef toque hat
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(pCenterX - 5, pBaseY - 31, 10, 11);
        ctx.beginPath();
        ctx.arc(pCenterX, pBaseY - 31, 6, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      // 4. Cat napping on window sill
      else if (win.occupant === 'cat') {
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.ellipse(pCenterX, pBaseY - 5, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pCenterX + 6, pBaseY - 8, 4, 0, Math.PI * 2);
        ctx.fill();
        // Ears
        ctx.fillStyle = '#c2410c';
        ctx.beginPath();
        ctx.moveTo(pCenterX + 4, pBaseY - 12);
        ctx.lineTo(pCenterX + 6, pBaseY - 15);
        ctx.lineTo(pCenterX + 8, pBaseY - 12);
        ctx.fill();
      }
      // 5. Reader engrossed in book
      else if (win.occupant === 'reader') {
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(pCenterX - 7, pBaseY - 14, 14, 14);
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(pCenterX, pBaseY - 19, 6.5, 0, Math.PI * 2);
        ctx.fill();
        // Open red book on sill
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(pCenterX - 7, pBaseY - 1);
        ctx.lineTo(pCenterX, pBaseY - 4);
        ctx.lineTo(pCenterX + 7, pBaseY - 1);
        ctx.lineTo(pCenterX + 7, pBaseY - 6);
        ctx.lineTo(pCenterX, pBaseY - 9);
        ctx.lineTo(pCenterX - 7, pBaseY - 6);
        ctx.closePath();
        ctx.fill();
      }
      // 6. Lady watering flowers with brass can
      else if (win.occupant === 'lady') {
        ctx.fillStyle = '#9333ea';
        ctx.fillRect(pCenterX - 7, pBaseY - 14, 14, 14);
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(pCenterX, pBaseY - 19, 6.5, 0, Math.PI * 2);
        ctx.fill();
        // Bonnet
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(pCenterX, pBaseY - 21, 8, Math.PI, 0);
        ctx.fill();
        // Brass watering can
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(pCenterX + 4, pBaseY - 10, 6, 6);
        ctx.beginPath();
        ctx.moveTo(pCenterX + 10, pBaseY - 9);
        ctx.lineTo(pCenterX + 15, pBaseY - 5);
        ctx.stroke();
      }
    }

    // Window Panes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(wx, wy, win.w, win.h);
    ctx.beginPath();
    ctx.moveTo(wx + win.w / 2, wy);
    ctx.lineTo(wx + win.w / 2, wy + win.h);
    ctx.moveTo(wx, wy + win.h / 2);
    ctx.lineTo(wx + win.w, wy + win.h / 2);
    ctx.stroke();

    // Terracotta Flower Box brimming with red geraniums & ivy
    if (win.flowerBox !== false) {
      ctx.fillStyle = '#b45309';
      ctx.fillRect(wx - 4, wy + win.h + 1, win.w + 8, 7);
      // Ivy leaves
      ctx.fillStyle = '#15803d';
      ctx.fillRect(wx - 2, wy + win.h + 6, 6, 4);
      ctx.fillRect(wx + win.w - 4, wy + win.h + 6, 5, 4);
      // Red Geranium flowers
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(wx + 4, wy + win.h + 2, 3, 0, Math.PI * 2);
      ctx.arc(wx + win.w / 2, wy + win.h + 1, 3.5, 0, Math.PI * 2);
      ctx.arc(wx + win.w - 4, wy + win.h + 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // 8. Striped Scalloped Awning for Bakery & Cafe
  if (building.hasAwning) {
    const awningY = groundY - 82;
    const awningH = 26;
    const awningW = bW - 20;
    const stripeCount = 7;
    const stripeW = awningW / stripeCount;
    const stripeColor = building.awningColor || '#dc2626';

    for (let i = 0; i < stripeCount; i++) {
      ctx.fillStyle = i % 2 === 0 ? stripeColor : '#ffffff';
      ctx.beginPath();
      ctx.moveTo(bX + 10 + i * stripeW, awningY);
      ctx.lineTo(bX + 10 + (i + 1) * stripeW, awningY);
      ctx.lineTo(bX + 6 + (i + 1) * stripeW, awningY + awningH);
      ctx.lineTo(bX + 6 + i * stripeW, awningY + awningH);
      ctx.closePath();
      ctx.fill();

      // Scalloped fringe
      ctx.beginPath();
      ctx.arc(bX + 6 + i * stripeW + stripeW / 2, awningY + awningH, stripeW / 2, 0, Math.PI);
      ctx.fill();
    }

    // Carved Merchant Signboard suspended on wrought-iron bracket
    if (building.signText) {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(bX + 16, awningY - 26, bW - 32, 20);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bX + 18, awningY - 24, bW - 36, 16);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(building.signText, bX + bW / 2, awningY - 12);
    }
  }

  ctx.restore();
}

// Draw Realistic Ground-Level Storefront Glass Showcase (Florist / Bakery window)
export function drawStorefrontGlass(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, time: number) {
  ctx.save();
  // Wooden / Brass Shop Window Frame
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(x - 3, y - 3, width + 6, height + 6);

  // Glass backing showing plants / pastries inside
  ctx.fillStyle = 'rgba(219, 234, 254, 0.45)';
  ctx.fillRect(x, y, width, height);

  // Interior flower bouquets / items inside shop
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.arc(x + 25, y + height - 20, 16, 0, Math.PI * 2);
  ctx.arc(x + width - 25, y + height - 20, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(x + 25, y + height - 26, 7, 0, Math.PI * 2);
  ctx.arc(x + width - 25, y + height - 26, 7, 0, Math.PI * 2);
  ctx.fill();

  // Exterior Glass reflections (Diagonal glares)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 4;
  const glare = Math.sin(time * 2) * 12;
  ctx.beginPath();
  ctx.moveTo(x + 12 + glare, y + 10);
  ctx.lineTo(x + width - 20 + glare, y + height - 10);
  ctx.moveTo(x + 28 + glare, y + 10);
  ctx.lineTo(x + width - 4 + glare, y + height - 10);
  ctx.stroke();

  // Glass storefront warning label
  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 11px Fredoka, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⚠️ 橱窗玻璃', x + width / 2, y - 8);

  ctx.restore();
}

// Draw Golden Royal Mailbox (for Carrier Pigeon Rush mission!)
export function drawMailbox(ctx: CanvasRenderingContext2D, x: number, y: number, hasDelivered: boolean) {
  ctx.save();
  ctx.translate(x, y);

  // Mailbox post
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(14, 30, 10, 40);

  // Mailbox body (British / French royal pillar box)
  ctx.fillStyle = hasDelivered ? '#22c55e' : '#dc2626';
  ctx.beginPath();
  ctx.arc(19, 14, 18, Math.PI, 0);
  ctx.lineTo(37, 36);
  ctx.lineTo(1, 36);
  ctx.closePath();
  ctx.fill();

  // Gold post horn insignia
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(19, 22, 6, 0, Math.PI * 2);
  ctx.stroke();

  // Mail slot
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(10, 12, 18, 4);

  // Indicator banner
  ctx.fillStyle = hasDelivered ? '#15803d' : '#b45309';
  ctx.font = 'bold 11px Fredoka, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(hasDelivered ? '✅ 已送达' : '📬 投递处 [D]', 19, -8);

  ctx.restore();
}

// Draw Scaled Retro French Vintage Car (Prime Perch & Poop Contrast Target)
export function drawVintageCar(ctx: CanvasRenderingContext2D, obs: Obstacle, groundY: number) {
  ctx.save();
  const cX = obs.x;
  const cY = groundY - obs.height;
  const cW = obs.width;
  const cH = obs.height;
  const bodyColor = obs.carColor || '#1e3a8a';

  // Shadow under car
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(cX + cW / 2, groundY - 3, cW * 0.48, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wheels
  const wheelR = 10;
  const wheelsX = [cX + 20, cX + cW - 20];
  wheelsX.forEach((wx) => {
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(wx, groundY - wheelR + 2, wheelR, 0, Math.PI * 2);
    ctx.fill();
    // Chrome hubcap
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(wx, groundY - wheelR + 2, 4.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Lower chassis & fenders
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.roundRect(cX, groundY - 24, cW, 16, 6);
  ctx.fill();

  // Curved passenger cabin roof
  ctx.beginPath();
  ctx.moveTo(cX + 18, groundY - 24);
  ctx.quadraticCurveTo(cX + 30, cY, cX + cW / 2, cY);
  ctx.quadraticCurveTo(cX + cW - 22, cY, cX + cW - 14, groundY - 24);
  ctx.closePath();
  ctx.fill();

  // Windows
  ctx.fillStyle = '#bfdbfe';
  ctx.beginPath();
  ctx.moveTo(cX + 24, groundY - 22);
  ctx.quadraticCurveTo(cX + 32, cY + 4, cX + cW / 2 - 2, cY + 4);
  ctx.lineTo(cX + cW / 2 - 2, groundY - 22);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cX + cW / 2 + 2, cY + 4);
  ctx.quadraticCurveTo(cX + cW - 26, cY + 4, cX + cW - 20, groundY - 22);
  ctx.lineTo(cX + cW / 2 + 2, groundY - 22);
  ctx.closePath();
  ctx.fill();

  // Chrome bumpers
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(cX - 4, groundY - 18, 5, 8);
  ctx.fillRect(cX + cW - 1, groundY - 18, 5, 8);

  // Round headlights
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(cX + cW - 2, groundY - 18, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Splattered Poop on Car Roof!
  if (obs.hasPoopOnRoof) {
    ctx.fillStyle = obs.poopColor === 'white' ? '#ffffff' : '#0f172a';
    ctx.beginPath();
    ctx.arc(cX + cW / 2, cY + 3, 7, 0, Math.PI * 2);
    ctx.arc(cX + cW / 2 - 5, cY + 5, 4, 0, Math.PI * 2);
    ctx.arc(cX + cW / 2 + 5, cY + 4, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// Draw Scaled Classic European Streetlamp with Hanging Flower Basket
export function drawStreetlamp(ctx: CanvasRenderingContext2D, obs: Obstacle, groundY: number) {
  ctx.save();
  const lx = obs.x + obs.width / 2;
  const lH = obs.height;
  const topY = groundY - lH;

  // Lamp post
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(lx, groundY);
  ctx.lineTo(lx, topY + 18);
  ctx.stroke();

  // Base plinth
  ctx.fillStyle = '#334155';
  ctx.fillRect(lx - 7, groundY - 10, 14, 10);

  // Curved arm & lantern
  ctx.beginPath();
  ctx.arc(lx + 10, topY + 22, 14, Math.PI, 1.8 * Math.PI);
  ctx.stroke();

  // Lantern glass & warm glow
  ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
  ctx.beginPath();
  ctx.arc(lx + 20, topY + 26, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.moveTo(lx + 14, topY + 20);
  ctx.lineTo(lx + 26, topY + 20);
  ctx.lineTo(lx + 23, topY + 32);
  ctx.lineTo(lx + 17, topY + 32);
  ctx.closePath();
  ctx.fill();

  // Perch Finial at the very top of lamp post!
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(lx, topY + 12, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Hanging Flower Basket
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(lx - 12, topY + 38, 7, 0, Math.PI);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(lx, topY + 26);
  ctx.lineTo(lx - 12, topY + 38);
  ctx.stroke();

  // Blossoms
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(lx - 14, topY + 36, 3.5, 0, Math.PI * 2);
  ctx.arc(lx - 10, topY + 35, 3.5, 0, Math.PI * 2);
  ctx.arc(lx - 12, topY + 41, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Draw Scaled Outdoor Cafe Patio Table & Parasol Umbrella & Chair
export function drawCafePatioTable(ctx: CanvasRenderingContext2D, x: number, groundY: number) {
  ctx.save();
  ctx.translate(x, groundY);

  // Wrought iron table leg & central umbrella pole
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -96); // umbrella pole rises up
  ctx.moveTo(-14, 0);
  ctx.lineTo(14, 0);
  ctx.stroke();

  // Striped Cafe Patio Parasol Canopy (y: -96 to -72, width: 72)
  const canopyY = -96;
  ctx.save();
  const slices = 6;
  const canopyW = 68;
  const sliceW = canopyW / slices;
  for (let s = 0; s < slices; s++) {
    ctx.fillStyle = s % 2 === 0 ? '#dc2626' : '#fef08a';
    ctx.beginPath();
    ctx.moveTo(0, canopyY);
    ctx.lineTo(-canopyW / 2 + s * sliceW, canopyY + 22);
    ctx.lineTo(-canopyW / 2 + (s + 1) * sliceW, canopyY + 22);
    ctx.closePath();
    ctx.fill();
    // Scalloped fringe
    ctx.beginPath();
    ctx.arc(-canopyW / 2 + s * sliceW + sliceW / 2, canopyY + 22, sliceW / 2, 0, Math.PI);
    ctx.fill();
  }
  // Brass top finial
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(0, canopyY - 3, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Round bistro tabletop with checkered red/white tablecloth
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.ellipse(0, -40, 34, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Porcelain espresso cup & saucer
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(-10, -42, 8, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-14, -49, 8, 7);
  // Coffee inside
  ctx.fillStyle = '#451a03';
  ctx.fillRect(-13, -48, 6, 3);

  // Bistro bentwood chair beside table
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-28, 0);
  ctx.lineTo(-28, -26);
  ctx.lineTo(-16, -26);
  ctx.lineTo(-16, 0);
  ctx.moveTo(-28, -26);
  ctx.lineTo(-28, -50);
  ctx.stroke();

  ctx.restore();
}

// Draw Scaled Bakery Pastry Crate / Stand
export function drawBakeryStand(ctx: CanvasRenderingContext2D, x: number, groundY: number) {
  ctx.save();
  ctx.translate(x, groundY);

  // Wooden display bench
  ctx.fillStyle = '#b45309';
  ctx.fillRect(-28, -38, 56, 38);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-30, -42, 60, 6);

  // Bakery tray paper
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(-24, -45, 48, 4);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px Fredoka, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🥖 PAIN FRAIS', 0, -20);

  ctx.restore();
}

// Draw Scaled Park Bench with green slats (Grandpa's Bench)
export function drawParkBench(ctx: CanvasRenderingContext2D, x: number, groundY: number) {
  ctx.save();
  ctx.translate(x, groundY);

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-26, 0);
  ctx.lineTo(-24, -22);
  ctx.lineTo(24, -22);
  ctx.lineTo(26, 0);
  ctx.moveTo(-24, -22);
  ctx.lineTo(-28, -46);
  ctx.moveTo(24, -22);
  ctx.lineTo(20, -46);
  ctx.stroke();

  ctx.fillStyle = '#15803d';
  ctx.fillRect(-30, -24, 60, 6);
  ctx.fillRect(-29, -35, 58, 6);
  ctx.fillRect(-28, -46, 56, 6);

  ctx.restore();
}

// Draw Scaled Cozy Picnic Blanket
export function drawPicnicBlanket(ctx: CanvasRenderingContext2D, x: number, groundY: number) {
  ctx.save();
  ctx.translate(x, groundY);

  const bW = 84;
  const bH = 18;
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(-bW / 2, -bH, bW, bH);

  // Checker pattern
  ctx.fillStyle = '#facc15';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(-bW / 2 + i * 21, -bH, 11, bH);
  }

  // Thermos flask
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(-28, -32, 10, 18);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-29, -36, 12, 5);

  // Sleeping cat/dog curled up
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.arc(20, -9, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(26, -11, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Draw Scaled Vintage Bicycle
export function drawVintageBicycle(ctx: CanvasRenderingContext2D, x: number, groundY: number) {
  ctx.save();
  ctx.translate(x, groundY);

  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.arc(-22, -15, 15, 0, Math.PI * 2);
  ctx.arc(22, -15, 15, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-22, -15);
  ctx.lineTo(0, -15);
  ctx.lineTo(10, -32);
  ctx.lineTo(-10, -32);
  ctx.lineTo(-22, -15);
  ctx.moveTo(0, -15);
  ctx.lineTo(-10, -32);
  ctx.moveTo(10, -32);
  ctx.lineTo(22, -15);
  ctx.stroke();

  // Woven basket
  ctx.fillStyle = '#d97706';
  ctx.fillRect(10, -40, 12, 10);

  ctx.restore();
}

// Draw Animated Town Fountain with rich water cascades
export function drawFountain(ctx: CanvasRenderingContext2D, x: number, groundY: number, time: number) {
  ctx.save();
  ctx.translate(x, groundY);

  // Stone base basin
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.ellipse(0, -8, 68, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pool water
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.ellipse(0, -12, 58, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shimmering ripples
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.ellipse(0, -12, 42 + Math.sin(time * 5) * 5, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Central column
  ctx.fillStyle = '#475569';
  ctx.fillRect(-12, -62, 24, 52);

  // Upper basin bowl
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.ellipse(0, -62, 32, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  // Spouting multi-water jets
  ctx.strokeStyle = '#bae6fd';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, -64);
  const waterJetH = 32 + Math.sin(time * 7) * 6;
  ctx.quadraticCurveTo(-18, -64 - waterJetH, -26, -22);
  ctx.moveTo(0, -64);
  ctx.quadraticCurveTo(18, -64 - waterJetH, 26, -22);
  ctx.moveTo(0, -64);
  ctx.quadraticCurveTo(-8, -64 - waterJetH * 1.15, 0, -22);
  ctx.stroke();

  // Droplets
  ctx.fillStyle = '#e0f2fe';
  for (let i = 0; i < 6; i++) {
    const dropY = -64 - Math.sin(time * 6 + i) * waterJetH * 0.7;
    const dropX = Math.cos(time * 5 + i) * 20;
    ctx.beginPath();
    ctx.arc(dropX, dropY, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// Draw Scaled Naif Tree
export function drawTree(ctx: CanvasRenderingContext2D, x: number, groundY: number, opacity: number = 1.0) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(x, groundY);

  ctx.fillStyle = '#78350f';
  ctx.fillRect(-12, -110, 24, 110);

  const foliageColors = ['#15803d', '#16a34a', '#22c55e', '#4ade80'];
  ctx.fillStyle = foliageColors[0];
  ctx.beginPath();
  ctx.arc(-32, -130, 38, 0, Math.PI * 2);
  ctx.arc(32, -130, 38, 0, Math.PI * 2);
  ctx.arc(0, -180, 48, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = foliageColors[2];
  ctx.beginPath();
  ctx.arc(-20, -150, 30, 0, Math.PI * 2);
  ctx.arc(20, -150, 30, 0, Math.PI * 2);
  ctx.arc(0, -195, 34, 0, Math.PI * 2);
  ctx.fill();

  // Apples
  ctx.fillStyle = '#ef4444';
  const berries = [
    [-24, -150], [18, -165], [-6, -205], [26, -135], [-32, -120]
  ];
  berries.forEach(([bx, by]) => {
    ctx.beginPath();
    ctx.arc(bx, by, 5.5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

// Draw Archway (Passable stone portal)
export function drawArchway(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.save();
  ctx.fillStyle = '#78716c';
  ctx.fillRect(x, y, 20, height);
  ctx.fillRect(x + width - 20, y, 20, height);

  ctx.beginPath();
  ctx.arc(x + width / 2, y + 24, width / 2, Math.PI, 0);
  ctx.lineWidth = 22;
  ctx.strokeStyle = '#78716c';
  ctx.stroke();

  const grad = ctx.createRadialGradient(x + width / 2, y + height / 2, 8, x + width / 2, y + height / 2, width / 2);
  grad.addColorStop(0, 'rgba(254, 240, 138, 0.28)');
  grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(x + 20, y + 24, width - 40, height - 24);

  // Lantern
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + width / 2, y + 10);
  ctx.lineTo(x + width / 2, y + 28);
  ctx.stroke();

  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(x + width / 2, y + 32, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Draw Animated Town NPCs with Walking & Startle Reactions
export function drawTownNPC(ctx: CanvasRenderingContext2D, npc: TownNPC, groundY: number, time: number) {
  ctx.save();
  ctx.translate(npc.x, groundY);
  ctx.scale(1.0, 1.0); // Harmonized human scale matching houses and street vehicles!

  const isStartled = npc.state === 'startled';
  const isWalking = npc.state === 'walking';
  const walkCycle = isWalking ? Math.sin(time * 10) * 6 : 0;

  // 1. Grandpa on park bench
  if (npc.type === 'grandpa_bench') {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-12, -38, 24, 26);

    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -50, 13, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.ellipse(0, -62, 15, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mustache
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(-4, -48, 4, 0, Math.PI * 2);
    ctx.arc(4, -48, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(-14, -26, 28, 14);
  }

  // 2. Walking Townsman with coat
  else if (npc.type === 'townsman') {
    // Legs walking
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-8 + walkCycle, -22, 6, 22);
    ctx.fillRect(2 - walkCycle, -22, 6, 22);

    // Coat (dark or light)
    ctx.fillStyle = npc.coatColor === 'dark' ? '#1e293b' : '#f8fafc';
    ctx.fillRect(-12, -56, 24, 34);

    // Head & Hat
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -68, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(0, -78, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Lady with Parasol
  else if (npc.type === 'lady_parasol') {
    // Legs
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-6 + walkCycle, -22, 5, 22);
    ctx.fillRect(1 - walkCycle, -22, 5, 22);

    // Dress
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.moveTo(-16, -22);
    ctx.lineTo(16, -22);
    ctx.lineTo(10, -58);
    ctx.lineTo(-10, -58);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -68, 11, 0, Math.PI * 2);
    ctx.fill();

    // Parasol
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(12, -45);
    ctx.lineTo(18, -85);
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(18, -85, 18, Math.PI, 0);
    ctx.closePath();
    ctx.fill();

    // Poop splat on top of parasol canopy!
    if (npc.hasPoopOnHead) {
      ctx.fillStyle = npc.poopColor === 'white' ? '#ffffff' : '#0f172a';
      ctx.beginPath();
      ctx.arc(18, -92, 7.5, 0, Math.PI * 2);
      ctx.arc(12, -90, 4.5, 0, Math.PI * 2);
      ctx.arc(24, -90, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = npc.poopColor === 'white' ? '#e2e8f0' : '#334155';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  // 4. Gentleman with Tulips Bouquet (Sara Nicely illustration!)
  else if (npc.type === 'gentleman_tulips') {
    // Legs walking
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-8 + walkCycle, -24, 7, 24);
    ctx.fillRect(2 - walkCycle, -24, 7, 24);

    // Cozy Mustard Yellow Sweater
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(-12, -56, 24, 32);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-12, -56, 24, 6);

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -68, 12, 0, Math.PI * 2);
    ctx.fill();

    // White side hair & mustache
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(-8, -66, 4, 0, Math.PI * 2);
    ctx.arc(4, -64, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Forest green flat cap
    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.ellipse(0, -78, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Paper-wrapped bouquet of colorful tulips
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(10, -42);
    ctx.lineTo(24, -68);
    ctx.lineTo(4, -64);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Red & pink tulips popping out
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(10, -72, 4.5, 0, Math.PI * 2);
    ctx.arc(18, -75, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(14, -70, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Fashionable Girl with Coffee Cup (Sara Nicely illustration!)
  else if (npc.type === 'girl_coffee') {
    // Legs walking
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(-6 + walkCycle, -20, 5, 20);
    ctx.fillRect(2 - walkCycle, -20, 5, 20);
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-8 + walkCycle, -4, 8, 4);
    ctx.fillRect(0 - walkCycle, -4, 8, 4);

    // White scalloped dress hem & coral coat
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-12, -26, 24, 6);
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-12, -56, 24, 30);

    // Head & Purple-brown hair with straight bangs
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -68, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#581c87';
    ctx.fillRect(-10, -78, 20, 14);
    ctx.fillRect(8, -74, 5, 18); // side hair

    // Flat-topped Red Beret / Hat
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(0, -79, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-8, -84, 16, 5);

    // White paper coffee cup with cardboard sleeve
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, -48, 9, 14);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(7.5, -43, 10, 6); // sleeve
    ctx.fillStyle = '#334155';
    ctx.fillRect(7, -50, 11, 2); // lid
  }

  // 6. Girl Reading Letter (Sara Nicely illustration!)
  else if (npc.type === 'girl_letter') {
    // Legs walking
    ctx.fillStyle = '#581c87';
    ctx.fillRect(-6 + walkCycle, -22, 5, 22);
    ctx.fillRect(2 - walkCycle, -22, 5, 22);

    // Pink sweater
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(-12, -54, 24, 32);

    // Dark skin & face
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(0, -68, 12, 0, Math.PI * 2);
    ctx.fill();

    // Dark curly hair bun with cute bow
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(-8, -76, 7, 0, Math.PI * 2);
    ctx.arc(8, -76, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.ellipse(0, -74, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // White letter / flyer held with two hands
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-6, -48, 14, 18);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(-6, -48, 14, 18);
    // Text lines
    ctx.fillStyle = '#475569';
    ctx.fillRect(-4, -44, 10, 1.5);
    ctx.fillRect(-4, -40, 10, 1.5);
    ctx.fillRect(-4, -36, 10, 1.5);
  }

  // 7. Cafe Diner
  else if (npc.type === 'cafe_diner') {
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(-12, -40, 24, 28);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-12, -34, 24, 4);
    ctx.fillRect(-12, -24, 24, 4);

    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -52, 12, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Awning Cat
  else if (npc.type === 'awning_cat') {
    ctx.translate(0, -98);
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(14, -5, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(12, -10);
    ctx.lineTo(15, -16);
    ctx.lineTo(18, -10);
    ctx.fill();
  }

  // 6. Window Watcher
  else if (npc.type === 'window_watcher') {
    ctx.translate(0, -155);
    ctx.fillStyle = '#059669';
    ctx.fillRect(-14, -12, 28, 20);
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -24, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-12, -36, 24, 6);
  }

  // Poop on Head Splat Decal!
  if (npc.hasPoopOnHead) {
    ctx.fillStyle = npc.poopColor === 'white' ? '#ffffff' : '#0f172a';
    ctx.beginPath();
    ctx.arc(0, -82, 8, 0, Math.PI * 2);
    ctx.arc(-6, -80, 5, 0, Math.PI * 2);
    ctx.arc(6, -80, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = npc.poopColor === 'white' ? '#cbd5e1' : '#334155';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Comic Cartoon "!" / "！" pop-up when startled or pooped on!
  if (isStartled || npc.startleTimer > 0) {
    ctx.save();
    ctx.translate(0, -82);
    const bounceY = Math.sin(time * 20) * 5;
    ctx.translate(0, bounceY);

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 18px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('！', 0, 7);
    ctx.restore();
  }

  // Draw Opened Umbrella if NPC popped open or bought an umbrella!
  if (npc.holdingUmbrella && npc.type !== 'lady_parasol') {
    const umbColor = npc.umbrellaColor || '#38bdf8';
    ctx.save();
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(10, -50);
    ctx.lineTo(14, -88);
    ctx.stroke();

    ctx.fillStyle = umbColor;
    ctx.beginPath();
    ctx.arc(14, -88, 22, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();
  }

  // Draw Croissant if NPC bought one from the bakery!
  if (npc.heldLootType === 'croissant') {
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(12, -42, 7, 4.5, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Citizen Nameplate above head (For Gazette & realism)
  if (npc.name && npc.type !== 'awning_cat') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.font = 'bold 8.5px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(npc.name, 0, -96);
  }

  ctx.restore();
}

// Draw Poop Dropping in Flight
export function drawPoopProjectile(ctx: CanvasRenderingContext2D, p: PoopProjectile) {
  ctx.save();
  ctx.translate(p.x, p.y);

  ctx.fillStyle = p.color === 'white' ? '#ffffff' : '#0f172a';
  ctx.beginPath();
  ctx.ellipse(0, 0, p.size * 0.8, p.size * 1.3, p.vx * 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = p.color === 'white' ? '#cbd5e1' : '#334155';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.restore();
}

// Draw Single Poop Splatter
export function drawPoopDecal(ctx: CanvasRenderingContext2D, decal: PoopDecal) {
  ctx.save();
  ctx.translate(decal.x, decal.y);

  ctx.fillStyle = decal.color === 'white' ? '#ffffff' : '#0f172a';
  const r = decal.size;

  // Star-like organic splat pattern
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.arc(-r * 0.8, -r * 0.5, r * 0.45, 0, Math.PI * 2);
  ctx.arc(r * 0.9, -r * 0.3, r * 0.4, 0, Math.PI * 2);
  ctx.arc(-r * 0.5, r * 0.8, r * 0.5, 0, Math.PI * 2);
  ctx.arc(r * 0.6, r * 0.7, r * 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = decal.color === 'white' ? 'rgba(203, 213, 225, 0.8)' : 'rgba(51, 65, 85, 0.8)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

// Draw Adjacent Poop Decals with Organic Sticky Blob Merging (相邻鸟屎边缘粘连溶合)
export function drawPoopDecalsMerged(ctx: CanvasRenderingContext2D, decals: PoopDecal[]) {
  if (decals.length === 0) return;

  ctx.save();

  // 1. Draw viscous organic bridges between nearby decals of the same color
  for (let i = 0; i < decals.length; i++) {
    for (let j = i + 1; j < decals.length; j++) {
      const d1 = decals[i];
      const d2 = decals[j];
      if (d1.color !== d2.color) continue;

      const dist = Math.hypot(d2.x - d1.x, d2.y - d1.y);
      const maxConnectDist = (d1.size + d2.size) * 1.85;

      if (dist > 2 && dist < maxConnectDist) {
        ctx.fillStyle = d1.color === 'white' ? '#ffffff' : '#0f172a';

        const angle = Math.atan2(d2.y - d1.y, d2.x - d1.x);
        const perp = angle + Math.PI / 2;
        const w1 = d1.size * 0.82;
        const w2 = d2.size * 0.82;
        const waist = Math.max(2.5, (w1 + w2) * 0.42 * (1 - dist / maxConnectDist));
        const midX = (d1.x + d2.x) / 2;
        const midY = (d1.y + d2.y) / 2;

        ctx.beginPath();
        ctx.moveTo(d1.x + Math.cos(perp) * w1, d1.y + Math.sin(perp) * w1);
        ctx.quadraticCurveTo(
          midX + Math.cos(perp) * waist,
          midY + Math.sin(perp) * waist,
          d2.x + Math.cos(perp) * w2,
          d2.y + Math.sin(perp) * w2
        );
        ctx.lineTo(d2.x - Math.cos(perp) * w2, d2.y - Math.sin(perp) * w2);
        ctx.quadraticCurveTo(
          midX - Math.cos(perp) * waist,
          midY - Math.sin(perp) * waist,
          d1.x - Math.cos(perp) * w1,
          d1.y - Math.sin(perp) * w1
        );
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = d1.color === 'white' ? 'rgba(203, 213, 225, 0.75)' : 'rgba(51, 65, 85, 0.75)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  // 2. Draw each decal star splat
  decals.forEach((decal) => {
    drawPoopDecal(ctx, decal);
  });

  ctx.restore();
}

// Draw Moving Street Traffic Vehicles (School Bus, Police Car, Postal Van, Classic Sedan, Delivery Truck, Cyclist)
export function drawTrafficVehicle(
  ctx: CanvasRenderingContext2D,
  veh: TownTrafficVehicle,
  groundY: number,
  time: number
) {
  ctx.save();
  ctx.translate(veh.x, groundY);

  // Mirror if driving left
  if (veh.direction === -1) {
    ctx.scale(-1, 1);
  }

  const w = veh.width;
  const h = veh.height;
  const wheelSpin = time * veh.speed * 8;

  // 1. YELLOW SCHOOL BUS (w: ~230, h: ~92)
  if (veh.type === 'school_bus') {
    // Bus chassis
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h, w, h - 14, [10, 8, 2, 2]);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Black horizontal side stripe
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-w / 2, -h * 0.44, w, 9);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8.5px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BUS SCOLAIRE', 0, -h * 0.44 + 7.5);

    // Rows of student windows
    ctx.fillStyle = 'rgba(224, 242, 254, 0.95)';
    const windowCount = 5;
    const winW = 20;
    const winH = 22;
    const startWinX = -w / 2 + 18;
    for (let i = 0; i < windowCount; i++) {
      const wx = startWinX + i * (winW + 8);
      ctx.fillRect(wx, -h + 12, winW, winH);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(wx, -h + 12, winW, winH);

      // Student silhouette heads looking out
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(wx + winW / 2, -h + 26, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Front driver windshield
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(w / 2 - 24, -h + 12, 18, 26);
    ctx.strokeStyle = '#0284c7';
    ctx.strokeRect(w / 2 - 24, -h + 12, 18, 26);

    // Flashing roof safety lights
    const flash = Math.sin(time * 8) > 0;
    ctx.fillStyle = flash ? '#ef4444' : '#7f1d1d';
    ctx.beginPath();
    ctx.arc(-w / 2 + 14, -h - 3, 4, 0, Math.PI * 2);
    ctx.arc(w / 2 - 14, -h - 3, 4, 0, Math.PI * 2);
    ctx.fill();

    // Front bumper & black grille
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(w / 2 - 4, -20, 8, 8);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(w / 2 - 2, -18, 5, 5);

    // Wheels
    [-w / 2 + 36, w / 2 - 36].forEach((wx) => {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(wx, -12, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(wx, -12, 5.5, 0, Math.PI * 2);
      ctx.fill();
      // Spinning spokes
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(wx + Math.cos(wheelSpin) * 11, -12 + Math.sin(wheelSpin) * 11);
      ctx.lineTo(wx - Math.cos(wheelSpin) * 11, -12 - Math.sin(wheelSpin) * 11);
      ctx.stroke();
    });
  }

  // 2. POLICE CAR (w: ~145, h: ~56)
  else if (veh.type === 'police_car') {
    // Body: navy lower, white doors/roof
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h, w, h - 10, [6, 10, 2, 2]);
    ctx.fill();

    // White door panel
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-w / 2 + 32, -h + 10, w - 64, h - 20);

    // Police star badge
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, -h / 2 + 4, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Windshield & rear glass
    ctx.fillStyle = '#bae6fd';
    ctx.beginPath();
    ctx.moveTo(w / 2 - 32, -h + 2);
    ctx.lineTo(w / 2 - 12, -h + 16);
    ctx.lineTo(w / 2 - 32, -h + 16);
    ctx.closePath();
    ctx.fill();

    // Twin flashing rooftop sirens (Red and Blue)
    const sirenFlash = Math.sin(time * 14) > 0;
    ctx.fillStyle = sirenFlash ? '#3b82f6' : '#1d4ed8';
    ctx.beginPath();
    ctx.arc(-6, -h - 5, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = !sirenFlash ? '#ef4444' : '#b91c1c';
    ctx.beginPath();
    ctx.arc(6, -h - 5, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Wheels
    [-w / 2 + 24, w / 2 - 24].forEach((wx) => {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(wx, -10, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(wx, -10, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // 3. POSTAL VAN (w: ~165, h: ~74)
  else if (veh.type === 'postal_van') {
    ctx.fillStyle = '#15803d'; // Royal emerald green
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h, w, h - 12, [6, 10, 2, 2]);
    ctx.fill();

    // Golden horn crest
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 9px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('POSTES', 0, -h / 2);

    // Front windshield
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(w / 2 - 22, -h + 10, 16, 20);

    // Wheels
    [-w / 2 + 26, w / 2 - 26].forEach((wx) => {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(wx, -11, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(wx, -11, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // 4. BICYCLE RIDER (w: ~68, h: ~68 - Harmonized with human scale!)
  else if (veh.type === 'bicycle_rider') {
    // Bicycle Frame
    ctx.strokeStyle = veh.color || '#0284c7';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-20, -12); // rear hub
    ctx.lineTo(0, -12);   // bottom bracket
    ctx.lineTo(16, -32);  // head tube
    ctx.lineTo(-4, -30);  // seat tube
    ctx.lineTo(0, -12);
    ctx.moveTo(-20, -12);
    ctx.lineTo(-4, -30);
    ctx.moveTo(16, -32);
    ctx.lineTo(20, -12);  // front fork
    ctx.stroke();

    // Wheels with spinning spokes
    [-20, 20].forEach((wx) => {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(wx, -12, 11, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(wx + Math.cos(wheelSpin) * 10, -12 + Math.sin(wheelSpin) * 10);
      ctx.lineTo(wx - Math.cos(wheelSpin) * 10, -12 - Math.sin(wheelSpin) * 10);
      ctx.stroke();
    });

    // Handlebars
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(16, -32);
    ctx.lineTo(18, -36);
    ctx.lineTo(14, -36);
    ctx.stroke();

    // Leather saddle
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-8, -32, 9, 3);

    // Pedaling Rider Body (Human scale: total height ~68px!)
    const pedalAngle = time * 7;
    // Pedaling legs
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-4, -30); // hip
    const pedalX = Math.cos(pedalAngle) * 6;
    const pedalY = -12 + Math.sin(pedalAngle) * 5;
    ctx.lineTo(pedalX - 2, -22); // knee
    ctx.lineTo(pedalX, pedalY);   // foot
    ctx.stroke();

    // Torso in jacket
    ctx.fillStyle = veh.color || '#ea580c';
    ctx.fillRect(-9, -50, 15, 20);
    ctx.fillStyle = '#ffffff'; // collar
    ctx.fillRect(-4, -50, 6, 4);

    // Arms to handlebars
    ctx.strokeStyle = veh.color || '#ea580c';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, -46);
    ctx.lineTo(16, -34);
    ctx.stroke();

    // Head with rosy cheeks
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -56, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(-2, -55, 1.5, 0, Math.PI * 2);
    ctx.arc(2, -55, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // French Beret cap
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(0, -62, 9, 3.5, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // Front wicker basket with crusty golden baguette & flowers!
    ctx.fillStyle = '#b45309';
    ctx.fillRect(14, -34, 12, 10);
    ctx.strokeStyle = '#78350f';
    ctx.strokeRect(14, -34, 12, 10);
    // Golden baguette
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(20, -38, 3, 9, 0.35, 0, Math.PI * 2);
    ctx.fill();
    // Pink flower
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(17, -35, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. DELIVERY TRUCK (w: ~190, h: ~84)
  else if (veh.type === 'delivery_truck') {
    // Wooden Cab
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.roundRect(w / 2 - 50, -h + 20, 50, h - 32, [4, 8, 2, 2]);
    ctx.fill();

    // Cream Cargo Box
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h, w - 46, h - 12, [6, 2, 2, 2]);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Croissant Logo on truck side
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(-w / 2 + 55, -h + 36, 12, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 8px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BOULANGERIE', -w / 2 + 55, -h + 54);

    // Cab windshield
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(w / 2 - 20, -h + 24, 16, 20);

    // Wheels
    [-w / 2 + 30, w / 2 - 26].forEach((wx) => {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(wx, -12, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(wx, -12, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // 6. CLASSIC RETRO SEDAN (w: ~140, h: ~52)
  else {
    // Body lower chassis
    ctx.fillStyle = veh.color || '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h + 16, w, h - 26, [8, 10, 2, 2]);
    ctx.fill();

    // Curved roof / cabin
    ctx.fillStyle = '#f8fafc'; // retro two-tone cream roof
    ctx.beginPath();
    ctx.roundRect(-w / 2 + 24, -h, w - 50, 22, [8, 8, 2, 2]);
    ctx.fill();

    // Cabin windows
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(-w / 2 + 28, -h + 4, (w - 60) / 2, 14);
    ctx.fillRect(-w / 2 + 32 + (w - 60) / 2, -h + 4, (w - 60) / 2, 14);

    // Round chrome headlights & bumper
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(w / 2 - 2, -h + 24, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(w / 2 - 2, -16, 6, 6);
    ctx.fillRect(-w / 2 - 4, -16, 6, 6);

    // Wheels (Whitewall tires!)
    [-w / 2 + 22, w / 2 - 22].forEach((wx) => {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(wx, -10, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff'; // whitewall ring
      ctx.beginPath();
      ctx.arc(wx, -10, 6.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#cbd5e1'; // chrome hubcap
      ctx.beginPath();
      ctx.arc(wx, -10, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Draw Splattered Poop stuck to moving vehicle roof!
  veh.poopDecals.forEach((decal) => {
    ctx.fillStyle = decal.color === 'white' ? '#ffffff' : '#0f172a';
    ctx.beginPath();
    ctx.arc(decal.offsetX, -h + decal.offsetY, decal.size, 0, Math.PI * 2);
    ctx.arc(decal.offsetX - 4, -h + decal.offsetY - 2, decal.size * 0.5, 0, Math.PI * 2);
    ctx.arc(decal.offsetX + 4, -h + decal.offsetY + 2, decal.size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

// Draw Balloon Packet soaring into the clouds!
// Draw Grand Festive Balloon Cluster Packet soaring into the clouds!
export function drawFloatingBalloonPacket(ctx: CanvasRenderingContext2D, bp: FloatingBalloonPacket, time: number) {
  ctx.save();
  ctx.translate(bp.x, bp.y);
  ctx.globalAlpha = bp.alpha;

  // Gentle floating sway
  const swayX = Math.sin(time * 3 + bp.vx) * 6;
  ctx.translate(swayX, 0);

  // Cluster of 6 colorful helium balloons
  const balloons = [
    { ox: -22, oy: -55, r: 13, color: '#ef4444' }, // Red
    { ox: 0, oy: -68, r: 14, color: '#38bdf8' },   // Sky blue
    { ox: 22, oy: -55, r: 13, color: '#facc15' },  // Gold yellow
    { ox: -12, oy: -42, r: 12, color: '#22c55e' }, // Emerald green
    { ox: 14, oy: -42, r: 12, color: '#a855f7' },  // Purple
    { ox: 0, oy: -48, r: 13, color: '#ec4899' },   // Pink
  ];

  // Tethered Strings converging at golden bow
  const knotY = -8;
  balloons.forEach((b, idx) => {
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.75)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, knotY);
    const bobY = b.oy + Math.sin(time * 5 + idx) * 3;
    ctx.quadraticCurveTo(b.ox * 0.4, (knotY + bobY) / 2, b.ox, bobY + b.r);
    ctx.stroke();

    // Balloon body
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.ellipse(b.ox, bobY, b.r, b.r * 1.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Specular glossy reflection highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(b.ox - b.r * 0.35, bobY - b.r * 0.4, b.r * 0.35, b.r * 0.45, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Balloon tie knot
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.moveTo(b.ox - 2.5, bobY + b.r * 1.25);
    ctx.lineTo(b.ox + 2.5, bobY + b.r * 1.25);
    ctx.lineTo(b.ox, bobY + b.r * 1.25 + 3.5);
    ctx.closePath();
    ctx.fill();
  });

  // Golden ribbon bow at gathering knot
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.ellipse(-5, knotY, 6, 3.5, -0.3, 0, Math.PI * 2);
  ctx.ellipse(5, knotY, 6, 3.5, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, knotY, 3, 0, Math.PI * 2);
  ctx.fill();

  // Woven Wicker Loot Basket / Parcel below
  const basketW = 38;
  const basketH = 24;
  const basketY = 0;

  // Two suspension ropes from knot to basket rim
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, knotY);
  ctx.lineTo(-basketW / 2 + 4, basketY);
  ctx.moveTo(0, knotY);
  ctx.lineTo(basketW / 2 - 4, basketY);
  ctx.stroke();

  // Basket body
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.roundRect(-basketW / 2, basketY, basketW, basketH, 5);
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Basket wicker weave pattern
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let bx = -basketW / 2 + 6; bx < basketW / 2; bx += 6) {
    ctx.moveTo(bx, basketY + 2);
    ctx.lineTo(bx, basketY + basketH - 2);
  }
  ctx.moveTo(-basketW / 2, basketY + basketH / 2);
  ctx.lineTo(basketW / 2, basketY + basketH / 2);
  ctx.stroke();

  // Sparkling stolen items overflowing in basket!
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(-8, basketY - 2, 5, 0, Math.PI * 2); // Gold coin
  ctx.arc(6, basketY - 1, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(0, basketY - 4, 4, 0, Math.PI * 2); // Sparkle gem
  ctx.fill();

  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(-4, basketY - 8, 3, 8); // Silver spoon handle

  // Banner tag
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px Fredoka, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`🎈 +${bp.points}`, 0, basketY + basketH + 14);

  ctx.restore();
}

// Draw Scaled Contextual Loot
export function drawContextualLoot(ctx: CanvasRenderingContext2D, loot: ActiveLoot, time: number) {
  const config = LOOT_CONFIGS[loot.type];
  const itemX = loot.x;
  const itemY = loot.y;

  ctx.save();
  ctx.translate(itemX, itemY);

  // Natural star glint every 1.5 seconds
  const glintCycle = (time * 2 + loot.bobOffset) % 3;
  if (glintCycle < 0.6) {
    const glintAlpha = Math.sin((glintCycle / 0.6) * Math.PI);
    ctx.save();
    ctx.strokeStyle = `rgba(255, 255, 255, ${glintAlpha})`;
    ctx.lineWidth = 2.2;
    const gSize = 8;
    ctx.beginPath();
    ctx.moveTo(0, -gSize);
    ctx.lineTo(0, gSize);
    ctx.moveTo(-gSize, 0);
    ctx.lineTo(gSize, 0);
    ctx.stroke();

    ctx.fillStyle = `rgba(254, 240, 138, ${glintAlpha * 0.4})`;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 1. Silver Spoon
  if (loot.type === 'silver_spoon') {
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.ellipse(0, -10, 6, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-2, 0, 4, 18);
  }
  // 2. Silver Fork
  else if (loot.type === 'silver_fork') {
    ctx.rotate(-Math.PI / 4);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-2, -5, 4, 20);
    ctx.fillRect(-5, -15, 10, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-3, -15, 2, 7);
    ctx.fillRect(1, -15, 2, 7);
  }
  // 3. Golden Croissant
  else if (loot.type === 'croissant') {
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(0, 0, 15, Math.PI * 0.2, Math.PI * 1.8);
    ctx.quadraticCurveTo(5, 0, 0, 15);
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, -8);
    ctx.lineTo(-1, 4);
    ctx.moveTo(1, -9);
    ctx.lineTo(6, 3);
    ctx.stroke();
  }
  // 4. Antique Brass Key
  else if (loot.type === 'vintage_key') {
    ctx.rotate(-Math.PI / 6);
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, -10, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-2.5, -2, 5, 20);
    ctx.fillRect(2.5, 7, 6, 4);
    ctx.fillRect(2.5, 13, 5, 4);
  }
  // 5. Grandpa's Reading Glasses
  else if (loot.type === 'reading_glasses') {
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(-11, -5, 9, 9);
    ctx.strokeRect(2, -5, 9, 9);
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(2, 0);
    ctx.moveTo(-11, 0);
    ctx.lineTo(-16, 3);
    ctx.moveTo(11, 0);
    ctx.lineTo(16, 3);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(-9, -3, 4, 4);
    ctx.fillRect(4, -3, 4, 4);
  }
  // 6. Gold Pocket Watch
  else if (loot.type === 'pocket_watch') {
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fefce8';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -6);
    ctx.moveTo(0, 0);
    ctx.lineTo(4, 2);
    ctx.stroke();
  }
  // 7. Sparkle Gem Ring
  else if (loot.type === 'sparkle_gem') {
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(-12, -4);
    ctx.lineTo(12, -4);
    ctx.lineTo(0, 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#7dd3fc';
    ctx.beginPath();
    ctx.moveTo(-12, -4);
    ctx.lineTo(-6, -11);
    ctx.lineTo(6, -11);
    ctx.lineTo(12, -4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  // 8. Gold Brooch
  else if (loot.type === 'gold_brooch') {
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.ellipse(-6, -5, 8, 5, -Math.PI / 4, 0, Math.PI * 2);
    ctx.ellipse(6, -5, 8, 5, Math.PI / 4, 0, Math.PI * 2);
    ctx.ellipse(-5, 4, 5, 4, Math.PI / 6, 0, Math.PI * 2);
    ctx.ellipse(5, 4, 5, 4, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(-1.5, -8, 3, 16);
  }
  // 9. Dropped Coins
  else if (loot.type === 'copper_coin' || loot.type === 'gold_coin') {
    const isGold = loot.type === 'gold_coin';
    ctx.fillStyle = isGold ? '#facc15' : '#b45309';
    ctx.beginPath();
    ctx.arc(0, 0, isGold ? 12 : 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isGold ? '#ca8a04' : '#78350f';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  // 10. Fountain Sip
  else if (loot.type === 'fountain_sip') {
    ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  // 11. Soda Bottle
  else if (loot.type === 'potion_bottle') {
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(0, 3, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-3, -11, 6, 6);
  }
  // 12. Red Apple
  else if (loot.type === 'red_apple') {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-4, 0, 9, 0, Math.PI * 2);
    ctx.arc(4, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-1.5, -12, 3, 5);
  }

  ctx.restore();
}

// Draw Scaled Up Crowned Crow with Bidirectional Facing & Perching Animation
export function drawCrowPlayer(ctx: CanvasRenderingContext2D, player: CrowPlayer, time: number) {
  ctx.save();
  ctx.translate(player.x, player.y);

  // Pseudo-3D Turnaround Effect (Foreshortening, yaw compression & roll banking)
  const turn = typeof player.turnProgress === 'number' ? player.turnProgress : player.facing;
  const absTurn = Math.abs(turn);
  const signTurn = Math.sign(turn) || 1;
  // Foreshorten horizontally: compresses to thin profile during turn midpoint
  const scaleX = signTurn * Math.max(0.12, absTurn);
  // 3D Banking tilt during turnaround
  const banking = (1 - absTurn) * 0.38 * (player.facing === 1 ? -1 : 1);

  ctx.scale(scaleX, 1);
  ctx.rotate(signTurn === -1 ? -player.rotation + banking : player.rotation + banking);

  const bird = player.birdConfig;
  const isCrow = bird.id === 'crow';
  const isStunned = player.state === 'STUNNED';
  const isPerched = player.state === 'PERCHED';
  const isInvincible = player.invincibleTimer > 0;

  // Scale multiplier: 1.35x larger!
  ctx.scale(1.35, 1.35);

  // Invincibility aura
  if (isInvincible) {
    ctx.save();
    ctx.strokeStyle = `rgba(251, 191, 36, ${0.5 + Math.sin(time * 15) * 0.4})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Bird Legs when Perched / Standing!
  if (isPerched) {
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, 12);
    ctx.lineTo(-8, 22);
    ctx.lineTo(-12, 23);
    ctx.moveTo(6, 12);
    ctx.lineTo(4, 22);
    ctx.lineTo(0, 23);
    ctx.stroke();
  }

  // Bird Body
  ctx.fillStyle = bird.color;

  // Tail feathers
  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.lineTo(-38, -6);
  ctx.lineTo(-36, 4);
  ctx.lineTo(-38, 12);
  ctx.lineTo(-18, 8);
  ctx.closePath();
  ctx.fill();

  // Plump body
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wings (Snappier, faster flap cycles!)
  const wingFlap = isPerched ? 0 : Math.sin(player.wingPhase);
  ctx.save();
  ctx.fillStyle = bird.color === '#f8fafc' ? '#e2e8f0' : '#0f172a';

  if (isPerched) {
    // Folded wings resting on side
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 10, -0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (player.state === 'DIVING') {
    // Tucked back aerodynamics
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.lineTo(-32, -18);
    ctx.lineTo(-18, 4);
    ctx.closePath();
    ctx.fill();
  } else {
    // Flapping snappily
    ctx.beginPath();
    ctx.moveTo(-4, -6);
    ctx.quadraticCurveTo(0, -28 * wingFlap - 6, 20, -18 * wingFlap - 4);
    ctx.quadraticCurveTo(4, 2, -4, 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Head
  ctx.fillStyle = bird.color;
  ctx.beginPath();
  ctx.arc(16, -6, 14, 0, Math.PI * 2);
  ctx.fill();

  // Large Naif Eye
  ctx.fillStyle = bird.eyeColor;
  ctx.beginPath();
  ctx.arc(19, -9, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  if (isStunned || player.state === 'TUMBLING') {
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Dizzy spiral / cross eyes
    ctx.arc(19, -9, 4.5, time * 12, time * 12 + Math.PI * 1.5);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    const pupilSize = player.state === 'DIVING' ? 3.5 : 2.5;
    ctx.arc(20, -9, pupilSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Exhausted Sweat Drops & Panting Tongue
  if (player.isExhausted) {
    // Comic blue sweat drop flying off forehead
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(12, -22 + Math.sin(time * 12) * 2, 3, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Panting little pink tongue
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(32, 2, 3.5, 0, Math.PI);
    ctx.fill();
  }

  // Sharp Beak
  ctx.fillStyle = bird.beakColor;
  ctx.beginPath();
  const beakOpen = player.state === 'DIVING' ? 3 : 0;
  ctx.moveTo(26, -11);
  ctx.lineTo(44, -5);
  ctx.lineTo(27, 2 + beakOpen);
  ctx.closePath();
  ctx.fill();

  // Sealed Letter in beak if Mail Carrier mission!
  if (player.hasMailLetter) {
    ctx.save();
    ctx.translate(38, -4);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-2, -5, 14, 10);
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-2, -5, 14, 10);
    // Red wax seal
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(5, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Clutched Loot in Mouth!
  if (!player.hasMailLetter && player.currentLoot.length > 0) {
    const latestItem = player.currentLoot[player.currentLoot.length - 1];
    ctx.save();
    ctx.translate(42, -4);
    ctx.scale(0.85, 0.85);

    if (latestItem.type === 'croissant') {
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI);
      ctx.fill();
    } else if (latestItem.type === 'silver_spoon' || latestItem.type === 'silver_fork') {
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-2, -8, 4, 16);
      ctx.beginPath();
      ctx.arc(0, -9, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (latestItem.type === 'reading_glasses') {
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-5, -3, 6, 6);
      ctx.strokeRect(3, -3, 6, 6);
    } else {
      ctx.fillStyle = latestItem.color;
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Stolen Jewelry & Necklaces around Crow's Neck!
  if (player.currentLoot.length > 0) {
    ctx.save();
    const neckX = 10;
    const neckY = 6;
    const count = Math.min(player.currentLoot.length, 6);

    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(neckX, neckY, 9, 12, Math.PI / 4, 0, Math.PI);
    ctx.stroke();

    for (let i = 0; i < count; i++) {
      const angle = (i / (count + 1)) * Math.PI;
      const jx = neckX + Math.cos(angle) * 9;
      const jy = neckY + Math.sin(angle) * 11;
      const item = player.currentLoot[i % player.currentLoot.length];
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(jx, jy, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Golden Royal Crown on Crow's head
  if (isCrow) {
    ctx.save();
    ctx.translate(14, -18);
    ctx.rotate(-0.15);
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-12, -14);
    ctx.lineTo(-5, -6);
    ctx.lineTo(0, -18);
    ctx.lineTo(5, -6);
    ctx.lineTo(12, -14);
    ctx.lineTo(10, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Crown jewels
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, -12, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(-7, -8, 2, 0, Math.PI * 2);
    ctx.arc(7, -8, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Stun stars
  if (isStunned) {
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const starAngle = time * 8 + (i * Math.PI * 2) / 3;
      const sx = 16 + Math.cos(starAngle) * 22;
      const sy = -16 + Math.sin(starAngle) * 12;
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore();
}

// Draw Realistic Slingshot Aiming Line & Trajectory Dots
export function drawSlingshotAiming(
  ctx: CanvasRenderingContext2D,
  player: CrowPlayer,
  cruiseY: number,
  groundY: number
) {
  if (!player.isDragging) return;

  const dx = player.dragStartX - player.dragCurrentX;
  const dy = player.dragStartY - player.dragCurrentY;
  const dist = Math.hypot(dx, dy);

  if (dist < 12) return;

  ctx.save();

  // Elastic pull string
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.9)';
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(player.dragStartX, player.dragStartY);
  ctx.lineTo(player.dragCurrentX, player.dragCurrentY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(player.dragStartX, player.dragStartY, 6.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(player.dragCurrentX, player.dragCurrentY, 8.5, 0, Math.PI * 2);
  ctx.fill();

  // Launch impulse calculation: exact match with GameCanvas handlePointerUp!
  const launchVx = dx * 0.14;
  const launchVy = Math.max(3.5, dy * 0.18);

  const weightFactor = player.totalWeight / player.birdConfig.baseWeight;
  const effGravity = GAME_PHYSICS.GRAVITY * (1 + (weightFactor - 1) * 0.25);
  const currentSpeedBase = player.speedBoostTimer > 0 ? GAME_PHYSICS.CRUISE_SPEED_BASE * 1.5 : GAME_PHYSICS.CRUISE_SPEED_BASE;

  let simX = player.x;
  let simY = player.y;
  let simVx = launchVx;
  let simVy = launchVy;
  const simFacing = simVx < 0 ? -1 : 1;
  let simState: 'DIVING' | 'REBOUNDING' = 'DIVING';

  const dots: { x: number; y: number; r: number }[] = [];

  for (let step = 0; step < 75; step++) {
    if (simState === 'DIVING') {
      simVy += effGravity;
      simVx *= GAME_PHYSICS.AIR_DRAG;

      const depth = simY - cruiseY;
      const springLift = Math.pow(Math.max(0, depth), 1.25) * GAME_PHYSICS.SPRING_BUOYANCY_FACTOR;
      simVy -= springLift;

      if (simVy <= 0 || simY >= groundY - 35) {
        simState = 'REBOUNDING';
      }
    } else {
      const climbForce = 0.42 * player.birdConfig.glideFactor;
      simVy -= climbForce;
      simVy *= 0.96;
      simVx = simFacing * Math.max(Math.abs(simVx), currentSpeedBase * 0.95);

      if (simY <= cruiseY + 12 && step > 8) {
        dots.push({ x: simX, y: simY, r: 3 });
        break;
      }
    }

    simX += simVx;
    simY += simVy;

    dots.push({
      x: simX,
      y: simY,
      r: Math.max(2, 4.5 - step * 0.04),
    });
  }

  // Trajectory guide line
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  dots.forEach((p, idx) => {
    if (idx === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();
  ctx.setLineDash([]);

  dots.forEach((p, idx) => {
    if (idx % 3 === 0) {
      ctx.fillStyle = idx === dots.length - 1 ? '#4ade80' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  const deepestPoint = dots.reduce((max, p) => (p.y > max.y ? p : max), dots[0] || { x: 0, y: 0 });
  if (deepestPoint) {
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(deepestPoint.x, deepestPoint.y, 14, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ 掠夺点', deepestPoint.x, deepestPoint.y - 18);
  }

  ctx.restore();
}

// Draw Floating Texts
export function drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]) {
  ctx.save();
  texts.forEach((ft) => {
    ctx.globalAlpha = Math.max(0, ft.alpha);
    ctx.fillStyle = ft.color;
    ctx.font = `bold ${Math.round(15 * ft.scale)}px Fredoka, sans-serif`;
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 5;
    ctx.fillText(ft.text, ft.x, ft.y);

    if (ft.subtext) {
      ctx.font = `bold ${Math.round(11 * ft.scale)}px Fredoka, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(ft.subtext, ft.x, ft.y + 14 * ft.scale);
    }
  });
  ctx.restore();
}

// Draw Particle Effects
export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  ctx.save();
  particles.forEach((p) => {
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;

    if (p.type === 'sparkle') {
      const s = p.size;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - s);
      ctx.lineTo(p.x + s * 0.3, p.y - s * 0.3);
      ctx.lineTo(p.x + s, p.y);
      ctx.lineTo(p.x + s * 0.3, p.y + s * 0.3);
      ctx.lineTo(p.x, p.y + s);
      ctx.lineTo(p.x - s * 0.3, p.y + s * 0.3);
      ctx.lineTo(p.x - s, p.y);
      ctx.lineTo(p.x - s * 0.3, p.y - s * 0.3);
      ctx.closePath();
      ctx.fill();
    } else if (p.type === 'confetti') {
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size * 1.5);
    } else if (p.type === 'poop_splat') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.restore();
}
