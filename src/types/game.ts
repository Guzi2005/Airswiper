export type BirdId = 'crow' | 'pigeon' | 'seagull' | 'cockatoo';

export interface BirdConfig {
  id: BirdId;
  name: string;
  nameEn: string;
  townTheme: string;
  townThemeEn: string;
  baseWeight: number; // in kg
  maxWeight: number;
  glideFactor: number;
  description: string;
  color: string;
  accentColor: string;
  beakColor: string;
  eyeColor: string;
  specialTrait: string;
}

export type LootType =
  | 'copper_coin'
  | 'gold_coin'
  | 'silver_spoon'
  | 'silver_fork'
  | 'reading_glasses'
  | 'vintage_key'
  | 'pocket_watch'
  | 'sparkle_gem'
  | 'gold_brooch'
  | 'croissant'
  | 'potion_bottle'
  | 'red_apple'
  | 'fountain_sip';

export type LootPlacement =
  | 'cafe_table'
  | 'bakery_tray'
  | 'park_bench'
  | 'picnic_blanket'
  | 'fountain_rim'
  | 'fountain_water'
  | 'balcony_ledge'
  | 'cobblestone'
  | 'bicycle_basket';

export interface LootItemConfig {
  type: LootType;
  name: string;
  points: number;
  weight: number;
  color: string;
  sparkleColor: string;
  icon: string;
  category: 'shiny' | 'food' | 'buff' | 'sip';
  description: string;
  contextHint: string;
}

export interface ActiveLoot {
  id: string;
  type: LootType;
  placement: LootPlacement;
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
  collectedAnim?: number;
  bobOffset: number;
  sparkleTimer: number;
  contextOwnerId?: string;
}

export interface TownNPC {
  id: string;
  name: string; // Citizen name for Town Gazette newspaper!
  x: number;
  targetX: number;
  speed: number;
  direction: 1 | -1;
  type:
    | 'grandpa_bench'
    | 'cafe_diner'
    | 'girl_croissant'
    | 'window_watcher'
    | 'picnic_family'
    | 'awning_cat'
    | 'townsman'
    | 'lady_parasol'
    | 'girl_coffee'
    | 'gentleman_tulips'
    | 'girl_letter';
  coatColor: string; // for poop contrast checking: 'dark' or 'light'
  state: 'calm' | 'walking' | 'startled';
  actionState?:
    | 'idle'
    | 'walking'
    | 'startled'
    | 'buying_croissant'
    | 'seeking_shelter'
    | 'sitting_bench'
    | 'napping_bench'
    | 'window_waving'
    | 'entering_building'
    | 'exiting_building';
  shelterTargetX?: number;
  holdingUmbrella?: boolean;
  umbrellaColor?: string;
  insideBuildingTimer?: number;
  startleTimer: number;
  walkTimer: number;
  hasLoot: boolean;
  heldLootType?: LootType;
  dialogue?: string;
  hasPoopOnHead?: boolean;
  poopColor?: 'white' | 'black';
  windowFloor?: number;
}

export type TrafficVehicleType = 'classic_sedan' | 'school_bus' | 'police_car' | 'postal_van' | 'delivery_truck' | 'bicycle_rider';

export interface TownTrafficVehicle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: 1 | -1;
  type: TrafficVehicleType;
  name: string;
  color: string;
  isDark: boolean;
  roofSplatCount: number;
  poopDecals: { offsetX: number; offsetY: number; color: 'white' | 'black'; size: number }[];
  honkTimer: number;
  sirenPhase: number;
}

export interface TownNewsHeadline {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  category: 'theft' | 'poop_bomb' | 'chaos' | 'mail';
  comboCount: number;
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'glass_storefront' | 'archway' | 'tree' | 'fountain' | 'cafe_table' | 'mailbox' | 'vintage_car' | 'streetlamp';
  passable: boolean;
  opacity?: number;
  name: string;
  carColor?: string;
  isDark?: boolean;
  hasPoopOnRoof?: boolean;
  poopColor?: 'white' | 'black';
}

export interface PoopProjectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: 'white' | 'black';
  size: number;
  isSplattered: boolean;
  dropY: number;
}

export interface PoopDecal {
  id: string;
  x: number;
  y: number;
  color: 'white' | 'black';
  size: number;
  targetType: 'npc' | 'building' | 'ground' | 'car' | 'parasol' | 'awning' | 'mailbox' | 'streetlamp' | 'fountain';
  targetId?: string;
  bonusPoints?: number;
}

export interface FloatingBalloonPacket {
  id: string;
  x: number;
  y: number;
  vy: number;
  vx: number;
  lootItems: LootItemConfig[];
  points: number;
  alpha: number;
}

export interface Cloud {
  x: number;
  y: number;
  speed: number;
  scale: number;
  opacity: number;
  type: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type?: 'sparkle' | 'feather' | 'wind' | 'smoke' | 'confetti' | 'water' | 'poop_splat' | 'leaf';
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  subtext?: string;
  color: string;
  alpha: number;
  scale: number;
  life: number;
}

export type FlightState =
  | 'CRUISING'    // Level cruising
  | 'DIVING'      // Plunging down along parabolic arc
  | 'REBOUNDING'  // Pulling upward with aerodynamic lift
  | 'PERCHED'     // Landed / perched on surface
  | 'STUNNED'     // Hit a glass barrier
  | 'TUMBLING';   // Hit by vehicle tumbling along parabolic arc!

export interface CitizenComplaint {
  id: string;
  citizenName: string;
  role: string;
  avatarIcon: string;
  title: string;
  complaintText: string;
  incidentType: 'stolen_pastry' | 'stolen_jewelry' | 'poop_bomb_hat' | 'poop_bomb_car' | 'traffic_chaos' | 'general';
  timestamp: number;
  comboCount: number;
  location: string;
}

export interface SettlementSummaryData {
  totalVictims: number;
  victimNames: string[];
  stolenItems: LootItemConfig[];
  poopHitCount: number;
  vehicleHitCount: number;
  totalScore: number;
  complaints: CitizenComplaint[];
  nestJewelryCount: number;
  headlineArticle: string;
}

export type MissionType = 'shiny_scramble' | 'mail_delivery' | 'town_chaos';

export interface MissionGoal {
  type: MissionType;
  title: string;
  description: string;
  icon: string;
  targetScore: number;
  targetLootCount: number;
  timeRemaining: number;
  isCompleted: boolean;
  mailDelivered?: boolean;
}

export interface CrowPlayer {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1; // 1 for right, -1 for left
  rotation: number;
  wingPhase: number;
  birdConfig: BirdConfig;
  state: FlightState;
  cruiseAltitudeY: number;
  currentLoot: LootItemConfig[];
  totalWeight: number;
  diveDepth: number;
  isDragging: boolean;
  dragStartX: number;
  dragStartY: number;
  dragCurrentX: number;
  dragCurrentY: number;
  perchSurface?: { y: number; name: string };
  stunTimer: number;
  invincibleTimer: number;
  speedBoostTimer: number;
  trailPoints: { x: number; y: number; alpha: number }[];
  selectedPoopColor: 'white' | 'black';
  hasMailLetter?: boolean;
  turnProgress: number; // -1 to 1 for pseudo-3D turnaround perspective
  stamina: number;
  maxStamina: number;
  poopAmmo: number;
  maxPoopAmmo: number;
  digestionTimer: number;
  digestionQueueCount: number;
  isExhausted: boolean;
  hitByVehicleTimer: number;
  ridingVehicleId?: string;
}

export interface BackgroundBuilding {
  x: number;
  width: number;
  height: number;
  color: string;
  roofColor: string;
  roofType: 'mansard' | 'gable_timber' | 'steeple' | 'spire';
  dormers: { x: number; y: number }[];
  chimney?: { x: number; height: number; hasSmoke: boolean };
  timberPattern?: boolean;
  layer?: 'far' | 'mid';
  feature?: 'windmill' | 'clock_belfry' | 'church_cross';
}

export interface TownBuilding {
  x: number;
  width: number;
  height: number;
  color: string;
  isDark: boolean; // for contrast poop score
  roofColor: string;
  roofType: 'gable' | 'mansard' | 'steep' | 'thatched';
  windows: {
    x: number;
    y: number;
    w: number;
    h: number;
    lit: boolean;
    occupant?: 'grandpa' | 'girl' | 'baker' | 'cat' | 'reader' | 'lady';
    shutterColor?: string;
    flowerBox?: boolean;
  }[];
  type: 'bakery' | 'clocktower' | 'cafe' | 'residence' | 'bookshop' | 'florist';
  signText?: string;
  hasAwning?: boolean;
  awningColor?: string;
  hasPastryShowcase?: boolean; // Fruit tarts, eclairs, macarons like Sara Nicely illustration!
  hasBalconyWithGirl?: boolean; // Smiling girl with open arms leaning out of upper window!
  hasCatOnAwning?: boolean;
  hasWroughtIronBalcony?: boolean; // Delicate scrolled railing with white dove!
  hasGlassStorefront?: boolean; // Realistic ground level storefront glass!
  stories?: number; // 1, 2, 3 or 4 stories
  embeddedGlassSide?: 'left' | 'right'; // Embedded side glass conservatory / showcase
}
