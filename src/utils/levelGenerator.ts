import {
  ActiveLoot,
  BackgroundBuilding,
  Cloud,
  Obstacle,
  TownBuilding,
  TownNPC,
  TownTrafficVehicle,
} from '../types/game';

const CITIZEN_NAMES = [
  '面包师马塞尔',
  '贝阿特丽丝夫人',
  '小裁缝卢卡',
  '邮差安托万',
  '画家克洛伊',
  '皮埃尔大叔',
  '花店姑娘艾米丽',
  '咖啡师朱利安',
  '学者奥古斯特',
  '书商巴斯蒂安',
  '提琴手加布里埃尔',
  '散步的塞莱斯特',
  '钟表匠亨利',
  '小厨娘克拉拉',
  '园艺师热罗姆',
  '优雅的莫妮卡',
];

const BUILDING_COLORS = [
  { color: '#fde68a', isDark: false }, // warm cream
  { color: '#fed7aa', isDark: false }, // peach
  { color: '#fecdd3', isDark: false }, // soft rose
  { color: '#334155', isDark: true },  // dark slate
  { color: '#1e293b', isDark: true },  // midnight navy
  { color: '#dcfce7', isDark: false }, // mint green
  { color: '#78350f', isDark: true },  // deep timber
  { color: '#fef9c3', isDark: false }, // buttercup
];

const ROOF_COLORS = ['#b91c1c', '#c2410c', '#1e293b', '#4d7c0f', '#0369a1', '#854d0e'];

const BG_PALETTES = [
  { color: '#bfdbfe', roof: '#1e3a8a' }, // French slate blue
  { color: '#fef08a', roof: '#b91c1c' }, // warm cream & terracotta
  { color: '#fed7aa', roof: '#475569' }, // peach & slate
  { color: '#fecdd3', roof: '#1e293b' }, // dusty rose & navy
  { color: '#d1fae5', roof: '#0369a1' }, // mint & cobalt
  { color: '#e2e8f0', roof: '#c2410c' }, // soft stone & copper
  { color: '#e9d5ff', roof: '#334155' }, // lavender & slate
];

export const SANDBOX_MAP_WIDTH = 4400; // Finite Sandbox map bounds: 0 to 4400px

export interface TownSandboxMap {
  mapWidth: number;
  backgroundBuildings: BackgroundBuilding[];
  buildings: TownBuilding[];
  lootItems: ActiveLoot[];
  obstacles: Obstacle[];
  npcs: TownNPC[];
  clouds: Cloud[];
  mailboxPos: { x: number; y: number };
  trafficVehicles: TownTrafficVehicle[];
}

export function generateSandboxTown(groundY: number): TownSandboxMap {
  const backgroundBuildings: BackgroundBuilding[] = [];
  const buildings: TownBuilding[] = [];
  const lootItems: ActiveLoot[] = [];
  const obstacles: Obstacle[] = [];
  const npcs: TownNPC[] = [];
  const clouds: Cloud[] = [];
  let npcNameIdx = 0;

  // 1. Procedural Clouds in the Sky
  for (let i = 0; i < 18; i++) {
    clouds.push({
      x: Math.random() * SANDBOX_MAP_WIDTH,
      y: 40 + Math.random() * 120,
      speed: 0.15 + Math.random() * 0.25,
      scale: 0.8 + Math.random() * 0.7,
      opacity: 0.65 + Math.random() * 0.3,
      type: Math.floor(Math.random() * 3),
    });
  }

  // 2. Procedural Background Skyline (Amelicart "Ville de Pokapoka" Style - Dual Depth Layers)
  // Far Layer (Soft distant spires, windmills, clock towers, rolling rooftops)
  let farX = -150;
  while (farX < SANDBOX_MAP_WIDTH + 300) {
    const farW = 200 + Math.floor(Math.random() * 120);
    const farH = 340 + Math.floor(Math.random() * 140);
    const pal = BG_PALETTES[Math.floor(Math.random() * BG_PALETTES.length)];
    const roll = Math.random();
    const roofType: BackgroundBuilding['roofType'] =
      roll < 0.4 ? 'spire' : roll < 0.7 ? 'steeple' : 'mansard';
    const feature: BackgroundBuilding['feature'] =
      roll < 0.2 ? 'windmill' : roll < 0.45 ? 'church_cross' : roll < 0.65 ? 'clock_belfry' : undefined;

    backgroundBuildings.push({
      x: farX,
      width: farW,
      height: farH,
      color: pal.color,
      roofColor: pal.roof,
      roofType,
      dormers: [],
      chimney: Math.random() > 0.4 ? { x: farW * 0.7, height: 45, hasSmoke: true } : undefined,
      layer: 'far',
      feature,
    });
    farX += farW - 30;
  }

  // Mid Layer (Dense townhouses, half-timbered facades, dormer attics, puffing chimneys)
  let bgX = -120;
  while (bgX < SANDBOX_MAP_WIDTH + 260) {
    const bgW = 180 + Math.floor(Math.random() * 80);
    const bgH = 310 + Math.floor(Math.random() * 110);
    const pal = BG_PALETTES[Math.floor(Math.random() * BG_PALETTES.length)];
    const roll = Math.random();
    const roofType: BackgroundBuilding['roofType'] =
      roll < 0.45 ? 'mansard' : roll < 0.8 ? 'gable_timber' : 'spire';

    const dormerCount = Math.max(1, Math.floor(bgW / 60));
    const dormers = [];
    for (let d = 0; d < dormerCount; d++) {
      dormers.push({ x: 22 + d * 52, y: -48 });
    }

    backgroundBuildings.push({
      x: bgX,
      width: bgW,
      height: bgH,
      color: pal.color,
      roofColor: pal.roof,
      roofType,
      dormers,
      chimney:
        Math.random() > 0.25
          ? {
              x: bgW * 0.68,
              height: 44 + Math.floor(Math.random() * 20),
              hasSmoke: Math.random() > 0.25,
            }
          : undefined,
      timberPattern: roofType === 'gable_timber',
      layer: 'mid',
    });

    bgX += bgW - 25; // dense layered overlap
  }

  // 3. West Gate (Left Boundary Arch & Tower)
  obstacles.push({
    id: 'west_town_gate',
    x: 80,
    y: groundY - 340,
    width: 170,
    height: 340,
    type: 'archway',
    passable: true,
    name: '西城门石塔',
  });

  // 3. Procedural Town Blocks (Harmonized European Storybook Scale with rich facade details & window occupants)
  let curX = 320;
  const buildingTypes: TownBuilding['type'][] = ['bakery', 'cafe', 'clocktower', 'florist', 'bookshop', 'residence'];
  const occupantPool: ('grandpa' | 'girl' | 'baker' | 'cat' | 'reader' | 'lady')[] = [
    'grandpa',
    'girl',
    'baker',
    'cat',
    'reader',
    'lady',
  ];

  while (curX < SANDBOX_MAP_WIDTH - 420) {
    const bType = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
    const palette = BUILDING_COLORS[Math.floor(Math.random() * BUILDING_COLORS.length)];
    const roofColor = ROOF_COLORS[Math.floor(Math.random() * ROOF_COLORS.length)];
    const bW = 300 + Math.floor(Math.random() * 90);

    // Harmonized stories & heights (Human is ~65-72px, story is ~85-110px)
    let bH = 320;
    let stories = 2;
    if (bType === 'clocktower') {
      bH = 500 + Math.floor(Math.random() * 40);
      stories = 4;
    } else if (bType === 'residence' || bType === 'bookshop') {
      bH = 380 + Math.floor(Math.random() * 40);
      stories = 3;
    } else if (bType === 'bakery' || bType === 'cafe' || bType === 'florist') {
      bH = 310 + Math.floor(Math.random() * 30);
      stories = 2;
    }

    const hasAwning = bType === 'bakery' || bType === 'cafe' || bType === 'florist';
    const hasGlass = bType === 'florist' || bType === 'bakery' || Math.random() > 0.55;
    const embeddedSide: 'left' | 'right' = Math.random() > 0.5 ? 'right' : 'left';

    const signText =
      bType === 'bakery'
        ? 'BOULANGERIE'
        : bType === 'cafe'
        ? 'CAFÉ DE FLORE'
        : bType === 'clocktower'
        ? 'HÔTEL DE VILLE'
        : bType === 'florist'
        ? 'FLEURISTE'
        : bType === 'bookshop'
        ? 'LIBRAIRIE'
        : undefined;

    // Window layout across upper stories (Human-proportioned windows with occupants & flower boxes!)
    const windows = [];
    const rows = Math.max(1, stories - 1);
    const cols = Math.floor((bW - 40) / 64);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const hasOccupant = Math.random() < 0.48;
        windows.push({
          x: 28 + c * 64,
          y: 44 + r * 76,
          w: 36,
          h: 48,
          lit: Math.random() > 0.25,
          occupant: hasOccupant ? occupantPool[Math.floor(Math.random() * occupantPool.length)] : undefined,
          flowerBox: Math.random() > 0.25,
        });
      }
    }

    const isBakery = bType === 'bakery';
    buildings.push({
      x: curX,
      width: bW,
      height: bH,
      color: palette.color,
      isDark: palette.isDark,
      roofColor,
      roofType: bType === 'clocktower' ? 'steep' : Math.random() > 0.5 ? 'gable' : 'mansard',
      windows,
      type: bType,
      signText,
      hasAwning,
      awningColor: isBakery ? '#fda4af' : undefined,
      hasPastryShowcase: isBakery,
      hasBalconyWithGirl: isBakery || Math.random() > 0.6,
      hasCatOnAwning: isBakery,
      hasWroughtIronBalcony: isBakery || Math.random() > 0.5,
      hasGlassStorefront: hasGlass,
      stories,
      embeddedGlassSide: hasGlass ? embeddedSide : undefined,
    });

    // If bakery: place fresh butter croissants on display stand
    if (bType === 'bakery') {
      lootItems.push({
        id: `loot-croissant-${curX}`,
        type: 'croissant',
        placement: 'bakery_tray',
        x: curX + bW * 0.42,
        y: groundY - 60,
        width: 28,
        height: 28,
        collected: false,
        bobOffset: 0,
        sparkleTimer: 0,
      });

      // Awning Cat watching below
      npcs.push({
        id: `npc-cat-${curX}`,
        name: '小猫米米',
        x: curX + bW * 0.28,
        targetX: curX + bW * 0.28,
        speed: 0,
        direction: 1,
        type: 'awning_cat',
        coatColor: 'light',
        state: 'calm',
        startleTimer: 0,
        walkTimer: 0,
        hasLoot: false,
      });
    }

    // If cafe: checkered bistro table with silver spoon & soda
    if (bType === 'cafe') {
      lootItems.push({
        id: `loot-spoon-${curX}`,
        type: 'silver_spoon',
        placement: 'cafe_table',
        x: curX + bW * 0.38,
        y: groundY - 58,
        width: 22,
        height: 22,
        collected: false,
        bobOffset: 0,
        sparkleTimer: 0,
      });

      lootItems.push({
        id: `loot-soda-${curX}`,
        type: 'potion_bottle',
        placement: 'cafe_table',
        x: curX + bW * 0.72,
        y: groundY - 60,
        width: 20,
        height: 20,
        collected: false,
        bobOffset: 0.4,
        sparkleTimer: 0,
      });

      npcs.push({
        id: `npc-diner-${curX}`,
        name: CITIZEN_NAMES[npcNameIdx++ % CITIZEN_NAMES.length],
        x: curX + bW * 0.35,
        targetX: curX + bW * 0.35,
        speed: 0,
        direction: 1,
        type: 'cafe_diner',
        coatColor: 'dark',
        state: 'calm',
        actionState: 'idle',
        startleTimer: 0,
        walkTimer: 0,
        hasLoot: true,
        heldLootType: 'silver_spoon',
      });
    }

    // Embedded Glass Storefront: flush embedded into building side facade!
    if (hasGlass) {
      const glassX = embeddedSide === 'left' ? curX + 10 : curX + bW - 100;
      obstacles.push({
        id: `glass_storefront_${curX}`,
        x: glassX,
        y: groundY - 110,
        width: 90,
        height: 110,
        type: 'glass_storefront',
        passable: false,
        name: '侧面内嵌式橱窗玻璃',
      });
    }

    // Upper Balcony Window Watcher leaning out
    if (Math.random() > 0.4) {
      const isGem = Math.random() > 0.4;
      lootItems.push({
        id: `loot-balcony-${curX}`,
        type: isGem ? 'sparkle_gem' : 'gold_brooch',
        placement: 'balcony_ledge',
        x: curX + 60,
        y: groundY - bH + 90,
        width: 24,
        height: 24,
        collected: false,
        bobOffset: 0,
        sparkleTimer: 0,
      });

      npcs.push({
        id: `npc-window-${curX}`,
        name: CITIZEN_NAMES[npcNameIdx++ % CITIZEN_NAMES.length],
        x: curX + 60,
        targetX: curX + 60,
        speed: 0,
        direction: 1,
        type: 'window_watcher',
        coatColor: 'light',
        state: 'calm',
        actionState: 'window_waving',
        startleTimer: 0,
        walkTimer: 0,
        hasLoot: true,
      });
    }

    // Walking Citizens in front of buildings (With assigned names!)
    if (Math.random() > 0.25) {
      const npcOptions: TownNPC['type'][] = [
        'gentleman_tulips',
        'girl_coffee',
        'girl_letter',
        'lady_parasol',
        'townsman',
      ];
      const npcWalkType = npcOptions[Math.floor(Math.random() * npcOptions.length)];
      const isDark = npcWalkType === 'gentleman_tulips' || npcWalkType === 'townsman';

      npcs.push({
        id: `npc-walker-${curX}`,
        name: CITIZEN_NAMES[npcNameIdx++ % CITIZEN_NAMES.length],
        x: curX + bW * 0.5,
        targetX: curX + bW * 0.5 + (Math.random() > 0.5 ? 120 : -120),
        speed: 0.45 + Math.random() * 0.45,
        direction: Math.random() > 0.5 ? 1 : -1,
        type: npcWalkType,
        coatColor: isDark ? 'dark' : 'light',
        state: 'walking',
        actionState: 'walking',
        startleTimer: 0,
        walkTimer: 180,
        hasLoot: false,
      });
    }

    curX += bW + 45;

    // -------------------------------------------------------------
    // STREET PARKS, FOUNTAINS & GREENERY BETWEEN BUILDINGS
    // -------------------------------------------------------------
    const midRoll = Math.random();

    // Central Fountain Square
    if (midRoll < 0.35) {
      const fountainX = curX + 90;
      obstacles.push({
        id: `fountain-${curX}`,
        x: fountainX,
        y: groundY - 75,
        width: 110,
        height: 75,
        type: 'fountain',
        passable: true,
        name: '中央喷泉池',
      });

      // Brass Key on fountain ledge
      lootItems.push({
        id: `loot-key-${curX}`,
        type: 'vintage_key',
        placement: 'fountain_rim',
        x: fountainX - 32,
        y: groundY - 68,
        width: 22,
        height: 22,
        collected: false,
        bobOffset: 0,
        sparkleTimer: 0,
      });

      // Fountain Water drinking spot
      lootItems.push({
        id: `loot-fountain-sip-${curX}`,
        type: 'fountain_sip',
        placement: 'fountain_water',
        x: fountainX + 40,
        y: groundY - 95,
        width: 32,
        height: 32,
        collected: false,
        bobOffset: 0.2,
        sparkleTimer: 0,
      });

      curX += 270;
    }
    // Park with Sleeping Grandpa and Apple Tree
    else if (midRoll < 0.7) {
      const benchX = curX + 70;
      const isWatch = Math.random() > 0.5;

      lootItems.push({
        id: `loot-bench-${curX}`,
        type: isWatch ? 'pocket_watch' : 'reading_glasses',
        placement: 'park_bench',
        x: benchX + 22,
        y: groundY - 44,
        width: 22,
        height: 22,
        collected: false,
        bobOffset: 0,
        sparkleTimer: 0,
      });

      npcs.push({
        id: `npc-grandpa-${curX}`,
        name: '皮埃尔大叔',
        x: benchX + 5,
        targetX: benchX + 5,
        speed: 0,
        direction: 1,
        type: 'grandpa_bench',
        coatColor: 'dark', // dark tweed coat
        state: 'calm',
        actionState: 'napping_bench',
        startleTimer: 0,
        walkTimer: 0,
        hasLoot: true,
        heldLootType: isWatch ? 'pocket_watch' : 'reading_glasses',
      });

      // Big Apple Tree
      obstacles.push({
        id: `tree-${curX}`,
        x: benchX + 130,
        y: groundY - 260,
        width: 110,
        height: 260,
        type: 'tree',
        passable: true,
        opacity: 1.0,
        name: '公园大苹果树',
      });

      lootItems.push({
        id: `loot-apple-${curX}`,
        type: 'red_apple',
        placement: 'cobblestone',
        x: benchX + 155,
        y: groundY - 16,
        width: 20,
        height: 20,
        collected: false,
        bobOffset: 0.3,
        sparkleTimer: 0,
      });

      curX += 290;
    }
    // Picnic Lawn with Yellow Blanket
    else {
      const picnicX = curX + 70;

      lootItems.push({
        id: `loot-fork-${curX}`,
        type: 'silver_fork',
        placement: 'picnic_blanket',
        x: picnicX + 22,
        y: groundY - 26,
        width: 20,
        height: 20,
        collected: false,
        bobOffset: 0,
        sparkleTimer: 0,
      });

      lootItems.push({
        id: `loot-bike-coin-${curX}`,
        type: 'gold_coin',
        placement: 'bicycle_basket',
        x: picnicX + 105,
        y: groundY - 18,
        width: 20,
        height: 20,
        collected: false,
        bobOffset: 0.6,
        sparkleTimer: 0,
      });

      // Flowering garden shrubs & stone arch
      obstacles.push({
        id: `arch-${curX}`,
        x: picnicX + 180,
        y: groundY - 210,
        width: 125,
        height: 210,
        type: 'archway',
        passable: true,
        name: '花园藤蔓石拱门',
      });

      curX += 310;
    }

    // Streetlamp with hanging flower pot
    if (Math.random() > 0.35) {
      obstacles.push({
        id: `lamp-${curX}`,
        x: curX - 25,
        y: groundY - 140,
        width: 24,
        height: 140,
        type: 'streetlamp',
        passable: true,
        name: '欧式复古铸铁街灯',
      });
    }
  }

  // 4. Moving Street Traffic Fleet (Harmonized proportions: School Bus 92px, Van 74px, Car 52px, Cyclist 68px)
  const trafficVehicles: TownTrafficVehicle[] = [
    {
      id: 'veh-school-bus-1',
      x: 650,
      y: groundY - 92,
      width: 230,
      height: 92,
      speed: 1.35,
      direction: 1,
      type: 'school_bus',
      name: '阳光小学明黄校车',
      color: '#facc15',
      isDark: false,
      roofSplatCount: 0,
      poopDecals: [],
      honkTimer: 0,
      sirenPhase: 0,
    },
    {
      id: 'veh-police-car-1',
      x: 2150,
      y: groundY - 56,
      width: 145,
      height: 56,
      speed: 1.85,
      direction: -1,
      type: 'police_car',
      name: '小镇巡逻警车',
      color: '#1e3a8a',
      isDark: true,
      roofSplatCount: 0,
      poopDecals: [],
      honkTimer: 0,
      sirenPhase: 0,
    },
    {
      id: 'veh-postal-van-1',
      x: 3550,
      y: groundY - 74,
      width: 165,
      height: 74,
      speed: 1.25,
      direction: 1,
      type: 'postal_van',
      name: '皇家特快邮政车',
      color: '#15803d',
      isDark: true,
      roofSplatCount: 0,
      poopDecals: [],
      honkTimer: 0,
      sirenPhase: 0,
    },
    {
      id: 'veh-classic-sedan-1',
      x: 1350,
      y: groundY - 52,
      width: 140,
      height: 52,
      speed: 1.5,
      direction: 1,
      type: 'classic_sedan',
      name: '藏青复古老爷车',
      color: '#1e293b',
      isDark: true,
      roofSplatCount: 0,
      poopDecals: [],
      honkTimer: 0,
      sirenPhase: 0,
    },
    {
      id: 'veh-delivery-truck-1',
      x: 4650,
      y: groundY - 84,
      width: 190,
      height: 84,
      speed: 1.2,
      direction: -1,
      type: 'delivery_truck',
      name: '法式面包坊配送货车',
      color: '#fef08a',
      isDark: false,
      roofSplatCount: 0,
      poopDecals: [],
      honkTimer: 0,
      sirenPhase: 0,
    },
    {
      id: 'veh-bicycle-rider-1',
      x: 2850,
      y: groundY - 68,
      width: 68,
      height: 68,
      speed: 1.6,
      direction: 1,
      type: 'bicycle_rider',
      name: '骑自行车的信使少年',
      color: '#0284c7',
      isDark: false,
      roofSplatCount: 0,
      poopDecals: [],
      honkTimer: 0,
      sirenPhase: 0,
    },
    {
      id: 'veh-bicycle-rider-2',
      x: 4200,
      y: groundY - 68,
      width: 68,
      height: 68,
      speed: 1.4,
      direction: -1,
      type: 'bicycle_rider',
      name: '采买法棍的单车少女',
      color: '#f43f5e',
      isDark: false,
      roofSplatCount: 0,
      poopDecals: [],
      honkTimer: 0,
      sirenPhase: 0,
    },
  ];

  // 5. Recipient Mailbox Position (Placed around 76% of the town map)
  const mailboxX = Math.round(SANDBOX_MAP_WIDTH * 0.76);
  obstacles.push({
    id: 'town_recipient_mailbox',
    x: mailboxX,
    y: groundY - 76,
    width: 42,
    height: 76,
    type: 'mailbox',
    passable: true,
    name: '金色皇家邮筒',
  });

  // 6. East Harbor & Lighthouse (Right Boundary)
  obstacles.push({
    id: 'east_harbor_pier',
    x: SANDBOX_MAP_WIDTH - 260,
    y: groundY - 360,
    width: 220,
    height: 360,
    type: 'archway',
    passable: true,
    name: '东港口灯塔与堤岸',
  });

  return {
    mapWidth: SANDBOX_MAP_WIDTH,
    backgroundBuildings,
    buildings,
    lootItems,
    obstacles,
    npcs,
    clouds,
    mailboxPos: { x: mailboxX, y: groundY - 76 },
    trafficVehicles,
  };
}
