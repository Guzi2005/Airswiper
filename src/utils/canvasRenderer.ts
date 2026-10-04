import {
  ActiveLoot,
  BackgroundBuilding,
  Cloud,
  CrowPlayer,
  DroppedPhysicsItem,
  FloatingBalloonPacket,
  FloatingText,
  Obstacle,
  Particle,
  PoopDecal,
  PoopProjectile,
  TownBuilding,
  TownNPC,
  TownSparrow,
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

// Draw Refined Naif European Storybook Building (Scaled to ~70% screen height with rich Parisian facade & storefronts)
export function drawBuilding(
  ctx: CanvasRenderingContext2D,
  building: TownBuilding,
  screenX: number,
  groundY: number,
  npcs?: TownNPC[],
  time: number = 0
) {
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
  ctx.fillRect(bX, groundY - 24, bW, 24);
  ctx.fillStyle = '#1e293b';
  for (let gx = bX + 26; gx < bX + bW - 36; gx += 85) {
    ctx.fillRect(gx, groundY - 16, 26, 10);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(gx, groundY - 16, 26, 10);
    // Vertical iron bars
    ctx.beginPath();
    ctx.moveTo(gx + 9, groundY - 16);
    ctx.lineTo(gx + 9, groundY - 6);
    ctx.moveTo(gx + 17, groundY - 16);
    ctx.lineTo(gx + 17, groundY - 6);
    ctx.stroke();
  }

  // 3. Ashlar Stone Corner Quoins (Alternating corner masonry blocks)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  const quoinH = 22;
  const quoinCount = Math.floor(bH / quoinH);
  for (let q = 0; q < quoinCount; q++) {
    const qy = groundY - (q + 1) * quoinH;
    const isLong = q % 2 === 0;
    const qw = isLong ? 20 : 12;
    // Left corner
    ctx.fillRect(bX, qy, qw, quoinH - 2);
    // Right corner
    ctx.fillRect(bX + bW - qw, qy, qw, quoinH - 2);
  }

  // 4. Storey Separation Beams & Half-Timbering (Colombage)
  const floor2Y = groundY - 145;
  const floor3Y = groundY - 280;

  ctx.strokeStyle = 'rgba(120, 53, 15, 0.32)';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  // Horizontal beam separating ground shop and upper floor
  ctx.moveTo(bX, floor2Y);
  ctx.lineTo(bX + bW, floor2Y);
  if (bH > 460) {
    // 3rd floor beam
    ctx.moveTo(bX, floor3Y);
    ctx.lineTo(bX + bW, floor3Y);
  }
  // Decorative timber cross braces
  ctx.moveTo(bX + 22, floor2Y);
  ctx.lineTo(bX + 48, floor2Y - 50);
  ctx.moveTo(bX + bW - 22, floor2Y);
  ctx.lineTo(bX + bW - 48, floor2Y - 50);
  ctx.stroke();

  // Carved wooden corbels supporting the upper floor overhang
  ctx.fillStyle = '#78350f';
  for (let cx = bX + 20; cx < bX + bW - 20; cx += 65) {
    ctx.beginPath();
    ctx.moveTo(cx, floor2Y);
    ctx.lineTo(cx + 8, floor2Y);
    ctx.lineTo(cx, floor2Y + 12);
    ctx.closePath();
    ctx.fill();
  }

  // 5. Roof Architecture (Mansard, Gable, Steep)
  ctx.fillStyle = building.roofColor;
  ctx.beginPath();
  if (building.roofType === 'gable') {
    ctx.moveTo(bX - 10, bY);
    ctx.lineTo(bX + bW / 2, bY - 58);
    ctx.lineTo(bX + bW + 10, bY);
  } else if (building.roofType === 'mansard') {
    ctx.moveTo(bX - 8, bY);
    ctx.lineTo(bX + 28, bY - 54);
    ctx.lineTo(bX + bW - 28, bY - 54);
    ctx.lineTo(bX + bW + 8, bY);
  } else if (building.roofType === 'steep') {
    ctx.moveTo(bX - 8, bY);
    ctx.lineTo(bX + bW / 2, bY - 82);
    ctx.lineTo(bX + bW + 8, bY);
  } else {
    ctx.moveTo(bX - 10, bY);
    ctx.quadraticCurveTo(bX + bW / 2, bY - 62, bX + bW + 10, bY);
  }
  ctx.closePath();
  ctx.fill();

  // Roof scalloped tile texture lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.16)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(bX + 12, bY - 18);
  ctx.lineTo(bX + bW - 12, bY - 18);
  ctx.moveTo(bX + 28, bY - 36);
  ctx.lineTo(bX + bW - 28, bY - 36);
  ctx.stroke();

  // Dormer window (Lucarne) projecting out of Mansard roofs
  if (building.roofType === 'mansard') {
    const lucarneX = bX + bW * 0.35;
    const lucarneY = bY - 42;
    ctx.fillStyle = building.color;
    ctx.fillRect(lucarneX - 12, lucarneY, 24, 28);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(lucarneX - 12, lucarneY, 24, 28);
    // Arched pediment
    ctx.fillStyle = building.roofColor;
    ctx.beginPath();
    ctx.arc(lucarneX, lucarneY, 13, Math.PI, 0);
    ctx.fill();
    // Warm light glass
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(lucarneX - 8, lucarneY + 4, 16, 20);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(lucarneX - 8, lucarneY + 4, 16, 20);
  }

  // Red brick chimney with terracotta pots and animated curling smoke
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(bX + bW * 0.72, bY - 58, 24, 38);
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(bX + bW * 0.72 - 3, bY - 64, 30, 7);
  // Brick course texture
  ctx.strokeStyle = '#b91c1c';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(bX + bW * 0.72, bY - 44);
  ctx.lineTo(bX + bW * 0.72 + 24, bY - 44);
  ctx.moveTo(bX + bW * 0.72, bY - 32);
  ctx.lineTo(bX + bW * 0.72 + 24, bY - 32);
  ctx.stroke();
  // Terracotta chimney pots
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.arc(bX + bW * 0.72 + 6, bY - 68, 4, 0, Math.PI * 2);
  ctx.arc(bX + bW * 0.72 + 18, bY - 68, 4, 0, Math.PI * 2);
  ctx.fill();

  // If Clocktower: Gothic dial with Roman numerals and brass bells
  if (building.type === 'clocktower') {
    const dialX = bX + bW / 2;
    const dialY = bY + 120;
    const dialR = 36;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(dialX, dialY, dialR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Clock hour markings & hands
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 8px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('XII', dialX, dialY - 24);
    ctx.fillText('III', dialX + 26, dialY + 3);
    ctx.fillText('VI', dialX, dialY + 28);
    ctx.fillText('IX', dialX - 26, dialY + 3);
    // Clock hands
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(dialX, dialY);
    ctx.lineTo(dialX + 16, dialY - 8);
    ctx.moveTo(dialX, dialY);
    ctx.lineTo(dialX - 4, dialY - 18);
    ctx.stroke();
  }

  // 6. Grand Ground Floor Storefront (Height: 145px, Door: 100px, Showcase: 82px)
  const doorW = building.doorWidth || 44;
  const doorH = building.doorHeight || 100;
  const doorRelX = building.doorX ? (building.doorX - building.x) : (bW - 60);
  const doorX = bX + Math.max(12, Math.min(bW - doorW - 12, doorRelX));
  const doorY = groundY - doorH;
  const openProg = building.doorOpenProgress || 0;

  // Door surround casing & fanlight
  ctx.fillStyle = '#78350f';
  ctx.fillRect(doorX - 3, doorY - 18, doorW + 6, doorH + 18);
  // Arched fanlight transom window
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(doorX + doorW / 2, doorY, doorW / 2 - 2, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Interior room darkness & warm light spilling through open doorway!
  ctx.fillStyle = '#1e1b4b'; // deep cozy interior room
  ctx.fillRect(doorX, doorY, doorW, doorH);

  if (openProg > 0) {
    // Warm interior chandelier light spilling onto the sidewalk
    ctx.fillStyle = `rgba(254, 240, 138, ${0.45 * openProg})`;
    ctx.beginPath();
    ctx.moveTo(doorX, doorY + doorH);
    ctx.lineTo(doorX + doorW, doorY + doorH);
    ctx.lineTo(doorX + doorW + 28 * openProg, doorY + doorH + 18 * openProg);
    ctx.lineTo(doorX - 16 * openProg, doorY + doorH + 18 * openProg);
    ctx.closePath();
    ctx.fill();
  }

  // Solid wood French shop entrance door (swings open with 3D perspective!)
  ctx.save();
  ctx.translate(doorX, doorY);
  if (openProg > 0) {
    ctx.transform(Math.max(0.18, Math.cos(openProg * 1.35)), 0, -Math.sin(openProg * 0.35), 1, 0, 0);
  }
  ctx.fillStyle = '#451a03';
  ctx.fillRect(0, 0, doorW, doorH);

  // Molded panels
  ctx.fillStyle = '#78350f';
  ctx.fillRect(4, 6, doorW - 8, 38);
  ctx.fillRect(4, 50, doorW - 8, 42);
  // Brass hardware
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(doorW - 8, 52, 3.5, 0, Math.PI * 2); // brass handle
  ctx.fill();
  ctx.fillRect(6, doorH - 8, doorW - 12, 5); // brass kickplate
  ctx.restore();

  // House number plaque above door
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(doorX + doorW / 2 - 10, doorY - 14, 20, 10);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 7px Fredoka, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('N° 7', doorX + doorW / 2, doorY - 6);

  // Ground level storefront multi-pane display showcase window
  const shopWinX = bX + 18;
  const shopWinY = groundY - 130;
  const shopWinW = bW - 88;
  const shopWinH = 84;
  if (shopWinW > 40) {
    ctx.fillStyle = '#fef3c7'; // warm interior amber glow
    ctx.fillRect(shopWinX, shopWinY, shopWinW, shopWinH);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(shopWinX, shopWinY, shopWinW, shopWinH);

    // Multi-pane dividers
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(shopWinX + shopWinW * 0.33, shopWinY);
    ctx.lineTo(shopWinX + shopWinW * 0.33, shopWinY + shopWinH);
    ctx.moveTo(shopWinX + shopWinW * 0.66, shopWinY);
    ctx.lineTo(shopWinX + shopWinW * 0.66, shopWinY + shopWinH);
    ctx.moveTo(shopWinX, shopWinY + shopWinH * 0.5);
    ctx.lineTo(shopWinX + shopWinW, shopWinY + shopWinH * 0.5);
    ctx.stroke();

    // Display merchandise inside window showcase
    if (building.type === 'bakery') {
      // Tiered brass pastry racks with golden croissants and macarons
      ctx.fillStyle = '#b45309';
      ctx.fillRect(shopWinX + 8, shopWinY + shopWinH - 14, shopWinW - 16, 4);
      ctx.fillRect(shopWinX + 14, shopWinY + shopWinH - 36, shopWinW - 28, 3);
      // Golden croissants
      ctx.fillStyle = '#f59e0b';
      for (let cx = shopWinX + 16; cx < shopWinX + shopWinW - 14; cx += 16) {
        ctx.beginPath();
        ctx.ellipse(cx, shopWinY + shopWinH - 18, 6.5, 4.5, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
      // Colorful macarons on upper shelf
      const macColors = ['#f43f5e', '#a855f7', '#10b981', '#facc15'];
      for (let mx = shopWinX + 20; mx < shopWinX + shopWinW - 22; mx += 14) {
        ctx.fillStyle = macColors[Math.floor((mx - shopWinX) / 14) % macColors.length];
        ctx.beginPath();
        ctx.arc(mx, shopWinY + shopWinH - 40, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (building.type === 'bookshop') {
      // Floor-to-ceiling bookshelves packed with colorful leather volumes
      const bookColors = ['#dc2626', '#16a34a', '#2563eb', '#ca8a04', '#7c3aed'];
      for (let bx = shopWinX + 6; bx < shopWinX + shopWinW - 8; bx += 9) {
        ctx.fillStyle = bookColors[Math.floor((bx - shopWinX) / 9) % bookColors.length];
        ctx.fillRect(bx, shopWinY + shopWinH - 24, 7, 20);
        ctx.fillRect(bx, shopWinY + shopWinH - 52, 7, 22);
      }
    } else if (building.type === 'florist') {
      // Wooden crates of potted lavender, roses, sunflowers
      for (let fx = shopWinX + 12; fx < shopWinX + shopWinW - 12; fx += 20) {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(fx - 6, shopWinY + shopWinH - 14, 12, 12);
        ctx.fillStyle = fx % 40 === 0 ? '#8b5cf6' : '#f43f5e';
        ctx.beginPath();
        ctx.arc(fx, shopWinY + shopWinH - 20, 6.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (building.type === 'cafe') {
      // Bistro marble table, espresso cups & pastry dome
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(shopWinX + shopWinW / 2, shopWinY + shopWinH - 16, 22, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(shopWinX + shopWinW / 2 - 10, shopWinY + shopWinH - 25, 8, 8);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.ellipse(shopWinX + shopWinW / 2 + 6, shopWinY + shopWinH - 21, 6, 4, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Haunt the House style: Citizen inside ground floor shop!
    const groundFloorNPC = npcs?.find(
      (n) => (n.indoorBuildingId === building.id || n.indoorBuildingId === building.signText) && (n.indoorFloor === 0 || !n.indoorFloor)
    );
    if (groundFloorNPC && shopWinW > 40) {
      const gX = shopWinX + shopWinW * 0.48;
      const gY = shopWinY + shopWinH - 6;
      ctx.save();
      // Body
      ctx.fillStyle = groundFloorNPC.coatColor === 'dark' ? '#1e293b' : '#0284c7';
      ctx.fillRect(gX - 10, gY - 32, 20, 24);
      // Head
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(gX, gY - 42, 9, 0, Math.PI * 2);
      ctx.fill();
      // Hair or Hat
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(gX, gY - 45, 9.5, Math.PI, 0);
      ctx.fill();
      // Holding shopping item or tea
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(gX + 7, gY - 24, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // 7. Upper Floor Windows with Louvered Shutters, Balconies, Flower Boxes & Occupants (窗里的人!)
  building.windows.forEach((win) => {
    const wx = bX + win.x;
    const wy = bY + win.y;

    // Stone lintel & sill
    ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
    ctx.fillRect(wx - 3, wy - 4, win.w + 6, 4);
    ctx.fillRect(wx - 4, wy + win.h, win.w + 8, 4);

    // Window opening & warm light
    ctx.fillStyle = win.lit ? '#fef08a' : '#bfdbfe';
    ctx.fillRect(wx, wy, win.w, win.h);

    // Louvered Shutters in charming pastel (Powder blue / Sage green)
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(wx - 11, wy - 1, 9, win.h + 2);
    ctx.fillRect(wx + win.w + 2, wy - 1, 9, win.h + 2);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 0.9;
    ctx.strokeRect(wx - 11, wy - 1, 9, win.h + 2);
    ctx.strokeRect(wx + win.w + 2, wy - 1, 9, win.h + 2);
    // Shutter louvers
    for (let sy = wy + 4; sy < wy + win.h; sy += 6) {
      ctx.beginPath();
      ctx.moveTo(wx - 10, sy);
      ctx.lineTo(wx - 3, sy);
      ctx.moveTo(wx + win.w + 3, sy);
      ctx.lineTo(wx + win.w + 10, sy);
      ctx.stroke();
    }

    // -------------------------------------------------------------
    // 窗里的人 (People visible inside windows!)
    // -------------------------------------------------------------
    const indoorVisitingNpc = npcs?.find(
      (n) =>
        (n.indoorBuildingId === building.id || n.indoorBuildingId === building.signText) &&
        n.indoorFloor === 2
    );
    const occupantType = win.occupant || (indoorVisitingNpc ? 'visiting_citizen' : undefined);

    if (occupantType) {
      const pCenterX = wx + win.w / 2;
      const pBaseY = wy + win.h;

      // 1. Grandpa in spectacles & wool cap reading / tea
      if (occupantType === 'grandpa') {
        // Waistcoat
        ctx.fillStyle = '#78350f';
        ctx.fillRect(pCenterX - 11, pBaseY - 20, 22, 20);
        // Head (Harmonized head radius 10.5px)
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(pCenterX, pBaseY - 28, 10.5, 0, Math.PI * 2);
        ctx.fill();
        // White mustache
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(pCenterX - 5, pBaseY - 26, 10, 3.5);
        // Glasses
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.3;
        ctx.strokeRect(pCenterX - 7, pBaseY - 31, 6, 4.5);
        ctx.strokeRect(pCenterX + 1, pBaseY - 31, 6, 4.5);
        // Wool cap
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.ellipse(pCenterX, pBaseY - 37, 11, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // 2. Cheerful Girl waving both arms!
      else if (win.occupant === 'girl') {
        // Dress
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(pCenterX - 11, pBaseY - 20, 22, 20);
        // Head
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(pCenterX, pBaseY - 28, 10.5, 0, Math.PI * 2);
        ctx.fill();
        // Dark brown hair & pigtails with red bows
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(pCenterX - 9, pBaseY - 30, 4.5, 0, Math.PI * 2);
        ctx.arc(pCenterX + 9, pBaseY - 30, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-pCenterX - 10, pBaseY - 34, 4, 4);
        ctx.fillRect(pCenterX + 7, pBaseY - 34, 4, 4);
        // Waving hands resting on window sill
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(pCenterX - 11, pBaseY - 2, 4, 0, Math.PI * 2);
        ctx.arc(pCenterX + 11, pBaseY - 2, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      // 3. Baker in white chef toque
      else if (win.occupant === 'baker') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(pCenterX - 11, pBaseY - 20, 22, 20);
        // Head
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(pCenterX, pBaseY - 28, 10.5, 0, Math.PI * 2);
        ctx.fill();
        // Tall chef toque hat
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(pCenterX - 8, pBaseY - 44, 16, 16);
        ctx.beginPath();
        ctx.arc(pCenterX, pBaseY - 44, 10, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      // 4. Cat napping on window sill
      else if (win.occupant === 'cat') {
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.ellipse(pCenterX, pBaseY - 8, 13, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pCenterX + 9, pBaseY - 12, 6.5, 0, Math.PI * 2);
        ctx.fill();
        // Ears
        ctx.fillStyle = '#c2410c';
        ctx.beginPath();
        ctx.moveTo(pCenterX + 7, pBaseY - 17);
        ctx.lineTo(pCenterX + 10, pBaseY - 22);
        ctx.lineTo(pCenterX + 13, pBaseY - 17);
        ctx.fill();
      }
      // 5. Reader engrossed in book
      else if (win.occupant === 'reader') {
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(pCenterX - 11, pBaseY - 20, 22, 20);
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(pCenterX, pBaseY - 28, 10.5, 0, Math.PI * 2);
        ctx.fill();
        // Open red book on sill
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(pCenterX - 10, pBaseY - 1);
        ctx.lineTo(pCenterX, pBaseY - 6);
        ctx.lineTo(pCenterX + 10, pBaseY - 1);
        ctx.lineTo(pCenterX + 10, pBaseY - 10);
        ctx.lineTo(pCenterX, pBaseY - 15);
        ctx.lineTo(pCenterX - 10, pBaseY - 10);
        ctx.closePath();
        ctx.fill();
      }
      // 6. Lady watering flowers with brass can
      else if (win.occupant === 'lady') {
        ctx.fillStyle = '#9333ea';
        ctx.fillRect(pCenterX - 11, pBaseY - 20, 22, 20);
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(pCenterX, pBaseY - 28, 10.5, 0, Math.PI * 2);
        ctx.fill();
        // Bonnet
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(pCenterX, pBaseY - 30, 12, Math.PI, 0);
        ctx.fill();
        // Brass watering can
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(pCenterX + 6, pBaseY - 14, 9, 9);
        ctx.beginPath();
        ctx.moveTo(pCenterX + 15, pBaseY - 13);
        ctx.lineTo(pCenterX + 22, pBaseY - 7);
        ctx.stroke();
      }
      // 7. Visiting citizen from Haunt the House autonomous roaming!
      else if (occupantType === 'visiting_citizen' && indoorVisitingNpc) {
        ctx.fillStyle = indoorVisitingNpc.coatColor === 'dark' ? '#1e293b' : '#0284c7';
        ctx.fillRect(pCenterX - 11, pBaseY - 20, 22, 20);
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(pCenterX, pBaseY - 28, 10.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(pCenterX, pBaseY - 32, 11, Math.PI, 0);
        ctx.fill();
        const wave = Math.sin(time * 6) * 3;
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(pCenterX + 9, pBaseY - 14 + wave, 3.8, 0, Math.PI * 2);
        ctx.fill();

        if (indoorVisitingNpc.state === 'startled') {
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(pCenterX + 7, pBaseY - 42, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 9px Fredoka, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('！', pCenterX + 7, pBaseY - 38);
        }
      }
    }

    // Window Panes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.3;
    ctx.strokeRect(wx, wy, win.w, win.h);
    ctx.beginPath();
    ctx.moveTo(wx + win.w / 2, wy);
    ctx.lineTo(wx + win.w / 2, wy + win.h);
    ctx.moveTo(wx, wy + win.h / 2);
    ctx.lineTo(wx + win.w, wy + win.h / 2);
    ctx.stroke();

    // Wrought-iron Parisian balcony railing on 2nd floor windows
    if (building.hasWroughtIronBalcony && wy > groundY - 280) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(wx - 3, wy + win.h - 18, win.w + 6, 18);
      // Railing vertical bars & scrolls
      for (let rx = wx + 2; rx < wx + win.w; rx += 7) {
        ctx.beginPath();
        ctx.moveTo(rx, wy + win.h - 18);
        ctx.lineTo(rx, wy + win.h);
        ctx.stroke();
      }
      // Gold rosette florets on balcony
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(wx + win.w / 2, wy + win.h - 9, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Terracotta Flower Box brimming with red geraniums & ivy
    if (win.flowerBox !== false) {
      ctx.fillStyle = '#b45309';
      ctx.fillRect(wx - 5, wy + win.h + 1, win.w + 10, 8);
      // Ivy leaves
      ctx.fillStyle = '#15803d';
      ctx.fillRect(wx - 3, wy + win.h + 7, 7, 5);
      ctx.fillRect(wx + win.w - 4, wy + win.h + 7, 6, 5);
      // Red Geranium flowers
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(wx + 5, wy + win.h + 2, 3.5, 0, Math.PI * 2);
      ctx.arc(wx + win.w / 2, wy + win.h + 1, 4, 0, Math.PI * 2);
      ctx.arc(wx + win.w - 5, wy + win.h + 2, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // 8. Striped Scalloped Awning for Bakery & Cafe
  if (building.hasAwning) {
    const awningY = groundY - 136;
    const awningH = 34;
    const awningW = bW - 24;
    const stripeCount = 8;
    const stripeW = awningW / stripeCount;
    const stripeColor = building.awningColor || '#dc2626';

    for (let i = 0; i < stripeCount; i++) {
      ctx.fillStyle = i % 2 === 0 ? stripeColor : '#ffffff';
      ctx.beginPath();
      ctx.moveTo(bX + 12 + i * stripeW, awningY);
      ctx.lineTo(bX + 12 + (i + 1) * stripeW, awningY);
      ctx.lineTo(bX + 8 + (i + 1) * stripeW, awningY + awningH);
      ctx.lineTo(bX + 8 + i * stripeW, awningY + awningH);
      ctx.closePath();
      ctx.fill();

      // Scalloped fringe
      ctx.beginPath();
      ctx.arc(bX + 8 + i * stripeW + stripeW / 2, awningY + awningH, stripeW / 2, 0, Math.PI);
      ctx.fill();
    }

    // Carved Merchant Signboard suspended on wrought-iron chains
    if (building.signText) {
      const signX = bX + 22;
      const signY = awningY - 30;
      const signW = bW - 44;
      const signH = 22;

      // Hanging chains
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(signX + 20, signY);
      ctx.lineTo(signX + 20, signY - 8);
      ctx.moveTo(signX + signW - 20, signY);
      ctx.lineTo(signX + signW - 20, signY - 8);
      ctx.stroke();

      // Wood sign board
      ctx.fillStyle = '#78350f';
      ctx.fillRect(signX, signY, signW, signH);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(signX + 2, signY + 2, signW - 4, signH - 4);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(building.signText, bX + bW / 2, signY + 15);
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

// Draw Procedural Scaled Trees (French Plane, Cherry Blossom, Tuscan Cypress, Weeping Willow, Citrus Tree)
export function drawTree(
  ctx: CanvasRenderingContext2D,
  obs: Obstacle,
  groundY: number,
  time: number
) {
  ctx.save();
  ctx.globalAlpha = obs.opacity ?? 1.0;
  ctx.translate(obs.x + obs.width / 2, groundY);

  const variety = obs.treeVariety || 'french_plane';
  const windSway = Math.sin(time * 2.5 + obs.x * 0.05) * 3.5;
  const seed = obs.plantSeed || (Math.abs(Math.floor(obs.x)) % 1000) + 1;

  // 1. CHERRY / APPLE BLOSSOM TREE (粉白樱花与繁花盛开 - 随风飘落落英花瓣)
  if (variety === 'cherry_blossom') {
    // Elegant curved trunk with warm wood grain
    ctx.strokeStyle = '#4a044e';
    ctx.fillStyle = '#3b0764';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(10, -65, 0, -115);
    ctx.stroke();

    // Branch splits
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, -105);
    ctx.quadraticCurveTo(-28, -140, -48, -165);
    ctx.moveTo(0, -105);
    ctx.quadraticCurveTo(26, -140, 44, -165);
    ctx.stroke();

    // Soft clouds of pink and blush-white blossoms with subtle radial depth
    const blossomColors = ['#f472b6', '#fbcfe8', '#fdf2f8', '#fda4af', '#f43f5e'];
    const puffs = [
      { x: -50, y: -170, r: 42, c: 0 },
      { x: 44, y: -170, r: 42, c: 1 },
      { x: 0, y: -210, r: 50, c: 2 },
      { x: -24, y: -188, r: 38, c: 3 },
      { x: 26, y: -188, r: 38, c: 0 },
      { x: 0, y: -160, r: 35, c: 4 },
    ];
    puffs.forEach((p) => {
      ctx.fillStyle = blossomColors[p.c];
      ctx.beginPath();
      ctx.arc(p.x + windSway * 0.8, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      // Delicate blossom petal florets inside cloud
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let f = 0; f < 4; f++) {
        const fa = f * (Math.PI / 2) + 0.3;
        ctx.beginPath();
        ctx.arc(p.x + windSway * 0.8 + Math.cos(fa) * (p.r * 0.45), p.y + Math.sin(fa) * (p.r * 0.45), 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Falling floral petals drifting in wind
    ctx.fillStyle = '#fbcfe8';
    for (let i = 0; i < 9; i++) {
      const petalX = Math.sin(time * 3 + i * 1.3) * 55 + windSway * 2;
      const petalY = -70 - ((time * 40 + i * 35) % 150);
      ctx.beginPath();
      ctx.ellipse(petalX, petalY, 4.5, 2.8, time * 2 + i, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. TUSCAN CYPRESS (托斯卡纳圆锥常青柏树 - 优雅垂直剪影与细腻叶纹)
  else if (variety === 'cypress') {
    ctx.fillStyle = '#3f2e18';
    ctx.fillRect(-7, -26, 14, 26);

    const cypressH = obs.height || 260;
    const cypressW = obs.width || 48;
    const grad = ctx.createLinearGradient(0, -cypressH, 0, 0);
    grad.addColorStop(0, '#14532d');
    grad.addColorStop(0.55, '#166534');
    grad.addColorStop(1, '#052e16');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(0, -cypressH + windSway * 0.4);
    ctx.quadraticCurveTo(cypressW * 0.72, -cypressH * 0.6, cypressW * 0.5, -20);
    ctx.lineTo(-cypressW * 0.5, -20);
    ctx.quadraticCurveTo(-cypressW * 0.72, -cypressH * 0.6, 0, -cypressH + windSway * 0.4);
    ctx.closePath();
    ctx.fill();

    // Dappled foliage needle strokes
    ctx.fillStyle = '#22c55e';
    for (let y = -cypressH + 30; y < -25; y += 16) {
      const rowW = ((y + cypressH) / cypressH) * cypressW * 0.46;
      ctx.beginPath();
      ctx.ellipse((Math.sin(y * 0.8) * rowW * 0.5) + windSway * 0.2, y, 8, 4.8, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 3. WEEPING WILLOW (法式柔美垂柳 - 丝缕随风摇曳)
  else if (variety === 'weeping_willow') {
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-15, -135, 30, 135);

    // Domed crown
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(0, -175, 60, 0, Math.PI * 2);
    ctx.fill();

    // Dangling willow fronds swaying in wind
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    for (let x = -54; x <= 54; x += 11) {
      const strandLen = 95 + Math.sin(x * 0.3) * 24;
      const strandSway = Math.sin(time * 3 + x * 0.1) * 14;
      ctx.beginPath();
      ctx.moveTo(x, -165);
      ctx.quadraticCurveTo(x + strandSway, -165 + strandLen * 0.5, x + strandSway * 1.45, -165 + strandLen);
      ctx.stroke();

      // Leaf droplets on strands
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.arc(x + strandSway * 1.45, -165 + strandLen, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 4. CITRUS / MEDITERRANEAN LEMON TREE (地中海繁花金黄柠檬树)
  else if (variety === 'citrus_tree') {
    // Curved sunlit trunk
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-12, -120, 24, 120);

    // Dense lush emerald crown
    const citrusGreens = ['#166534', '#15803d', '#16a34a', '#22c55e'];
    const crowns = [
      { x: -36, y: -155, r: 44, c: 0 },
      { x: 36, y: -155, r: 44, c: 1 },
      { x: 0, y: -205, r: 54, c: 2 },
      { x: -20, y: -185, r: 38, c: 3 },
      { x: 22, y: -185, r: 38, c: 1 },
    ];
    crowns.forEach((cl) => {
      ctx.fillStyle = citrusGreens[cl.c];
      ctx.beginPath();
      ctx.arc(cl.x + windSway * 0.5, cl.y, cl.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Ripe Golden Lemons hanging among leaves
    const lemons = [
      [-26, -160], [22, -175], [-10, -220], [30, -145], [-32, -130], [12, -195], [0, -150]
    ];
    lemons.forEach(([lx, ly]) => {
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.ellipse(lx + windSway * 0.5, ly, 6.5, 9, 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#15803d'; // green leaf cap
      ctx.beginPath();
      ctx.arc(lx + windSway * 0.5, ly - 7, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // White five-point citrus blossom stars
    ctx.fillStyle = '#ffffff';
    for (let f = 0; f < 6; f++) {
      const fx = Math.sin(f * 2.1 + seed) * 40 + windSway * 0.5;
      const fy = -180 + Math.cos(f * 2.1 + seed) * 35;
      ctx.beginPath();
      ctx.arc(fx, fy, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
    }
  }

  // 5. FRENCH PLANE / LINDEN TREE (法国悬铃木/梧桐 - 广阔斑驳树冠)
  else {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-15, -125, 30, 125);
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-15, -125, 30, 125);

    const greens = ['#15803d', '#16a34a', '#22c55e', '#86efac'];
    const clumps = [
      { x: -40, y: -150, r: 48, c: 0 },
      { x: 40, y: -150, r: 48, c: 1 },
      { x: 0, y: -205, r: 58, c: 2 },
      { x: -26, y: -182, r: 40, c: 3 },
      { x: 28, y: -182, r: 40, c: 1 },
    ];
    clumps.forEach((cl) => {
      ctx.fillStyle = greens[cl.c];
      ctx.beginPath();
      ctx.arc(cl.x + windSway * 0.6, cl.y, cl.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Golden apples or berries scattered in crown
    ctx.fillStyle = obs.flowerColor || '#ef4444';
    const berries = [
      [-30, -160], [24, -175], [-9, -220], [34, -145], [-38, -130], [12, -195]
    ];
    berries.forEach(([bx, by]) => {
      ctx.beginPath();
      ctx.arc(bx + windSway * 0.6, by, 6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  ctx.restore();
}

// Draw Procedural Street Flora & Planters (绣球花坛、薰衣草花槽、攀缘常春藤、陶土花钵、窗台花箱、悬挂花篮)
export function drawProceduralPlant(
  ctx: CanvasRenderingContext2D,
  obs: Obstacle,
  groundY: number,
  time: number
) {
  ctx.save();
  ctx.translate(obs.x + obs.width / 2, groundY);

  const variety = obs.plantVariety || 'planter_hydrangea';
  const windSway = Math.sin(time * 3 + obs.x * 0.1) * 2.5;
  const seed = obs.plantSeed || (Math.abs(Math.floor(obs.x * 3.7)) % 1000) + 1;

  // Helper for pot style fill
  const potStyle = obs.potStyle || (seed % 3 === 0 ? 'stone' : seed % 3 === 1 ? 'terracotta' : 'wooden_crate');

  // 1. HYDRANGEA FLOWERBED (法式绣球花坛 - 饱满团簇蓝粉绣球，程序化混色)
  if (variety === 'planter_hydrangea') {
    // Planter basin
    if (potStyle === 'terracotta') {
      ctx.fillStyle = '#c2410c';
      ctx.beginPath();
      ctx.roundRect(-30, -22, 60, 22, 4);
      ctx.fill();
      ctx.strokeStyle = '#9a3412';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.roundRect(-30, -20, 60, 20, 4);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }

    // Dark green serrated foliage base
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(0, -24, 35, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Procedural Blossom Colors
    const primaryColor = obs.bloomColor || (seed % 2 === 0 ? '#38bdf8' : '#f472b6');
    const secondaryColor = obs.secondaryBloomColor || (seed % 2 === 0 ? '#c084fc' : '#fda4af');

    const blooms = [
      { x: -18, y: -34, r: 16, color: primaryColor },
      { x: 18, y: -34, r: 16, color: secondaryColor },
      { x: 0, y: -44, r: 18, color: seed % 3 === 0 ? '#a855f7' : '#60a5fa' },
    ];
    blooms.forEach((b) => {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x + windSway, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();

      // Flower florets detailing
      ctx.fillStyle = 'rgba(255, 255, 255, 0.48)';
      for (let f = 0; f < 5; f++) {
        const ang = f * ((Math.PI * 2) / 5) + 0.2;
        ctx.beginPath();
        ctx.arc(b.x + windSway + Math.cos(ang) * (b.r * 0.52), b.y + Math.sin(ang) * (b.r * 0.52), 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  // 2. PROVENCE LAVENDER PLANTER (普罗旺斯薰衣草陶罐/木槽)
  else if (variety === 'planter_lavender') {
    ctx.fillStyle = '#c2410c';
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(18, 0);
    ctx.lineTo(22, -26);
    ctx.lineTo(-22, -26);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#9a3412';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Glazed rim
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.roundRect(-25, -30, 50, 6, 2);
    ctx.fill();

    // Purple lavender stalks
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 1.8;
    const stalkCount = 10;
    for (let i = 0; i < stalkCount; i++) {
      const ix = -16 + (i * 32) / (stalkCount - 1);
      const h = 32 + Math.sin(i * 0.7 + seed) * 10;
      const sway = Math.sin(time * 4 + i * 0.6) * 3.5;
      ctx.beginPath();
      ctx.moveTo(ix, -30);
      ctx.lineTo(ix + sway, -30 - h);
      ctx.stroke();

      // Purple flower spike with multi-tier droplets
      ctx.fillStyle = i % 2 === 0 ? '#8b5cf6' : '#a855f7';
      ctx.beginPath();
      ctx.ellipse(ix + sway, -30 - h + 7, 3.5, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(ix + sway, -30 - h + 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 3. WALL CLIMBING IVY (外墙攀援常春藤)
  else if (variety === 'wall_ivy') {
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-18, -50, -6, -100);
    ctx.quadraticCurveTo(18, -150, 6, -200);
    ctx.stroke();

    // Branching side tendrils
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-10, -75);
    ctx.lineTo(-24, -95);
    ctx.moveTo(10, -135);
    ctx.lineTo(26, -155);
    ctx.stroke();

    // Heart-shaped green leaves with subtle shading
    for (let y = -12; y > -200; y -= 16) {
      const lx = Math.sin(y * 0.08 + seed) * 14;
      ctx.fillStyle = y % 32 === 0 ? '#15803d' : '#22c55e';
      ctx.beginPath();
      ctx.arc(lx, y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.arc(lx - 1.5, y - 1.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 4. TERRACOTTA POT WITH CITRUS OR TOPIARY (地中海陶土花钵)
  else if (variety === 'terracotta_pot') {
    // Warm terracotta urn pot
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.lineTo(16, 0);
    ctx.lineTo(20, -28);
    ctx.lineTo(-20, -28);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Urn rim
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.roundRect(-23, -32, 46, 6, 2);
    ctx.fill();

    // Lush topiary sphere
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(0, -48, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(windSway * 0.4, -52, 16, 0, Math.PI * 2);
    ctx.fill();

    // Sunny yellow lemons in pot
    const potFruits = [[-8, -48], [8, -50], [0, -60], [-5, -38], [7, -40]];
    potFruits.forEach(([fx, fy]) => {
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.ellipse(fx + windSway * 0.4, fy, 4, 5.5, 0.2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // 5. WINDOW BOX / BALCONY PLANTER (窗台花箱 - 繁花垂挂)
  else if (variety === 'window_box') {
    // Wooden trough
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-22, -18, 44, 18);
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-22, -18, 44, 18);

    // Trailing ivy tendrils over the edge
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(-14, -6, 6, 0, Math.PI * 2);
    ctx.arc(14, -6, 6, 0, Math.PI * 2);
    ctx.arc(0, -8, 7, 0, Math.PI * 2);
    ctx.fill();

    // Vibrant Red and Pink Geraniums
    const flowerColors = ['#ef4444', '#f43f5e', '#ec4899', '#facc15'];
    for (let i = 0; i < 6; i++) {
      const fx = -16 + (i * 32) / 5 + windSway * 0.4;
      const fy = -22 + Math.sin(i * 1.5) * 4;
      ctx.fillStyle = flowerColors[i % flowerColors.length];
      ctx.beginPath();
      ctx.arc(fx, fy, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 6. HANGING STREET BASKET (悬挂繁花吊篮)
  else if (variety === 'hanging_basket') {
    // Dark wrought iron basket bowl
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, -10, 16, 0, Math.PI);
    ctx.fill();

    // Blossoms overflowing from basket
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(-8, -14, 9, 0, Math.PI * 2);
    ctx.arc(8, -14, 9, 0, Math.PI * 2);
    ctx.arc(0, -18, 10, 0, Math.PI * 2);
    ctx.fill();

    // Cascading trailing petunias
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, -8);
    ctx.quadraticCurveTo(-10 + windSway, 0, -8 + windSway * 1.5, 12);
    ctx.moveTo(6, -8);
    ctx.quadraticCurveTo(10 + windSway, 0, 8 + windSway * 1.5, 12);
    ctx.stroke();

    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(-8 + windSway * 1.5, 12, 3.5, 0, Math.PI * 2);
    ctx.arc(8 + windSway * 1.5, 12, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 7. FLOWERING ROSE SHRUB (精致修剪月季花灌木 - Default)
  else {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-20, -20, 40, 20);
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-20, -20, 40, 20);

    // Bush sphere
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(0, -36, 25, 0, Math.PI * 2);
    ctx.fill();

    // Multi-shade roses
    const flowerHex = obs.bloomColor || '#ef4444';
    const roses = [
      { x: -12, y: -42, c: flowerHex },
      { x: 12, y: -42, c: flowerHex },
      { x: 0, y: -48, c: '#facc15' },
      { x: -7, y: -28, c: '#f43f5e' },
      { x: 9, y: -28, c: '#f59e0b' },
      { x: 0, y: -34, c: flowerHex },
    ];
    roses.forEach((r) => {
      ctx.fillStyle = r.c;
      ctx.beginPath();
      ctx.arc(r.x + windSway * 0.5, r.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(r.x + windSway * 0.5, r.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

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
  if (npc.indoorBuildingId) return; // Currently inside a building! Rendered inside the window/shop!

  ctx.save();
  ctx.translate(npc.x, groundY);
  ctx.scale(1.0, 1.0); // Harmonized human scale matching houses and street vehicles!

  const isStartled = npc.state === 'startled';
  const isWalking = npc.state === 'walking';
  const walkCycle = isWalking ? Math.sin(time * 10) * 6 : 0;

  // 1. Grandpa on park bench (with breadcrumbs & hopping sparrows!)
  if (npc.type === 'grandpa_bench') {
    // Bench
    ctx.fillStyle = '#166534'; // Parisian green park bench
    ctx.fillRect(-18, -42, 36, 30);
    ctx.fillStyle = '#14532d';
    ctx.fillRect(-18, -34, 36, 4);
    ctx.fillRect(-18, -22, 36, 4);

    // Grandpa body
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-10, -52, 20, 26);
    // Face & mustache
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -64, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(-4, -62, 4.5, 0, Math.PI * 2);
    ctx.arc(4, -62, 4.5, 0, Math.PI * 2);
    ctx.fill();
    // Tweed flat cap
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.ellipse(0, -74, 15, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    // Cane in hand
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(12, -42);
    ctx.lineTo(12, -2);
    ctx.stroke();

    // Breadcrumbs on cobblestones
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(20, -3, 3, 2);
    ctx.fillRect(26, -4, 2.5, 2);
    ctx.fillRect(32, -3, 3, 2);

    // Hopping Plump European Sparrow pecking crumbs! (Harmonious with flock & crow)
    const sparrowHop = Math.abs(Math.sin(time * 8)) * 5;
    ctx.save();
    ctx.translate(34, -8 - sparrowHop);
    // Plump body
    ctx.fillStyle = '#9a5624';
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 7.5, 0.15, 0, Math.PI * 2);
    ctx.fill();
    // Pale buff breast
    ctx.fillStyle = '#f5e8d3';
    ctx.beginPath();
    ctx.ellipse(3, 1, 7, 5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // Head with warm cap
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(7, -4, 6.5, 0, Math.PI * 2);
    ctx.fill();
    // Beak
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(12, -5);
    ctx.lineTo(17, -3.5);
    ctx.lineTo(12, -2);
    ctx.closePath();
    ctx.fill();
    // Eye
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(8.5, -5, 1.8, 0, Math.PI * 2);
    ctx.fill();
    // Wing with cream wing bar
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.ellipse(-2, -1, 7.5, 4.5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-5, -2);
    ctx.lineTo(2, -1);
    ctx.stroke();
    ctx.restore();
  }

  // 2. Street Artist / Painter at Easel (French Beret & Palette)
  else if (npc.type === 'street_artist') {
    // Legs walking or standing
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-8 + walkCycle, -24, 7, 24);
    ctx.fillRect(2 - walkCycle, -24, 7, 24);

    // Blue Painter's Smock & Red Scarf
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-12, -58, 24, 34);
    ctx.fillStyle = '#ef4444'; // red scarf
    ctx.fillRect(-8, -58, 16, 6);

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -68, 12, 0, Math.PI * 2);
    ctx.fill();

    // Classic French Navy Beret
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(0, -78, 16, 6, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-1, -85, 2, 4); // beret stalk

    // Wooden Painter's Palette in left hand
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(-14, -46, 9, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // Paint daubs on palette
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-17, -47, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(-14, -49, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(-11, -47, 2, 0, Math.PI * 2);
    ctx.fill();

    // Paintbrush in right hand
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(8, -48);
    ctx.lineTo(18, -54);
    ctx.stroke();

    // Wooden Tripod Easel with Canvas!
    ctx.save();
    ctx.translate(22, 0);
    // Tripod legs
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, -72);
    ctx.lineTo(-12, 0);
    ctx.moveTo(0, -72);
    ctx.lineTo(12, 0);
    ctx.moveTo(0, -72);
    ctx.lineTo(0, 0);
    ctx.stroke();
    // Canvas board
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-10, -68, 20, 24);
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-10, -68, 20, 24);
    // Miniature Landscape Oil Painting on Canvas!
    ctx.fillStyle = '#38bdf8'; // sky
    ctx.fillRect(-8, -66, 16, 10);
    ctx.fillStyle = '#22c55e'; // green hill
    ctx.beginPath();
    ctx.arc(0, -54, 8, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#facc15'; // sun
    ctx.beginPath();
    ctx.arc(4, -62, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 3. Cafe Waiter balancing Silver Tray with Steaming Coffee & Croissant
  else if (npc.type === 'cafe_waiter') {
    // Brisk walking black trousers
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-8 + walkCycle, -24, 7, 24);
    ctx.fillRect(2 - walkCycle, -24, 7, 24);

    // Black Waistcoat & White Shirt with Black Bowtie
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-12, -58, 24, 34);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-12, -54, 8, 30);
    ctx.fillRect(4, -54, 8, 30);
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(-3, -56, 3, 2, -0.3, 0, Math.PI * 2);
    ctx.ellipse(3, -56, 3, 2, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Crisp White Bistro Apron
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-10, -38, 20, 26);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(-10, -38, 20, 26);

    // Head with styled hair
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -68, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(0, -74, 12, Math.PI, 0);
    ctx.fill();

    // Right arm holding aloft a polished silver round tray!
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(10, -48);
    ctx.lineTo(16, -62);
    ctx.stroke();

    // Polished Silver Tray
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.ellipse(18, -63, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // White porcelain coffee cup with curling steam
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, -73, 8, 9);
    ctx.fillStyle = '#78350f'; // coffee
    ctx.beginPath();
    ctx.ellipse(16, -73, 4, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Curling steam
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    const steamWobble = Math.sin(time * 6) * 2;
    ctx.moveTo(16, -75);
    ctx.quadraticCurveTo(14 + steamWobble, -80, 16, -85);
    ctx.stroke();

    // Flaky Croissant on Tray!
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(24, -66, 5, 3, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Street Accordionist with Bellows & Floating Musical Notes
  else if (npc.type === 'accordionist') {
    // Legs
    ctx.fillStyle = '#334155';
    ctx.fillRect(-8 + walkCycle, -24, 7, 24);
    ctx.fillRect(2 - walkCycle, -24, 7, 24);

    // Warm Mustard Cardigan & Checked Trousers
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-12, -56, 24, 32);

    // Head with French Cap
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -68, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(0, -78, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Red Accordion with Expanding/Contracting Bellows!
    const bellows = Math.sin(time * 7) * 4;
    // Left bass box
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-18 - bellows, -54, 8, 24);
    // Right treble keyboard
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(10 + bellows, -54, 8, 24);
    ctx.fillStyle = '#ffffff'; // piano keys
    ctx.fillRect(10 + bellows, -52, 6, 20);
    // Pleated white bellows
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let bx = -10 - bellows; bx < 10 + bellows; bx += 3.5) {
      ctx.moveTo(bx, -54);
      ctx.lineTo(bx + 1.5, -42);
      ctx.lineTo(bx, -30);
    }
    ctx.stroke();

    // Floating Colorful Musical Notes (♪ ♫ ♩) soaring into air!
    const noteBob1 = (time * 2) % 3;
    const noteBob2 = (time * 2 + 1.5) % 3;
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px Fredoka, sans-serif';
    ctx.fillText('♪', 14 + Math.sin(time * 3) * 6, -82 - noteBob1 * 18);
    ctx.fillStyle = '#f43f5e';
    ctx.fillText('♫', -14 + Math.cos(time * 3) * 6, -85 - noteBob2 * 18);
  }

  // 5. Dog Walker with cute Trotting Dachshund on Leash!
  else if (npc.type === 'dog_walker') {
    // Elegant Citizen in camel coat
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-8 + walkCycle, -24, 7, 24);
    ctx.fillRect(2 - walkCycle, -24, 7, 24);

    ctx.fillStyle = '#ca8a04'; // camel trench coat
    ctx.fillRect(-12, -58, 24, 34);

    // Head & Burgundy Hat
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -68, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#831843';
    ctx.beginPath();
    ctx.ellipse(0, -78, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Leash stretching down from hand
    const dogX = 28;
    const dogY = -12;
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(8, -45);
    ctx.quadraticCurveTo(16, -20, dogX, dogY - 8);
    ctx.stroke();

    // Cute Little Dachshund Sausage Dog!
    ctx.save();
    ctx.translate(dogX, 0);
    // Dog body
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(-4, -16, 20, 10, 4);
    ctx.fill();
    // Dog head & floppy ears
    ctx.beginPath();
    ctx.arc(16, -15, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#451a03'; // ear
    ctx.beginPath();
    ctx.ellipse(14, -13, 3, 6, 0.4, 0, Math.PI * 2);
    ctx.fill();
    // Snout
    ctx.fillStyle = '#451a03';
    ctx.fillRect(20, -14, 4, 3);
    // Red collar
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(13, -17, 3, 8);
    // Short stubby stepping legs
    const dogStep = Math.sin(time * 14) * 3;
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-1, -7);
    ctx.lineTo(-1 + dogStep, 0);
    ctx.moveTo(5, -7);
    ctx.lineTo(5 - dogStep, 0);
    ctx.moveTo(12, -7);
    ctx.lineTo(12 + dogStep, 0);
    ctx.moveTo(16, -7);
    ctx.lineTo(16 - dogStep, 0);
    ctx.stroke();
    // Perky tail wagging
    const tailWag = Math.sin(time * 18) * 4;
    ctx.beginPath();
    ctx.moveTo(-4, -14);
    ctx.lineTo(-9, -18 + tailWag);
    ctx.stroke();
    ctx.restore();
  }

  // 6. Child Running Joyfully with Big Red Helium Balloon!
  else if (npc.type === 'balloon_child') {
    const kidCycle = Math.sin(time * 14) * 8; // energetic run!
    // Shorts & little legs
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-6 + kidCycle, -18, 5, 18);
    ctx.fillRect(2 - kidCycle, -18, 5, 18);

    // Striped T-shirt
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-10, -46, 20, 28);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-10, -42, 20, 4);
    ctx.fillRect(-10, -32, 20, 4);

    // Head with cap
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -56, 10, 0, Math.PI * 2);
    ctx.fill();
    // Backwards baseball cap
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, -60, 10, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(-12, -61, 6, 3); // visor facing back

    // Raised arm holding balloon string
    ctx.strokeStyle = '#fed7aa';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(6, -38);
    ctx.lineTo(12, -54);
    ctx.stroke();

    // Floating Red Balloon on string!
    const balloonSway = Math.sin(time * 5) * 5;
    const balloonX = 14 + balloonSway;
    const balloonY = -92;
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.8)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(12, -54);
    ctx.quadraticCurveTo(10, -70, balloonX, balloonY + 12);
    ctx.stroke();
    // Balloon body
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.ellipse(balloonX, balloonY, 11, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    // Glossy reflection highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.ellipse(balloonX - 3.5, balloonY - 4, 3, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // Knot
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(balloonX - 2, balloonY + 13);
    ctx.lineTo(balloonX + 2, balloonY + 13);
    ctx.lineTo(balloonX, balloonY + 16);
    ctx.fill();
  }

  // 7. Town Policeman / Gendarme on Patrol with Whistle
  else if (npc.type === 'policeman') {
    // Navy Uniform Trousers
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(-8 + walkCycle, -24, 7, 24);
    ctx.fillRect(2 - walkCycle, -24, 7, 24);

    // Double-breasted Navy Tunic with Shiny Brass Buttons
    ctx.fillStyle = '#172554';
    ctx.fillRect(-12, -58, 24, 34);
    ctx.fillStyle = '#facc15'; // brass buttons
    ctx.beginPath();
    ctx.arc(-4, -50, 1.8, 0, Math.PI * 2);
    ctx.arc(4, -50, 1.8, 0, Math.PI * 2);
    ctx.arc(-4, -42, 1.8, 0, Math.PI * 2);
    ctx.arc(4, -42, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Head & Mustache
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -68, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-4, -66, 8, 3); // handlebar mustache

    // French Gendarme Kepi Hat
    ctx.fillStyle = '#172554';
    ctx.fillRect(-9, -82, 18, 10);
    ctx.fillStyle = '#facc15'; // gold braid
    ctx.fillRect(-9, -74, 18, 2);
    ctx.fillStyle = '#0f172a'; // black leather visor
    ctx.beginPath();
    ctx.arc(0, -72, 11, 0, Math.PI);
    ctx.fill();

    // Twirling whistle on silver cord
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(6, -56);
    ctx.lineTo(12, -44);
    ctx.stroke();
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(10, -44, 4, 3);
  }

  // 8. Baker on Street with Steaming Wooden Peel of Croissants
  else if (npc.type === 'baker_street') {
    // Checked Trousers
    ctx.fillStyle = '#475569';
    ctx.fillRect(-8 + walkCycle, -24, 7, 24);
    ctx.fillRect(2 - walkCycle, -24, 7, 24);

    // Double-breasted White Chef Jacket & Red Kerchief
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-12, -58, 24, 34);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-6, -58, 12, 4);

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -68, 12, 0, Math.PI * 2);
    ctx.fill();

    // Tall White Chef Toque
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-8, -88, 16, 16);
    ctx.beginPath();
    ctx.arc(0, -88, 10, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Wooden Baker's Peel held horizontally loaded with croissants!
    ctx.fillStyle = '#b45309';
    ctx.fillRect(4, -46, 26, 4);
    ctx.fillRect(22, -50, 18, 12);
    // Golden Croissants on peel!
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(28, -52, 5, 3.5, 0.2, 0, Math.PI * 2);
    ctx.ellipse(35, -52, 5, 3.5, -0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 9. Lady Shopper with Wicker Basket, Baguette & Sunflowers
  else if (npc.type === 'lady_shopper') {
    // Flowing Teal Skirt
    ctx.fillStyle = '#0f766e';
    ctx.beginPath();
    ctx.moveTo(-14, -22);
    ctx.lineTo(14, -22);
    ctx.lineTo(8, -56);
    ctx.lineTo(-8, -56);
    ctx.closePath();
    ctx.fill();

    // Soft Cream Cardigan
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(-10, -56, 20, 24);

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -68, 12, 0, Math.PI * 2);
    ctx.fill();

    // Straw Boater Hat with Blue Ribbon
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(0, -78, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-9, -84, 18, 7);
    ctx.fillStyle = '#0284c7'; // blue ribbon
    ctx.fillRect(-9, -79, 18, 3);

    // Wicker Shopping Basket on arm
    ctx.fillStyle = '#b45309';
    ctx.fillRect(8, -42, 14, 12);
    ctx.strokeStyle = '#78350f';
    ctx.strokeRect(8, -42, 14, 12);
    // French golden baguette poking out
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(13, -50, 3, 10, 0.35, 0, Math.PI * 2);
    ctx.fill();
    // Sunflowers
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(18, -46, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(18, -46, 2, 0, Math.PI * 2);
    ctx.fill();
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

  // Emergent Speech / Social Dialogue Bubble
  if (npc.speechText) {
    ctx.save();
    ctx.font = 'bold 9.5px Fredoka, sans-serif';
    const textW = ctx.measureText(npc.speechText).width;
    const bW = textW + 16;
    const bH = 20;
    const bubbleY = -118;

    // Soft bubble shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.beginPath();
    ctx.roundRect(-bW / 2 + 1, bubbleY - bH + 2, bW, bH, 6);
    ctx.fill();

    // Bubble body
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(-bW / 2, bubbleY - bH, bW, bH, 6);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Little downward arrow / pointer
    ctx.beginPath();
    ctx.moveTo(-4, bubbleY);
    ctx.lineTo(0, bubbleY + 5);
    ctx.lineTo(4, bubbleY);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();

    // Text content
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.fillText(npc.speechText, 0, bubbleY - 6);
    ctx.restore();
  }

  // Camera Flash Snapshot Animation
  if (npc.cameraFlashTimer && npc.cameraFlashTimer > 0) {
    ctx.save();
    ctx.translate(14, -68);
    const flashSize = 14 + (npc.cameraFlashTimer % 6) * 3;
    ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
    ctx.beginPath();
    ctx.arc(0, 0, flashSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-flashSize * 1.5, 0);
    ctx.lineTo(flashSize * 1.5, 0);
    ctx.moveTo(0, -flashSize * 1.5);
    ctx.lineTo(0, flashSize * 1.5);
    ctx.stroke();
    ctx.restore();
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

// Draw Emergent Town Sparrows (小镇麻雀群自主行为渲染 - 尺寸协调饱满，告别微型昆虫感)
export function drawTownSparrow(
  ctx: CanvasRenderingContext2D,
  sparrow: TownSparrow,
  time: number
) {
  ctx.save();
  ctx.translate(sparrow.x, sparrow.y);
  if (sparrow.facing === -1) {
    ctx.scale(-1, 1);
  }

  // Plump body with soft brownish-buff feather colors (Harmonious ~36px scale)
  const isFlying = sparrow.state === 'flying' || sparrow.state === 'descending';
  const wingCycle = isFlying ? Math.sin(time * 24 + sparrow.wingPhase) : 0;
  const peckDip = sparrow.state === 'pecking' ? Math.sin(time * 12) * 2.5 : 0;

  if (isFlying) {
    const bankAngle = Math.max(-0.35, Math.min(0.35, (sparrow.vy || 0) * 0.08));
    ctx.rotate(bankAngle);
  }

  // Soft shadow on ground or perch
  if (!isFlying) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 13, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Chirp musical notes floating up when perched or happy
  if (sparrow.chirpTimer && sparrow.chirpTimer > 0) {
    ctx.save();
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 9px Fredoka, sans-serif';
    ctx.fillText('♪', 14, -20 - (40 - sparrow.chirpTimer) * 0.35);
    ctx.restore();
  }

  // Tail feathers
  ctx.fillStyle = '#5c2b0c';
  ctx.beginPath();
  ctx.moveTo(-8, -6 + peckDip);
  ctx.lineTo(-19, -11 + peckDip * 0.5);
  ctx.lineTo(-18, -4 + peckDip * 0.5);
  ctx.closePath();
  ctx.fill();

  // Round plump body
  ctx.fillStyle = '#9a5624';
  ctx.beginPath();
  ctx.ellipse(0, -7 + peckDip, 13.5, 9.5, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Pale buff chest/belly
  ctx.fillStyle = '#f5e8d3';
  ctx.beginPath();
  ctx.ellipse(4, -5 + peckDip, 9, 7, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Head with warm chestnut crown
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(8.5, -11 + peckDip * 1.5, 8, 0, Math.PI * 2);
  ctx.fill();

  // Cute golden-amber beak
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(15, -12.5 + peckDip * 1.5);
  ctx.lineTo(22, -10.5 + peckDip * 1.5);
  ctx.lineTo(15, -8.5 + peckDip * 1.5);
  ctx.closePath();
  ctx.fill();

  // Crisp black shiny eye with specular glint
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(10.5, -12.5 + peckDip * 1.5, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(11.2, -13.2 + peckDip * 1.5, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Wing (flapping if flying, tucked folded with double wing bars if perched or pecking)
  ctx.fillStyle = '#451a03';
  if (isFlying) {
    ctx.save();
    ctx.translate(-1, -9);
    ctx.rotate(wingCycle * 0.9);
    ctx.beginPath();
    ctx.ellipse(0, -7, 6.5, 14, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();
  } else {
    ctx.beginPath();
    ctx.ellipse(-1, -8 + peckDip, 9.5, 6, -0.2, 0, Math.PI * 2);
    ctx.fill();
    // Double cream wing bar detailing
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-5, -9 + peckDip);
    ctx.lineTo(4, -8 + peckDip);
    ctx.moveTo(-4, -6 + peckDip);
    ctx.lineTo(3, -5 + peckDip);
    ctx.stroke();
  }

  // Little bird legs when on ground or perched
  if (!isFlying) {
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-3, 1);
    ctx.lineTo(-4, 5);
    ctx.lineTo(-7, 5.5);
    ctx.moveTo(3, 1);
    ctx.lineTo(2, 5);
    ctx.lineTo(-1, 5.5);
    ctx.stroke();
  }

  ctx.restore();
}

// Draw Dropped Physics Loot (抛物线弹跳与地面驻留掉落物)
export function drawDroppedPhysicsItem(
  ctx: CanvasRenderingContext2D,
  item: DroppedPhysicsItem,
  time: number
) {
  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.rotate(item.rotation);

  // Ground contact shadow
  if (item.onGround) {
    ctx.save();
    ctx.rotate(-item.rotation);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 8, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Golden sparkle glint
  const pulse = Math.sin(time * 6 + item.x) * 0.25 + 0.75;
  ctx.save();
  ctx.strokeStyle = `rgba(254, 240, 138, ${pulse})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Render loot icon / graphic using standard configs
  const config = item.config;
  ctx.font = '22px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(config.icon || '✨', 0, 0);

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

  // Windshield Wiper Animation (when splattered by poop or cleaning)
  if (veh.wiperTimer && veh.wiperTimer > 0) {
    const wiperAngle = Math.sin((veh.wiperPhase || 0) * 8) * 0.8;
    const windshieldX = w / 2 - 28;
    const windshieldY = -h + 20;
    ctx.save();
    ctx.translate(windshieldX, windshieldY);
    ctx.rotate(wiperAngle);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -16);
    ctx.stroke();
    // Wiper blade rubber line
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-3, -16);
    ctx.lineTo(3, -16);
    ctx.stroke();
    // Water spray mist
    ctx.fillStyle = 'rgba(224, 242, 254, 0.7)';
    ctx.beginPath();
    ctx.arc(0, -10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Rear Brake Lights Glow (Red alert when braking/yielding)
  if (veh.isBraking) {
    ctx.save();
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(-w / 2 + 3, -16, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Courteous Yield Indicator Bubble
  if (veh.yieldReason) {
    ctx.save();
    ctx.font = 'bold 9px Fredoka, sans-serif';
    const text = veh.yieldReason;
    const textW = ctx.measureText(text).width;
    const bW = textW + 14;
    const bY = -h - 18;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.beginPath();
    ctx.roundRect(-bW / 2, bY, bW, 16, 4);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.fillText(text, 0, bY + 11.5);
    ctx.restore();
  }

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

  // Harmonious Bird Scale (Heroic presence without monster gigantism)
  ctx.scale(1.0, 1.0);

  // Invincibility aura
  if (isInvincible) {
    ctx.save();
    ctx.strokeStyle = `rgba(251, 191, 36, ${0.5 + Math.sin(time * 15) * 0.4})`;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Bird Legs when Perched / Standing!
  if (isPerched) {
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-5, 9);
    ctx.lineTo(-7, 18);
    ctx.lineTo(-11, 19);
    ctx.moveTo(5, 9);
    ctx.lineTo(3, 18);
    ctx.lineTo(-1, 19);
    ctx.stroke();
  }

  // Bird Body
  ctx.fillStyle = bird.color;

  // Tail feathers (Harmonious sleek length)
  ctx.beginPath();
  ctx.moveTo(-12, 0);
  ctx.lineTo(-24, -4);
  ctx.lineTo(-22, 2);
  ctx.lineTo(-24, 7);
  ctx.lineTo(-12, 5);
  ctx.closePath();
  ctx.fill();

  // Plump body (Harmonious ~55px hero scale, balanced with 36px sparrows & 92px humans)
  ctx.beginPath();
  ctx.ellipse(0, 0, 17.5, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wings (Snappier, faster flap cycles!)
  const wingFlap = isPerched ? 0 : Math.sin(player.wingPhase);
  ctx.save();
  ctx.fillStyle = bird.color === '#f8fafc' ? '#e2e8f0' : '#0f172a';

  if (isPerched) {
    // Folded wings resting on side
    ctx.beginPath();
    ctx.ellipse(0, 0, 13.5, 7, -0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (player.state === 'DIVING') {
    // Tucked back aerodynamics
    ctx.beginPath();
    ctx.moveTo(-4, -2);
    ctx.lineTo(-20, -11);
    ctx.lineTo(-11, 2);
    ctx.closePath();
    ctx.fill();
  } else {
    // Flapping snappily
    ctx.beginPath();
    ctx.moveTo(-2, -4);
    ctx.quadraticCurveTo(0, -19 * wingFlap - 4, 14, -12 * wingFlap - 2);
    ctx.quadraticCurveTo(3, 2, -2, 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Head
  ctx.fillStyle = bird.color;
  ctx.beginPath();
  ctx.arc(10.5, -4, 9.5, 0, Math.PI * 2);
  ctx.fill();

  // Large Naif Eye
  ctx.fillStyle = bird.eyeColor;
  ctx.beginPath();
  ctx.arc(12, -6, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.1;
  ctx.stroke();

  if (isStunned || player.state === 'TUMBLING') {
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    // Dizzy spiral / cross eyes
    ctx.arc(12, -6, 3, time * 12, time * 12 + Math.PI * 1.5);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    const pupilSize = player.state === 'DIVING' ? 2.4 : 1.8;
    ctx.arc(13, -6, pupilSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(13.8, -6.8, 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Exhausted Sweat Drops & Panting Tongue
  if (player.isExhausted) {
    // Comic blue sweat drop flying off forehead
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(10, -18 + Math.sin(time * 12) * 2, 2.5, 4.5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Panting little pink tongue
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(25, 2, 3, 0, Math.PI);
    ctx.fill();
  }

  // Sharp Beak
  ctx.fillStyle = bird.beakColor;
  ctx.beginPath();
  const beakOpen = player.state === 'DIVING' ? 2.5 : 0;
  ctx.moveTo(19, -9);
  ctx.lineTo(33, -4);
  ctx.lineTo(20, 2 + beakOpen);
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
