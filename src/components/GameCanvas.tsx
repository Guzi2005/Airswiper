import React, { useCallback, useEffect, useRef } from 'react';
import { soundManager } from '../audio/soundEffects';
import {
  ActiveLoot,
  BackgroundBuilding,
  BirdConfig,
  CitizenComplaint,
  Cloud,
  CrowPlayer,
  FloatingBalloonPacket,
  FloatingText,
  LootItemConfig,
  MissionGoal,
  MissionType,
  Obstacle,
  Particle,
  PoopDecal,
  PoopProjectile,
  SettlementSummaryData,
  TownBuilding,
  TownNewsHeadline,
  TownNPC,
  TownTrafficVehicle,
} from '../types/game';
import {
  drawArchway,
  drawBackgroundBuilding,
  drawBakeryStand,
  drawBuilding,
  drawCafePatioTable,
  drawCloud,
  drawContextualLoot,
  drawCrowPlayer,
  drawFloatingBalloonPacket,
  drawFloatingTexts,
  drawFountain,
  drawMailbox,
  drawParkBench,
  drawParticles,
  drawPicnicBlanket,
  drawPoopDecal,
  drawPoopProjectile,
  drawSlingshotAiming,
  drawStorefrontGlass,
  drawStreetlamp,
  drawTownNPC,
  drawTrafficVehicle,
  drawTree,
  drawVintageBicycle,
  drawVintageCar,
  drawWindStreaks,
} from '../utils/canvasRenderer';
import { GAME_PHYSICS, LOOT_CONFIGS } from '../utils/constants';
import { generateSandboxTown, SANDBOX_MAP_WIDTH } from '../utils/levelGenerator';

interface GameCanvasProps {
  birdConfig: BirdConfig;
  isPlaying: boolean;
  activeMission: MissionGoal;
  onMissionUpdate: (updatedMission: MissionGoal) => void;
  onScoreUpdate: (bankedScore: number, carriedScore: number, combo: number) => void;
  onWeightUpdate: (weight: number, maxWeight: number) => void;
  onLootUpdate: (lootList: { type: string; points: number; weight: number; name: string; icon: string }[]) => void;
  onAltitudeUpdate: (currentAltitude: number, cruiseAltitude: number) => void;
  onBalloonTriggerRef: React.MutableRefObject<(() => void) | null>;
  onResetTriggerRef: React.MutableRefObject<(() => void) | null>;
  onPoopTriggerRef: React.MutableRefObject<((color?: 'white' | 'black') => void) | null>;
  onLandTriggerRef: React.MutableRefObject<(() => void) | null>;
  onDeliverMailRef: React.MutableRefObject<(() => void) | null>;
  onAddHeadline?: (headline: TownNewsHeadline) => void;
  onAddComplaint?: (complaint: CitizenComplaint) => void;
  onStaminaUpdate?: (stamina: number, maxStamina: number, isExhausted: boolean) => void;
  onPoopAmmoUpdate?: (ammo: number, maxAmmo: number, digesting: boolean, queueCount: number) => void;
  onGetSettlementDataRef?: React.MutableRefObject<(() => SettlementSummaryData) | null>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  birdConfig,
  isPlaying,
  activeMission,
  onMissionUpdate,
  onScoreUpdate,
  onWeightUpdate,
  onLootUpdate,
  onAltitudeUpdate,
  onBalloonTriggerRef,
  onResetTriggerRef,
  onPoopTriggerRef,
  onLandTriggerRef,
  onDeliverMailRef,
  onAddHeadline,
  onAddComplaint,
  onStaminaUpdate,
  onPoopAmmoUpdate,
  onGetSettlementDataRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core Game State
  const playerRef = useRef<CrowPlayer>({
    x: 400,
    y: 130,
    vx: GAME_PHYSICS.CRUISE_SPEED_BASE,
    vy: 0,
    facing: 1,
    rotation: 0,
    wingPhase: 0,
    birdConfig: birdConfig,
    state: 'CRUISING',
    cruiseAltitudeY: 130,
    currentLoot: [],
    totalWeight: birdConfig.baseWeight + 3 * 0.16,
    diveDepth: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragCurrentX: 0,
    dragCurrentY: 0,
    stunTimer: 0,
    invincibleTimer: 0,
    speedBoostTimer: 0,
    trailPoints: [],
    selectedPoopColor: 'white',
    hasMailLetter: activeMission.type === 'mail_delivery',
    turnProgress: 1,
    stamina: 100,
    maxStamina: 100,
    poopAmmo: 3,
    maxPoopAmmo: 6,
    digestionTimer: 0,
    digestionQueueCount: 0,
    isExhausted: false,
    hitByVehicleTimer: 0,
  });

  const backgroundBuildingsRef = useRef<BackgroundBuilding[]>([]);
  const buildingsRef = useRef<TownBuilding[]>([]);
  const trafficVehiclesRef = useRef<TownTrafficVehicle[]>([]);
  const lootItemsRef = useRef<ActiveLoot[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const npcsRef = useRef<TownNPC[]>([]);
  const cloudsRef = useRef<Cloud[]>([]);
  const mailboxPosRef = useRef<{ x: number; y: number }>({ x: 3000, y: 500 });
  const recentHitsRef = useRef<{ name: string; action: 'poop' | 'snatch'; timestamp: number }[]>([]);

  // Citizen Complaints & Settlement Tracking
  const complaintsRef = useRef<CitizenComplaint[]>([]);
  const stolenItemsRef = useRef<LootItemConfig[]>([]);
  const poopHitCountRef = useRef<number>(0);
  const vehicleHitCountRef = useRef<number>(0);

  const poopProjectilesRef = useRef<PoopProjectile[]>([]);
  const poopDecalsRef = useRef<PoopDecal[]>([]);
  const balloonPacketsRef = useRef<FloatingBalloonPacket[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);

  const cameraXRef = useRef<number>(0);
  const bankedScoreRef = useRef<number>(0);
  const carriedScoreRef = useRef<number>(0);
  const comboRef = useRef<number>(1);
  const comboTimerRef = useRef<number>(0);
  const screenShakeRef = useRef<number>(0);
  const lastAltitudeRef = useRef<number>(-1);
  const missionRef = useRef<MissionGoal>(activeMission);

  const callbacksRef = useRef({
    onScoreUpdate,
    onWeightUpdate,
    onLootUpdate,
    onAltitudeUpdate,
    onMissionUpdate,
    onAddHeadline,
    onAddComplaint,
    onStaminaUpdate,
    onPoopAmmoUpdate,
  });

  useEffect(() => {
    callbacksRef.current = {
      onScoreUpdate,
      onWeightUpdate,
      onLootUpdate,
      onAltitudeUpdate,
      onMissionUpdate,
      onAddHeadline,
      onAddComplaint,
      onStaminaUpdate,
      onPoopAmmoUpdate,
    };
    missionRef.current = activeMission;
    playerRef.current.hasMailLetter = activeMission.type === 'mail_delivery' && !activeMission.mailDelivered;
  });

  // Record Citizen Complaint to the Postbox Tip Bag
  const recordCitizenComplaint = useCallback((complaint: Omit<CitizenComplaint, 'id' | 'timestamp' | 'comboCount'>) => {
    const fullComplaint: CitizenComplaint = {
      ...complaint,
      id: `complaint-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      comboCount: comboRef.current,
    };
    complaintsRef.current.unshift(fullComplaint);
    if (callbacksRef.current.onAddComplaint) {
      callbacksRef.current.onAddComplaint(fullComplaint);
    }
  }, []);

  // Compile Comprehensive Aggregated Gazette Data for Settlement (统计受害次数、人物、事件，连缀成文)
  const generateSettlementData = useCallback((): SettlementSummaryData => {
    const complaints = complaintsRef.current;
    const uniqueVictims = Array.from(new Set(complaints.map((c) => c.citizenName)));
    const totalScore = bankedScoreRef.current + carriedScoreRef.current;
    const stolenItems = stolenItemsRef.current;
    const poopCount = poopHitCountRef.current;
    const vehicleCount = vehicleHitCountRef.current;

    // Synthesize coherent news article (连缀成文)
    let headlineArticle = '';
    if (complaints.length === 0) {
      headlineArticle = `今日晨曦小镇难得享受了片刻宁静，空中怪盗飞禽似乎忙于在林间梳理羽毛，尚未在街头制造轰动。不过据市政厅治安官提醒，所有市民仍需警惕晴空下飞来的暗影！`;
    } else {
      const victimListStr =
        uniqueVictims.slice(0, 4).join('、') +
        (uniqueVictims.length > 4 ? ` 等 ${uniqueVictims.length} 人` : '');
      const firstComplaint = complaints[complaints.length - 1]; // oldest
      const middleComplaint = complaints.length > 2 ? complaints[Math.floor(complaints.length / 2)] : null;
      const lastComplaint = complaints[0]; // newest

      headlineArticle = `【本报特稿 / 晨曦每日邮报专电】今日清晨起，一只头顶金芒的黑羽怪盗飞禽在晨曦小镇上空掀起了前所未有的治安风暴！据市政厅热线不完全统计，全镇累计已有多达 ${uniqueVictims.length} 位知名体面居民（包括【${victimListStr}】）遭到突袭，投诉信箱已被市民哭诉信件彻底塞爆！

案发之初，【${firstComplaint.citizenName}】在街头遭遇了“${firstComplaint.title}”；未等巡警赶到现场，这只怪鸟又闪电般扑向【${middleComplaint ? middleComplaint.citizenName : '街头行人'}】，${middleComplaint ? middleComplaint.complaintText : '再度制造了巨大混乱'}。随后，【${lastComplaint.citizenName}】也惨遭毒手... 就连街头疾驰的机动车辆也一度遭逢空投重击与车祸险情！

据本报读者维权部统计，这起连环案共造成 ${poopCount} 起精准生化打击，${stolenItems.length} 件包括金黄牛角包与反光银匙在内的宝贵财物被当街掠夺。而此刻，这名恶贯满盈的空中飞贼正高居教堂钟楼顶端的暖巢中，洋洋得意地盘点着它的耀眼战利品，全镇居民正发起联合悬赏！`;
    }

    return {
      totalVictims: uniqueVictims.length,
      victimNames: uniqueVictims,
      stolenItems,
      poopHitCount: poopCount,
      vehicleHitCount: vehicleCount,
      totalScore,
      complaints,
      nestJewelryCount: stolenItems.length,
      headlineArticle,
    };
  }, []);

  // Expose settlement data getter to parent component
  useEffect(() => {
    if (onGetSettlementDataRef) {
      onGetSettlementDataRef.current = generateSettlementData;
    }
  }, [generateSettlementData, onGetSettlementDataRef]);

  // Dispatch Town Gazette Real-time News Headline (Supporting compound '先...紧接着又...' headlines)
  const dispatchHeadline = useCallback((targetName: string, action: 'poop' | 'snatch', detail: string) => {
    const now = Date.now();
    const recentHits = recentHitsRef.current;
    const recent = recentHits.length > 0 ? recentHits[recentHits.length - 1] : null;

    if (recent && now - recent.timestamp < 2600 && recent.name !== targetName) {
      let title = '';
      let content = '';
      if (recent.action === 'snatch' && action === 'poop') {
        title = `🔥 惊天连环案：先劫口粮再炸街头！`;
        content = `这只行踪诡秘的怪盗鸟先是风驰电掣般从【${recent.name}】手中一把抢走了热腾腾的金黄可颂，紧接着在疾速突围中拉下一坨鸟屎，精准砸在【${targetName}】身上！`;
      } else if (recent.action === 'poop' && action === 'poop') {
        title = `🚨 连环双重轰炸！小镇街头公愤！`;
        content = `恶霸飞禽先是精准空袭了【${recent.name}】，紧接着又在同一俯冲轨迹中飞溅到了【${targetName}】！连续两起受害事件震惊晨曦小镇！`;
      } else if (recent.action === 'poop' && action === 'snatch') {
        title = `⚡ 声东击西：先投飞弹再夺美食！`;
        content = `这只机警的恶禽先用鸟屎轰炸了【${recent.name}】制造混乱，随后趁乱俯冲，一把叼走了【${targetName}】刚买好的香脆可颂！`;
      } else {
        title = `⚡ 连环扫荡：小镇危机！`;
        content = `怪盗鸟先是袭击了【${recent.name}】，紧接着又针对了【${targetName}】，两起空中罪案接踵而至！`;
      }

      const headline: TownNewsHeadline = {
        id: `news-${now}-${Math.random()}`,
        title,
        content,
        timestamp: now,
        category: 'chaos',
        comboCount: 2,
      };
      recentHitsRef.current = [];
      if (callbacksRef.current.onAddHeadline) {
        callbacksRef.current.onAddHeadline(headline);
      }
    } else {
      recentHitsRef.current = [{ name: targetName, action, timestamp: now }];
      let title = '';
      let content = '';
      if (action === 'snatch') {
        title = `🥐 街头抢食：可颂不翼而飞！`;
        content = `一只金色微冠的怪盗飞禽光天化日之下俯冲突袭，从【${targetName}】手中一把夺走了刚出炉的黄油可颂，扬长而去！`;
      } else {
        title = `🎯 飞来横祸：${targetName}遭遇精准空袭！`;
        content = `一坨鸟屎自高空呼啸而下，在众人惊愕注视下精准落在了【${targetName}】身上，现场留下一片狼藉！`;
      }

      const headline: TownNewsHeadline = {
        id: `news-${now}-${Math.random()}`,
        title,
        content,
        timestamp: now,
        category: action === 'snatch' ? 'theft' : 'poop_bomb',
        comboCount: 1,
      };
      if (callbacksRef.current.onAddHeadline) {
        callbacksRef.current.onAddHeadline(headline);
      }
    }
  }, []);

  // Initialize or Reset Sandbox Town Map
  const initGameWorld = useCallback(() => {
    const canvas = canvasRef.current;
    const height = canvas ? canvas.height : 600;
    const groundY = height - 50;
    const cruiseY = height * GAME_PHYSICS.CRUISE_RATIO;

    const town = generateSandboxTown(groundY);

    backgroundBuildingsRef.current = town.backgroundBuildings;
    buildingsRef.current = town.buildings;
    trafficVehiclesRef.current = town.trafficVehicles;
    lootItemsRef.current = town.lootItems;
    obstaclesRef.current = town.obstacles;
    npcsRef.current = town.npcs;
    cloudsRef.current = town.clouds;
    mailboxPosRef.current = town.mailboxPos;
    recentHitsRef.current = [];
    complaintsRef.current = [];
    stolenItemsRef.current = [];
    poopHitCountRef.current = 0;
    vehicleHitCountRef.current = 0;

    playerRef.current = {
      x: 350,
      y: cruiseY,
      vx: GAME_PHYSICS.CRUISE_SPEED_BASE,
      vy: 0,
      facing: 1,
      rotation: 0,
      wingPhase: 0,
      birdConfig: birdConfig,
      state: 'CRUISING',
      cruiseAltitudeY: cruiseY,
      currentLoot: [],
      totalWeight: birdConfig.baseWeight + 3 * 0.16,
      diveDepth: 0,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      dragCurrentX: 0,
      dragCurrentY: 0,
      stunTimer: 0,
      invincibleTimer: 0,
      speedBoostTimer: 0,
      trailPoints: [],
      selectedPoopColor: 'white',
      hasMailLetter: missionRef.current.type === 'mail_delivery',
      turnProgress: 1,
      stamina: 100,
      maxStamina: 100,
      poopAmmo: 3,
      maxPoopAmmo: 6,
      digestionTimer: 0,
      digestionQueueCount: 0,
      isExhausted: false,
      hitByVehicleTimer: 0,
    };

    cameraXRef.current = 0;
    bankedScoreRef.current = 0;
    carriedScoreRef.current = 0;
    comboRef.current = 1;
    comboTimerRef.current = 0;
    screenShakeRef.current = 0;
    lastAltitudeRef.current = -1;
    poopProjectilesRef.current = [];
    poopDecalsRef.current = [];
    balloonPacketsRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];

    callbacksRef.current.onScoreUpdate(0, 0, 1);
    callbacksRef.current.onWeightUpdate(birdConfig.baseWeight + 3 * 0.16, birdConfig.maxWeight);
    callbacksRef.current.onLootUpdate([]);
    callbacksRef.current.onStaminaUpdate?.(100, 100, false);
    callbacksRef.current.onPoopAmmoUpdate?.(3, 6, false, 0);
  }, [birdConfig]);

  // Drop Poop Action (Poop Ammo & Weight check)
  const triggerDropPoop = useCallback((color?: 'white' | 'black') => {
    const player = playerRef.current;
    
    // Check Poop Ammo
    if (player.poopAmmo <= 0) {
      soundManager.playExhaustedPuff();
      floatingTextsRef.current.push({
        id: `no-poop-${Date.now()}`,
        x: player.x,
        y: player.y - 25,
        text: '💨 腹中空空！去吃个可颂增加弹药吧',
        color: '#f59e0b',
        alpha: 1,
        scale: 1.1,
        life: 45,
      });
      return;
    }

    player.poopAmmo -= 1;
    // Weight update: poop removed reduces bird weight!
    const lootWeight = player.currentLoot.reduce((sum, item) => sum + item.weight, 0);
    player.totalWeight = player.birdConfig.baseWeight + lootWeight + player.poopAmmo * 0.16;
    callbacksRef.current.onWeightUpdate(player.totalWeight, player.birdConfig.maxWeight);
    callbacksRef.current.onPoopAmmoUpdate?.(
      player.poopAmmo,
      player.maxPoopAmmo,
      player.digestionQueueCount > 0,
      player.digestionQueueCount
    );

    const poopColor = color || player.selectedPoopColor;
    soundManager.playPoopDrop();

    poopProjectilesRef.current.push({
      id: `poop-${Date.now()}-${Math.random()}`,
      x: player.x - player.facing * 18,
      y: player.y + 14,
      vx: player.vx * 0.45,
      vy: 3.2,
      color: poopColor,
      size: 5,
      isSplattered: false,
      dropY: player.y + 14,
    });

    floatingTextsRef.current.push({
      id: `poop-text-${Date.now()}`,
      x: player.x,
      y: player.y - 25,
      text: poopColor === 'white' ? '💩 白鸟屎投下!' : '💩 黑鸟屎投下!',
      color: poopColor === 'white' ? '#ffffff' : '#0f172a',
      alpha: 1,
      scale: 1,
      life: 35,
    });
  }, []);

  // Perch or Take-off with Multi-Surface Detection (Roofs, NPC Heads, Cars, Streetlamps, Ground)
  const triggerTogglePerch = useCallback(() => {
    const player = playerRef.current;
    const canvas = canvasRef.current;
    const height = canvas ? canvas.height : 600;
    const groundY = height - 50;

    if (player.state === 'PERCHED') {
      // Take off into flight!
      player.state = 'CRUISING';
      player.vy = -6.5;
      player.vx = player.facing * GAME_PHYSICS.CRUISE_SPEED_BASE;
      soundManager.playReboundSwoosh();
      floatingTextsRef.current.push({
        id: `takeoff-${Date.now()}`,
        x: player.x,
        y: player.y - 20,
        text: '🕊️ 振翅起飞! [双向滑翔中]',
        color: '#38bdf8',
        alpha: 1,
        scale: 1.15,
        life: 40,
      });
    } else {
      // Find nearest sensible surface to perch on:
      soundManager.playPerchLand();
      player.state = 'PERCHED';
      player.vx = 0;
      player.vy = 0;
      player.rotation = 0;

      // 1. Check if directly hovering above an NPC's head
      const nearbyNpc = npcsRef.current.find(
        (n) => Math.abs(n.x - player.x) < 32 && player.y <= groundY - 30
      );
      if (nearbyNpc) {
        player.x = nearbyNpc.x;
        player.y = groundY - 76;
        nearbyNpc.state = 'startled';
        nearbyNpc.startleTimer = 120;
        floatingTextsRef.current.push({
          id: `perch-npc-${Date.now()}`,
          x: player.x,
          y: player.y - 25,
          text: '🐾 站在路人头顶上! [路人瑟瑟发抖]',
          subtext: '按 [A/D] 左右试探，按 [P/O] 头顶拉屎',
          color: '#facc15',
          alpha: 1,
          scale: 1.25,
          life: 55,
        });
        return;
      }

      // 1b. Check if hovering above a moving traffic vehicle roof
      const nearbyTrafficVeh = trafficVehiclesRef.current.find(
        (v) => Math.abs(v.x - player.x) < v.width / 2 + 10 && player.y <= groundY - v.height + 40
      );
      if (nearbyTrafficVeh) {
        player.y = groundY - nearbyTrafficVeh.height - 12;
        player.state = 'PERCHED';
        player.vx = 0;
        player.vy = 0;
        player.rotation = 0;
        floatingTextsRef.current.push({
          id: `perch-traffic-${Date.now()}`,
          x: player.x,
          y: player.y - 25,
          text: `🐾 站在【${nearbyTrafficVeh.name}】车顶上随车兜风！`,
          color: '#38bdf8',
          alpha: 1,
          scale: 1.25,
          life: 50,
        });
        return;
      }

      // 2. Check if hovering above a parked vintage car
      const nearbyCar = obstaclesRef.current.find(
        (obs) => obs.type === 'vintage_car' && player.x >= obs.x - 10 && player.x <= obs.x + obs.width + 10
      );
      if (nearbyCar) {
        player.y = groundY - 48;
        floatingTextsRef.current.push({
          id: `perch-car-${Date.now()}`,
          x: player.x,
          y: player.y - 25,
          text: '🐾 站在复古汽车车顶! [A/D小步跳跃]',
          color: '#38bdf8',
          alpha: 1,
          scale: 1.15,
          life: 45,
        });
        return;
      }

      // 3. Check if near a streetlamp post top
      const nearbyLamp = obstaclesRef.current.find(
        (obs) => obs.type === 'streetlamp' && Math.abs(obs.x + obs.width / 2 - player.x) < 28
      );
      if (nearbyLamp) {
        player.x = nearbyLamp.x + nearbyLamp.width / 2;
        player.y = groundY - 120;
        floatingTextsRef.current.push({
          id: `perch-lamp-${Date.now()}`,
          x: player.x,
          y: player.y - 25,
          text: '🐾 停歇在欧式街灯顶端! [居高临下]',
          color: '#fbbf24',
          alpha: 1,
          scale: 1.15,
          life: 45,
        });
        return;
      }

      // 4. Check if near a building roof
      const nearbyBuilding = buildingsRef.current.find(
        (b) => player.x >= b.x - 10 && player.x <= b.x + b.width + 10 && player.y <= groundY - b.height + 65
      );
      if (nearbyBuilding) {
        player.y = groundY - nearbyBuilding.height - 12;
        floatingTextsRef.current.push({
          id: `perch-roof-${Date.now()}`,
          x: player.x,
          y: player.y - 25,
          text: '🐾 站定在欧式建筑屋顶 [A/D漫步，L起飞]',
          color: '#facc15',
          alpha: 1,
          scale: 1.2,
          life: 50,
        });
        return;
      }

      // 5. Fallback: Cobblestone Sidewalk / Ground
      player.y = groundY - 22;
      floatingTextsRef.current.push({
        id: `perch-ground-${Date.now()}`,
        x: player.x,
        y: player.y - 25,
        text: '🐾 落地停歇在石板路上 [A/D小步跳跃，L起飞]',
        color: '#facc15',
        alpha: 1,
        scale: 1.1,
        life: 45,
      });
    }
  }, []);

  // Mail Delivery Action [D key]
  const triggerDeliverMail = useCallback(() => {
    const player = playerRef.current;
    const mailbox = mailboxPosRef.current;
    const dist = Math.hypot(player.x - mailbox.x, player.y - mailbox.y);

    if (dist < 110) {
      if (player.hasMailLetter) {
        player.hasMailLetter = false;
        soundManager.playMailDelivery();
        bankedScoreRef.current += 500;

        floatingTextsRef.current.push({
          id: `mail-success-${Date.now()}`,
          x: mailbox.x,
          y: mailbox.y - 35,
          text: '🎉 信件成功投递! +500分!',
          subtext: '使命必达，信鸽英雄!',
          color: '#22c55e',
          alpha: 1,
          scale: 1.4,
          life: 80,
        });

        // Update Mission Goal
        const updated = {
          ...missionRef.current,
          isCompleted: true,
          mailDelivered: true,
        };
        missionRef.current = updated;
        callbacksRef.current.onMissionUpdate(updated);
        callbacksRef.current.onScoreUpdate(bankedScoreRef.current, carriedScoreRef.current, comboRef.current);
      } else {
        floatingTextsRef.current.push({
          id: `mail-empty-${Date.now()}`,
          x: mailbox.x,
          y: mailbox.y - 25,
          text: '信件已投递完毕！',
          color: '#f59e0b',
          alpha: 1,
          scale: 1,
          life: 40,
        });
      }
    } else {
      floatingTextsRef.current.push({
        id: `mail-far-${Date.now()}`,
        x: player.x,
        y: player.y - 30,
        text: '离邮筒还很远，继续赶路！',
        color: '#f59e0b',
        alpha: 1,
        scale: 1,
        life: 40,
      });
    }
  }, []);

  // Balloon Pack: Released with colorful balloon string soaring into sky!
  const triggerBalloonPack = useCallback(() => {
    const player = playerRef.current;
    if (player.currentLoot.length === 0) {
      floatingTextsRef.current.push({
        id: `empty-bank-${Date.now()}`,
        x: player.x,
        y: player.y - 30,
        text: '当前手头没有赃物可打包！',
        color: '#f59e0b',
        alpha: 1,
        scale: 1,
        life: 45,
      });
      return;
    }

    const lootCount = player.currentLoot.length;
    const bankedG = carriedScoreRef.current;
    bankedScoreRef.current += bankedG;
    carriedScoreRef.current = 0;

    soundManager.playBalloonBank();

    // Spawn a Floating Balloon Packet that floats away into the sky!
    balloonPacketsRef.current.push({
      id: `bp-${Date.now()}`,
      x: player.x,
      y: player.y - 15,
      vy: -2.8,
      vx: player.facing * 0.4,
      lootItems: [...player.currentLoot],
      points: bankedG,
      alpha: 1,
    });

    // Reset bird weight & loot
    player.currentLoot = [];
    player.totalWeight = player.birdConfig.baseWeight;

    floatingTextsRef.current.push({
      id: `bank-${Date.now()}`,
      x: player.x,
      y: player.y - 45,
      text: `🎈 气球放飞! +${bankedG}分`,
      subtext: `放飞${lootCount}件战利品，轻装巡航!`,
      color: '#4ade80',
      alpha: 1,
      scale: 1.3,
      life: 80,
    });

    // Check Shiny Scramble mission completion
    if (missionRef.current.type === 'shiny_scramble') {
      if (lootCount >= missionRef.current.targetLootCount || bankedScoreRef.current >= missionRef.current.targetScore) {
        const updated = { ...missionRef.current, isCompleted: true };
        missionRef.current = updated;
        callbacksRef.current.onMissionUpdate(updated);
      }
    }

    callbacksRef.current.onScoreUpdate(bankedScoreRef.current, 0, comboRef.current);
    callbacksRef.current.onWeightUpdate(player.totalWeight, player.birdConfig.maxWeight);
    callbacksRef.current.onLootUpdate([]);
  }, []);

  // Expose triggers
  useEffect(() => {
    onBalloonTriggerRef.current = triggerBalloonPack;
    onResetTriggerRef.current = initGameWorld;
    onPoopTriggerRef.current = triggerDropPoop;
    onLandTriggerRef.current = triggerTogglePerch;
    onDeliverMailRef.current = triggerDeliverMail;
  }, [triggerBalloonPack, initGameWorld, triggerDropPoop, triggerTogglePerch, triggerDeliverMail, onBalloonTriggerRef, onResetTriggerRef, onPoopTriggerRef, onLandTriggerRef, onDeliverMailRef]);

  // Sync bird selection
  useEffect(() => {
    playerRef.current.birdConfig = birdConfig;
    playerRef.current.totalWeight = birdConfig.baseWeight + playerRef.current.currentLoot.reduce((sum, item) => sum + item.weight, 0);
    callbacksRef.current.onWeightUpdate(playerRef.current.totalWeight, birdConfig.maxWeight);
  }, [birdConfig]);

  // Handle Resize and init
  const initializedRef = useRef(false);
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      playerRef.current.cruiseAltitudeY = canvas.height * GAME_PHYSICS.CRUISE_RATIO;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    if (!initializedRef.current) {
      initializedRef.current = true;
      initGameWorld();
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [initGameWorld]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const groundY = height - 50;
      const cruiseY = height * GAME_PHYSICS.CRUISE_RATIO;
      const time = performance.now() / 1000;

      const player = playerRef.current;

      // 1. UPDATE PHYSICS & ENTITIES
      if (isPlaying) {
        // Wing flapping speed: faster and lively (0.45 / 0.7)
        player.wingPhase += player.state === 'DIVING' ? 0.75 : 0.42;

        // Combo decay timer
        if (comboTimerRef.current > 0) {
          comboTimerRef.current -= 1 / 60;
          if (comboTimerRef.current <= 0) {
            comboRef.current = 1;
            callbacksRef.current.onScoreUpdate(bankedScoreRef.current, carriedScoreRef.current, 1);
          }
        }

        // Stun timer
        if (player.stunTimer > 0) {
          player.stunTimer--;
          if (player.stunTimer <= 0) player.state = 'CRUISING';
        }

        // Boosts
        if (player.invincibleTimer > 0) player.invincibleTimer--;
        if (player.speedBoostTimer > 0) player.speedBoostTimer--;

        // Dynamic Mass calculation
        const weightFactor = player.totalWeight / player.birdConfig.baseWeight;
        const currentSpeedBase = player.speedBoostTimer > 0 ? GAME_PHYSICS.CRUISE_SPEED_BASE * 1.5 : GAME_PHYSICS.CRUISE_SPEED_BASE;

        // -------------------------------------------------------------
        // STAMINA & EXHAUSTION SYSTEM (体力消耗、回复与受力分析滑落)
        // -------------------------------------------------------------
        if (player.state === 'CRUISING') {
          // Cruising glides on thermals, slowly regenerating stamina
          player.stamina = Math.min(player.maxStamina, player.stamina + 0.12);
          if (player.isExhausted && player.stamina >= 25) {
            player.isExhausted = false;
          }
        } else if (player.state === 'PERCHED') {
          // Standing / perching on eave, bench or ground rapidly recovers stamina
          player.stamina = Math.min(player.maxStamina, player.stamina + 0.48);
          if (player.isExhausted && player.stamina >= 30) {
            player.isExhausted = false;
          }
        } else if (player.state === 'DIVING' || player.state === 'REBOUNDING') {
          // Active flapping consumes stamina
          player.stamina = Math.max(0, player.stamina - 0.15);
          if (player.stamina <= 0 && !player.isExhausted) {
            player.isExhausted = true;
            soundManager.playExhaustedPuff();
            floatingTextsRef.current.push({
              id: `exhausted-${Date.now()}`,
              x: player.x,
              y: player.y - 30,
              text: '💦 体力见底！取消升力，按抛物线惯性滑落！',
              color: '#f43f5e',
              alpha: 1,
              scale: 1.25,
              life: 55,
            });
          }
        }

        // Digestion Processing (吃可颂消化增加存屎弹药)
        if (player.digestionQueueCount > 0) {
          player.digestionTimer += 1 / 60;
          if (player.digestionTimer >= 2.8) {
            player.digestionTimer = 0;
            player.digestionQueueCount--;
            player.poopAmmo = Math.min(player.maxPoopAmmo, player.poopAmmo + 1);
            soundManager.playDigestionGurgle();

            // Recalculate weight with new poop
            const lootWeight = player.currentLoot.reduce((s, it) => s + it.weight, 0);
            player.totalWeight = player.birdConfig.baseWeight + lootWeight + player.poopAmmo * 0.16;
            callbacksRef.current.onWeightUpdate(player.totalWeight, player.birdConfig.maxWeight);

            floatingTextsRef.current.push({
              id: `digest-${Date.now()}`,
              x: player.x,
              y: player.y - 30,
              text: '💩 可颂消化完成，便意+1！',
              color: '#f59e0b',
              alpha: 1,
              scale: 1.15,
              life: 45,
            });

            // Auto-poop if ammo reaches maximum capacity ("如果存屎量条达到上限，就会自动拉屎")
            if (player.poopAmmo >= player.maxPoopAmmo) {
              triggerDropPoop();
              floatingTextsRef.current.push({
                id: `auto-poop-${Date.now()}`,
                x: player.x,
                y: player.y - 45,
                text: '💨 憋不住啦！存屎满载自动排便！',
                color: '#ef4444',
                alpha: 1,
                scale: 1.25,
                life: 55,
              });
            }
          }
        }

        callbacksRef.current.onStaminaUpdate?.(player.stamina, player.maxStamina, player.isExhausted);
        callbacksRef.current.onPoopAmmoUpdate?.(
          player.poopAmmo,
          player.maxPoopAmmo,
          player.digestionQueueCount > 0,
          player.digestionQueueCount
        );

        // -------------------------------------------------------------
        // ELEVATED GROUND & VEHICLE ROOF DETECTION
        // "车顶棚被视为高一点的地面，鸟会及时调整抛物线顶点位置"
        // -------------------------------------------------------------
        let elevatedGroundY = groundY;
        let vehicleUnderneath: TownTrafficVehicle | null = null;

        for (const veh of trafficVehiclesRef.current) {
          // Bicycle riders are pedestrians on bikes, not broad elevated car roofs
          if (veh.type === 'bicycle_rider') continue;
          const halfW = veh.width / 2 + 10;
          if (player.x >= veh.x - halfW && player.x <= veh.x + halfW) {
            const vRoofY = groundY - veh.height;
            if (vRoofY < elevatedGroundY) {
              elevatedGroundY = vRoofY;
              vehicleUnderneath = veh;
            }
          }
        }
        for (const obs of obstaclesRef.current) {
          if (obs.type === 'vintage_car') {
            if (player.x >= obs.x - 8 && player.x <= obs.x + obs.width + 8) {
              const cRoofY = groundY - obs.height;
              if (cRoofY < elevatedGroundY) {
                elevatedGroundY = cRoofY;
              }
            }
          }
        }

        // Player State Machine (Supports Bidirectional Facing & Cruising)
        if (player.state === 'CRUISING') {
          // Cruise along current facing direction!
          player.vx = player.facing * currentSpeedBase;
          const targetY = cruiseY + Math.sin(time * 3.5) * 6;
          player.vy += (targetY - player.y) * 0.08;
          player.vy *= 0.82;
          player.rotation = (player.vy * 0.035) * player.facing;
        } else if (player.state === 'DIVING') {
          if (player.isExhausted) {
            // Exhausted: lift cancelled, strictly inherit momentum & force curve
            player.vy += GAME_PHYSICS.GRAVITY * 1.1;
            player.vx *= 0.99;
            player.rotation = Math.atan2(player.vy, Math.abs(player.vx));

            // Mid-arc eave or car roof landing
            if (player.vy > 0) {
              // 1. Check building eaves
              buildingsRef.current.forEach((b) => {
                const bRoofY = groundY - b.height;
                if (
                  player.x >= b.x - 20 &&
                  player.x <= b.x + b.width + 20 &&
                  player.y >= bRoofY - 14 &&
                  player.y <= bRoofY + 30
                ) {
                  player.state = 'PERCHED';
                  player.y = bRoofY;
                  player.vx = 0;
                  player.vy = 0;
                  player.rotation = 0;
                  soundManager.playPerchLand();
                  floatingTextsRef.current.push({
                    id: `eave-catch-${Date.now()}`,
                    x: player.x,
                    y: player.y - 30,
                    text: `🪶 抓住【${b.signText || b.type}屋檐】停下歇脚！`,
                    color: '#38bdf8',
                    alpha: 1,
                    scale: 1.2,
                    life: 55,
                  });
                }
              });

              // 2. Check elevated car roof landing when exhausted
              if (elevatedGroundY < groundY && player.y >= elevatedGroundY - 18 && player.y <= elevatedGroundY + 16) {
                player.state = 'PERCHED';
                player.y = elevatedGroundY - 12;
                player.vx = 0;
                player.vy = 0;
                player.rotation = 0;
                soundManager.playPerchLand();
                floatingTextsRef.current.push({
                  id: `car-roof-perch-exhaust-${Date.now()}`,
                  x: player.x,
                  y: elevatedGroundY - 30,
                  text: `🐾 落在【${vehicleUnderneath?.name || '复古车'}】车顶！借车前行恢复体力！`,
                  color: '#38bdf8',
                  alpha: 1,
                  scale: 1.25,
                  life: 55,
                });
              }
            }
          } else {
            // Normal Parabolic dive
            const effGravity = GAME_PHYSICS.GRAVITY * (1 + (weightFactor - 1) * 0.25);
            player.vy += effGravity;
            player.vx *= GAME_PHYSICS.AIR_DRAG;

            const depth = player.y - cruiseY;
            const springLift = Math.pow(Math.max(0, depth), 1.25) * GAME_PHYSICS.SPRING_BUOYANCY_FACTOR;
            player.vy -= springLift;

            // "鸟会及时调整抛物线顶点位置" - timely adjust parabola lowest vertex when approaching elevated car roof!
            if (elevatedGroundY < groundY) {
              const distToRoof = elevatedGroundY - player.y;
              if (distToRoof < 48 && distToRoof > -15) {
                player.vy -= Math.max(0, (48 - distToRoof) * 0.35);
              }
            }

            player.rotation = Math.atan2(player.vy, Math.abs(player.vx));

            // Rebound trigger: responds to elevated ground (car roof is treated as elevated ground!)
            const reboundYThreshold = elevatedGroundY < groundY ? elevatedGroundY - 18 : groundY - 35;
            if (player.vy <= 0 || player.y >= reboundYThreshold) {
              player.state = 'REBOUNDING';
              soundManager.playReboundSwoosh();
              if (elevatedGroundY < groundY) {
                player.vy = -Math.max(6.2, Math.abs(player.vy) * 0.85);
                floatingTextsRef.current.push({
                  id: `car-roof-bounce-${Date.now()}`,
                  x: player.x,
                  y: elevatedGroundY - 24,
                  text: '🚗 车顶借力！抛物线顶点及时跃升！',
                  color: '#38bdf8',
                  alpha: 1,
                  scale: 1.25,
                  life: 45,
                });
              }
            }
          }
        } else if (player.state === 'REBOUNDING') {
          if (player.isExhausted) {
            // Lift cancelled: glide down along force curve
            player.vy += GAME_PHYSICS.GRAVITY * 1.05;
            player.vx *= 0.99;
            player.rotation = Math.atan2(player.vy, Math.abs(player.vx));
          } else {
            const climbForce = 0.42 * player.birdConfig.glideFactor;
            player.vy -= climbForce;
            player.vy *= 0.96;
            player.vx = player.facing * Math.max(Math.abs(player.vx), currentSpeedBase * 0.95);
            player.rotation = Math.atan2(player.vy, Math.abs(player.vx));

            if (player.y <= cruiseY + 12) {
              player.state = 'CRUISING';
              player.vy = 0;
              player.rotation = 0;
            }
          }
        } else if (player.state === 'PERCHED') {
          player.vx = 0;
          player.vy = 0;
          player.rotation = 0;
          // Ride along if perched on a moving vehicle roof!
          if (vehicleUnderneath && player.y <= groundY - vehicleUnderneath.height + 6) {
            player.x += vehicleUnderneath.direction * vehicleUnderneath.speed;
            player.y = groundY - vehicleUnderneath.height - 12;
          } else if (player.y < groundY - 35) {
            // If the vehicle underneath moved away or perched in empty air
            const stillSupported =
              buildingsRef.current.some(
                (b) =>
                  player.x >= b.x - 20 &&
                  player.x <= b.x + b.width + 20 &&
                  Math.abs(player.y - (groundY - b.height)) < 24
              ) ||
              obstaclesRef.current.some(
                (obs) =>
                  player.x >= obs.x - 15 &&
                  player.x <= obs.x + obs.width + 15 &&
                  Math.abs(player.y - (groundY - obs.height)) < 28
              );
            if (!stillSupported) {
              player.state = 'CRUISING';
            }
          }
        } else if (player.state === 'STUNNED') {
          player.vx *= 0.92;
          player.vy += 0.2;
          player.rotation = Math.sin(time * 18) * 0.3;
        } else if (player.state === 'TUMBLING') {
          // Bird hit by vehicle: parabolic tumbling ballistic curve
          player.vy += GAME_PHYSICS.GRAVITY * 1.25;
          player.vx *= 0.985;
          player.rotation += player.vx * 0.08;

          if (player.y >= groundY - 26) {
            player.y = groundY - 26;
            player.vy = -player.vy * 0.35;
            player.vx *= 0.7;
          }

          if (player.hitByVehicleTimer > 0) {
            player.hitByVehicleTimer--;
            if (player.hitByVehicleTimer <= 0) {
              player.state = 'CRUISING';
              player.vy = 0;
              player.rotation = 0;
            }
          }
        }

        // Bounded Sandbox Map Collision (0 to SANDBOX_MAP_WIDTH)
        player.x += player.vx;
        player.y += player.vy;

        if (player.x < 120) {
          player.x = 120;
          player.vx = Math.abs(player.vx);
          player.facing = 1;
        } else if (player.x > SANDBOX_MAP_WIDTH - 120) {
          player.x = SANDBOX_MAP_WIDTH - 120;
          player.vx = -Math.abs(player.vx);
          player.facing = -1;
        }

        // Floor collision: elevated car roof is treated as elevated ground!
        const effectiveFloorY = elevatedGroundY < groundY ? elevatedGroundY - 14 : groundY - 26;
        if (player.y > effectiveFloorY && player.state !== 'PERCHED') {
          player.y = effectiveFloorY;
          player.vy = -Math.abs(player.vy) * 0.45;
          // If softly landing on elevated car roof, transition into perched ride
          if (
            elevatedGroundY < groundY &&
            Math.abs(player.vy) < 1.8 &&
            (player.state === 'CRUISING' || player.state === 'REBOUNDING' || player.isExhausted)
          ) {
            player.state = 'PERCHED';
            player.vy = 0;
            player.vx = 0;
            player.rotation = 0;
            soundManager.playPerchLand();
            floatingTextsRef.current.push({
              id: `car-soft-land-${Date.now()}`,
              x: player.x,
              y: player.y - 28,
              text: `🐾 降落在【${vehicleUnderneath?.name || '汽车'}】车顶！随车兜风！`,
              color: '#38bdf8',
              alpha: 1,
              scale: 1.2,
              life: 50,
            });
          }
        }
        if (player.y < 35) {
          player.y = 35;
          player.vy = Math.abs(player.vy) * 0.5;
        }
        if (player.y < 35) {
          player.y = 35;
          player.vy = Math.abs(player.vy) * 0.5;
        }

        // Flight trails
        if (player.state === 'DIVING' || player.state === 'REBOUNDING' || player.speedBoostTimer > 0) {
          player.trailPoints.push({ x: player.x, y: player.y, alpha: 0.7 });
        }
        player.trailPoints = player.trailPoints
          .map((tp) => ({ ...tp, alpha: tp.alpha - 0.04 }))
          .filter((tp) => tp.alpha > 0);

        // Camera tracks player inside bounded sandbox
        const targetCamX = Math.max(0, Math.min(player.x - width * 0.5, SANDBOX_MAP_WIDTH - width));
        cameraXRef.current += (targetCamX - cameraXRef.current) * 0.12;

        // Update Clouds drifting across the sky
        cloudsRef.current.forEach((c) => {
          c.x = (c.x + c.speed) % SANDBOX_MAP_WIDTH;
        });

        // Update Floating Balloon Packets
        balloonPacketsRef.current.forEach((bp) => {
          bp.y += bp.vy;
          bp.x += bp.vx;
          if (bp.y < 60) bp.alpha -= 0.02;
        });
        balloonPacketsRef.current = balloonPacketsRef.current.filter((bp) => bp.alpha > 0);

        // Update Pseudo-3D Turnaround Progress
        if (typeof player.turnProgress !== 'number') player.turnProgress = player.facing;
        if (player.turnProgress !== player.facing) {
          const step = 0.12;
          if (player.turnProgress < player.facing) {
            player.turnProgress = Math.min(player.facing, player.turnProgress + step);
          } else {
            player.turnProgress = Math.max(player.facing, player.turnProgress - step);
          }
        }

        // Update Moving Street Traffic Vehicles
        trafficVehiclesRef.current.forEach((veh) => {
          veh.x += veh.direction * veh.speed;
          if (veh.x < -180) {
            veh.x = SANDBOX_MAP_WIDTH + 140;
          } else if (veh.x > SANDBOX_MAP_WIDTH + 180) {
            veh.x = -140;
          }
          if (veh.type === 'police_car') {
            veh.sirenPhase = (veh.sirenPhase + 0.18) % (Math.PI * 2);
          }
          if (veh.honkTimer > 0) veh.honkTimer--;

          // Collision Check: "只有在车头前才会被撞飞"
          const vehHalfW = veh.width / 2;
          const vehRoofY = groundY - veh.height;

          // If bicycle rider: pleasant bell ringing near-miss, not violent vehicle crash!
          if (veh.type === 'bicycle_rider') {
            const isNearBike =
              Math.abs(player.x - veh.x) < 32 &&
              player.y >= groundY - veh.height &&
              player.y <= groundY;
            if (isNearBike && veh.honkTimer === 0) {
              veh.honkTimer = 85;
              soundManager.playNearMissWhistle();
              floatingTextsRef.current.push({
                id: `bike-bell-${Date.now()}`,
                x: veh.x,
                y: groundY - veh.height - 20,
                text: '🔔 叮铃铃！小单车急按车铃避让！',
                color: '#38bdf8',
                alpha: 1,
                scale: 1.15,
                life: 45,
              });
            }
          } else {
            // Motorized vehicles: only front hood/bumper collides!
            // Front bumper position is based on vehicle travel direction:
            // veh.direction === 1: front bumper is at veh.x + vehHalfW
            // veh.direction === -1: front bumper is at veh.x - vehHalfW
            const frontBumperX = veh.direction === 1 ? veh.x + vehHalfW : veh.x - vehHalfW;
            const isFrontZone =
              veh.direction === 1
                ? player.x >= frontBumperX - 10 && player.x <= frontBumperX + 20
                : player.x >= frontBumperX - 20 && player.x <= frontBumperX + 10;

            // Height must be strictly in front of radiator grille / front bumper (BELOW the roofline!)
            // If player.y < vehRoofY + 14, the bird is on or skimming over the roof, which is elevated ground!
            const isFrontHeight = player.y >= vehRoofY + 14 && player.y <= groundY + 2;
            const isHitByCarFront = isFrontZone && isFrontHeight;

            if (isHitByCarFront && player.invincibleTimer <= 0) {
              vehicleHitCountRef.current++;
              soundManager.playHonkHorn();
              soundManager.playVehicleCrash();
              screenShakeRef.current = 16;
              player.state = 'TUMBLING';
              player.hitByVehicleTimer = 85;
              player.invincibleTimer = 110;

              // Parabolic Knockback Velocity: launched high along vehicle travel direction
              player.vx = veh.direction * (12 + veh.speed * 4.5);
              player.vy = -14 - Math.random() * 4;

              // Feather particles scatter
              for (let i = 0; i < 14; i++) {
                particlesRef.current.push({
                  x: player.x,
                  y: player.y,
                  vx: (Math.random() - 0.5) * 8,
                  vy: -3 - Math.random() * 5,
                  size: 6,
                  color: '#334155',
                  alpha: 1,
                  life: 0,
                  maxLife: 45,
                  type: 'feather',
                });
              }

              floatingTextsRef.current.push({
                id: `car-crash-${Date.now()}`,
                x: player.x,
                y: player.y - 45,
                text: `💥 哎呀！在车头前被【${veh.name}】撞飞啦！`,
                subtext: '迎面相撞，沿抛物线高高弹飞翻滚中！',
                color: '#ef4444',
                alpha: 1,
                scale: 1.35,
                life: 65,
              });

              // File Citizen Complaint for traffic collision!
              recordCitizenComplaint({
                citizenName: veh.name,
                role: '街头机动交通',
                avatarIcon: '🚗',
                title: `【重大车祸警情】飞禽低空横穿被【${veh.name}】车头撞飞！`,
                complaintText: `“这只乌鸦居然贴地滑翔，直接迎面撞在车头保险杠上被弹飞到了半空中！车辆剧烈震颤，险些酿成连环追尾，全镇必须严加管束空中飞禽！”`,
                incidentType: 'traffic_chaos',
                location: `街头车道 [X: ${Math.round(veh.x)}]`,
              });
            } else if (
              Math.abs(player.x - veh.x) < 75 &&
              Math.abs(player.y - vehRoofY) < 35
            ) {
              if (veh.honkTimer === 0) {
                veh.honkTimer = 90;
                soundManager.playHonkHorn();
              }
            }
          }
        });

        // Update Walking NPCs & Town Life Interactions
        npcsRef.current.forEach((npc) => {
          if (npc.startleTimer > 0) {
            npc.startleTimer--;
            if (npc.startleTimer <= 0) npc.state = 'walking';
          }

          // 1. Seeking shelter after hit by bird poop: runs to nearest building door to buy an umbrella
          if (npc.actionState === 'seeking_shelter' && typeof npc.shelterTargetX === 'number') {
            const dx = npc.shelterTargetX - npc.x;
            npc.direction = dx > 0 ? 1 : -1;
            npc.x += npc.direction * 1.6;
            if (Math.abs(npc.x - npc.shelterTargetX) < 14) {
              npc.actionState = 'entering_building';
              npc.insideBuildingTimer = 85;
            }
          } else if (npc.actionState === 'entering_building') {
            if (npc.insideBuildingTimer && npc.insideBuildingTimer > 0) {
              npc.insideBuildingTimer--;
              if (npc.insideBuildingTimer <= 0) {
                // Emerges with a colorful umbrella!
                npc.actionState = 'walking';
                npc.holdingUmbrella = true;
                npc.umbrellaColor = ['#38bdf8', '#f43f5e', '#a855f7', '#10b981', '#fbbf24'][
                  Math.floor(Math.random() * 5)
                ];
                npc.hasPoopOnHead = false;
                floatingTextsRef.current.push({
                  id: `umbrella-bought-${Date.now()}`,
                  x: npc.x,
                  y: groundY - 80,
                  text: `🛍️ ${npc.name} 买了一把新洋伞撑着走！`,
                  color: '#38bdf8',
                  alpha: 1,
                  scale: 1.15,
                  life: 55,
                });
              }
            }
          } else if (npc.actionState === 'buying_croissant' && typeof npc.shelterTargetX === 'number') {
            const dx = npc.shelterTargetX - npc.x;
            npc.direction = dx > 0 ? 1 : -1;
            npc.x += npc.direction * 1.1;
            if (Math.abs(npc.x - npc.shelterTargetX) < 16) {
              npc.actionState = 'walking';
              npc.heldLootType = 'croissant';
              npc.hasLoot = true;
              floatingTextsRef.current.push({
                id: `croissant-bought-${Date.now()}`,
                x: npc.x,
                y: groundY - 75,
                text: `🥐 ${npc.name} 买到了刚出炉的可颂！`,
                color: '#f59e0b',
                alpha: 1,
                scale: 1.1,
                life: 50,
              });
            }
          } else if (npc.state === 'walking' && npc.speed > 0) {
            npc.x += npc.direction * npc.speed;
            if (Math.abs(npc.x - npc.targetX) < 10) {
              npc.direction = npc.direction === 1 ? -1 : 1;
              npc.targetX = npc.x + npc.direction * (60 + Math.random() * 100);

              // Chance to walk to bakery to buy a fresh croissant!
              if (!npc.hasLoot && !npc.holdingUmbrella && Math.random() < 0.22) {
                const bakery = buildingsRef.current.find((b) => b.type === 'bakery');
                if (bakery && Math.abs(npc.x - (bakery.x + bakery.width * 0.4)) < 300) {
                  npc.actionState = 'buying_croissant';
                  npc.shelterTargetX = bakery.x + bakery.width * 0.4;
                }
              }
            }
          }

          // 2. Crow player dives close and snatches croissant from NPC's hands!
          if (npc.heldLootType === 'croissant') {
            const snatchDist = Math.hypot(player.x - npc.x, player.y - (groundY - 50));
            if (snatchDist < 46) {
              npc.heldLootType = undefined;
              npc.hasLoot = false;
              npc.state = 'startled';
              npc.startleTimer = 160;

              // Stamina recovery: eating croissant restores stamina!
              player.stamina = Math.min(player.maxStamina, player.stamina + 45);
              player.isExhausted = false;
              // Digestion queue: eating croissant digests into poop ammo!
              player.digestionQueueCount += 2;

              // Max 3 treasures limit: auto-release 4th item! ("宝物达到三个后，获得第四个时，就会自动放飞")
              if (player.currentLoot.length >= 3) {
                const released = player.currentLoot.shift();
                if (released) {
                  soundManager.playTreasureRelease();
                  player.totalWeight -= released.weight;
                  floatingTextsRef.current.push({
                    id: `release-${Date.now()}`,
                    x: player.x,
                    y: player.y - 35,
                    text: `🪶 爪子抓不下了(上限3件)！放飞了【${released.name}】✨`,
                    color: '#fde047',
                    alpha: 1,
                    scale: 1.25,
                    life: 55,
                  });
                  for (let i = 0; i < 8; i++) {
                    particlesRef.current.push({
                      x: player.x,
                      y: player.y,
                      vx: (Math.random() - 0.5) * 4,
                      vy: -2 - Math.random() * 3,
                      size: 5,
                      color: released.sparkleColor || '#facc15',
                      alpha: 1,
                      life: 0,
                      maxLife: 40,
                      type: 'sparkle',
                    });
                  }
                }
              }

              player.currentLoot.push(LOOT_CONFIGS.croissant);
              stolenItemsRef.current.push(LOOT_CONFIGS.croissant);
              player.totalWeight += LOOT_CONFIGS.croissant.weight;
              carriedScoreRef.current += LOOT_CONFIGS.croissant.points;
              comboRef.current++;
              comboTimerRef.current = 2.5;

              soundManager.playCroissantCrunch();
              soundManager.playLootPickup(false, comboRef.current);

              floatingTextsRef.current.push({
                id: `snatch-croissant-${Date.now()}`,
                x: npc.x,
                y: groundY - 85,
                text: `🥐 抢走${npc.name}手中的热腾腾可颂！体力+45！+${LOOT_CONFIGS.croissant.points}分！`,
                subtext: '大口咀嚼，正在消化增加便意...',
                color: '#f59e0b',
                alpha: 1,
                scale: 1.35,
                life: 65,
              });

              // File Citizen Complaint from the robbed victim
              recordCitizenComplaint({
                citizenName: npc.name,
                role: '可颂受害者',
                avatarIcon: '🥐',
                title: '【抢劫报案】刚出炉的黄油牛角包被怪鸟当街叼走！',
                complaintText: `“我刚从法式面包店买来热气腾腾的可颂，正准备下嘴，那只恶鸟突然俯冲，一把叼走了我的早点！全镇治安何在？！”`,
                incidentType: 'stolen_pastry',
                location: `街头面包店旁 [X: ${Math.round(npc.x)}]`,
              });

              callbacksRef.current.onScoreUpdate(bankedScoreRef.current, carriedScoreRef.current, comboRef.current);
              callbacksRef.current.onWeightUpdate(player.totalWeight, player.birdConfig.maxWeight);
              callbacksRef.current.onLootUpdate(
                player.currentLoot.map((item) => ({
                  type: item.type,
                  points: item.points,
                  weight: item.weight,
                  name: item.name,
                  icon: item.icon,
                }))
              );

              dispatchHeadline(npc.name, 'snatch', '可颂');
            }
          }
        });

        // Update Poop Projectiles & Check Collisions
        poopProjectilesRef.current.forEach((poop) => {
          poop.x += poop.vx;
          poop.y += poop.vy;
          poop.vy += 0.32; // gravity

          // 1a. Check Umbrella Canopies (Lady Parasol & Citizens with open umbrellas!)
          npcsRef.current.forEach((npc) => {
            if (poop.isSplattered) return;
            const hasUmbrella = npc.holdingUmbrella || npc.type === 'lady_parasol';
            if (hasUmbrella) {
              const umbrellaCenterX = npc.type === 'lady_parasol' ? npc.x + 18 : npc.x + 14;
              const umbrellaTopY = groundY - 86;
              if (
                Math.abs(poop.x - umbrellaCenterX) < 24 &&
                poop.y >= umbrellaTopY - 12 &&
                poop.y <= umbrellaTopY + 14
              ) {
                poop.isSplattered = true;
                npc.state = 'startled';
                npc.startleTimer = 100;

                const isContrastBonus = poop.color === 'white';
                const earnedMischief = isContrastBonus ? 160 : 80;
                bankedScoreRef.current += earnedMischief;
                poopHitCountRef.current++;
                soundManager.playPoopSplat(isContrastBonus);

                poopDecalsRef.current.push({
                  id: `splat-umbrella-${Date.now()}`,
                  x: umbrellaCenterX,
                  y: umbrellaTopY - 6,
                  color: poop.color,
                  size: 7,
                  targetType: 'parasol',
                  targetId: npc.id,
                  bonusPoints: earnedMischief,
                });

                floatingTextsRef.current.push({
                  id: `poop-umb-${Date.now()}`,
                  x: npc.x,
                  y: groundY - 105,
                  text: `⛱️ 阳伞挡住了！${npc.name}安然无恙！+${earnedMischief}分`,
                  subtext: isContrastBonus ? '白鸟屎溅在洋伞上！' : '',
                  color: '#facc15',
                  alpha: 1,
                  scale: 1.25,
                  life: 55,
                });

                // File Citizen Complaint for umbrella splat
                recordCitizenComplaint({
                  citizenName: npc.name,
                  role: '洋伞居民',
                  avatarIcon: '🌂',
                  title: '【生化袭击】蕾丝洋伞惨遭空投鸟屎精准轰炸！',
                  complaintText: `“幸好今天出门撑了伞！头顶‘啪嗒’一声巨响，白色鸟粪在伞面上炸开一大片！全镇的体面都被这只恶鸟丢光了，必须索赔！”`,
                  incidentType: 'poop_bomb_hat',
                  location: `街头步道 [X: ${Math.round(npc.x)}]`,
                });

                callbacksRef.current.onScoreUpdate(bankedScoreRef.current, carriedScoreRef.current, comboRef.current);
                dispatchHeadline(`${npc.name}的洋伞`, 'poop', '洋伞');
              }
            }
          });

          // 1b. Check NPC pedestrians head collision (If not holding an umbrella)
          if (!poop.isSplattered) {
            npcsRef.current.forEach((npc) => {
              if (poop.isSplattered || npc.holdingUmbrella) return;
              const dist = Math.hypot(poop.x - npc.x, poop.y - (groundY - 50));
              if (dist < 26) {
                poop.isSplattered = true;
                npc.state = 'startled';
                npc.startleTimer = 140;
                npc.hasPoopOnHead = true;
                npc.poopColor = poop.color;
                poopHitCountRef.current++;

                const isContrastBonus =
                  (poop.color === 'white' && npc.coatColor === 'dark') ||
                  (poop.color === 'black' && npc.coatColor === 'light');

                const earnedMischief = isContrastBonus ? 150 : 50;
                bankedScoreRef.current += earnedMischief;
                soundManager.playPoopSplat(isContrastBonus);

                poopDecalsRef.current.push({
                  id: `splat-${Date.now()}`,
                  x: npc.x + (Math.random() - 0.5) * 12,
                  y: groundY - 60,
                  color: poop.color,
                  size: 7,
                  targetType: 'npc',
                  targetId: npc.id,
                  bonusPoints: earnedMischief,
                });

                floatingTextsRef.current.push({
                  id: `poop-hit-${Date.now()}`,
                  x: npc.x,
                  y: groundY - 80,
                  text: isContrastBonus ? `🌟 强烈对比捣蛋! +${earnedMischief}分!` : `🎯 命中${npc.name}! +${earnedMischief}分`,
                  subtext: isContrastBonus ? `${poop.color === 'white' ? '白屎沾深色大衣' : '黑屎沾浅色长裙'}` : '',
                  color: isContrastBonus ? '#facc15' : '#ffffff',
                  alpha: 1,
                  scale: isContrastBonus ? 1.35 : 1.1,
                  life: 60,
                });

                // File Citizen Complaint for direct hit
                recordCitizenComplaint({
                  citizenName: npc.name,
                  role: '空袭受害者',
                  avatarIcon: '😵',
                  title: '【严重抗议】高空飞弹正中头顶大衣！',
                  complaintText: `“毫无防备！天上一坨冰凉黏稠的鸟粪不偏不倚砸中我！我刚洗好的体面外套全毁了，一定要悬赏通缉这只黑羽暴徒！”`,
                  incidentType: 'poop_bomb_hat',
                  location: `露天广场 [X: ${Math.round(npc.x)}]`,
                });

                // Post-hit umbrella response: high chance to open umbrella or run to shop!
                const roll = Math.random();
                if (roll < 0.52) {
                  // Pops open folded umbrella!
                  npc.holdingUmbrella = true;
                  npc.umbrellaColor = ['#38bdf8', '#f43f5e', '#a855f7', '#10b981', '#fbbf24'][
                    Math.floor(Math.random() * 5)
                  ];
                  floatingTextsRef.current.push({
                    id: `umbrella-open-${Date.now()}`,
                    x: npc.x,
                    y: groundY - 100,
                    text: `☂️ ${npc.name} 慌忙撑开了随身雨伞！`,
                    color: '#38bdf8',
                    alpha: 1,
                    scale: 1.1,
                    life: 50,
                  });
                } else if (roll < 0.82) {
                  // Runs towards nearest building door to buy umbrella!
                  const nearestB = buildingsRef.current.reduce((prev, curr) =>
                    Math.abs(curr.x + curr.width / 2 - npc.x) < Math.abs(prev.x + prev.width / 2 - npc.x) ? curr : prev
                  );
                  npc.actionState = 'seeking_shelter';
                  npc.shelterTargetX = nearestB.x + nearestB.width / 2;
                  floatingTextsRef.current.push({
                    id: `shelter-run-${Date.now()}`,
                    x: npc.x,
                    y: groundY - 100,
                    text: `🏃 ${npc.name} 捂着头冲向小店买伞！`,
                    color: '#fbbf24',
                    alpha: 1,
                    scale: 1.1,
                    life: 50,
                  });
                }

                callbacksRef.current.onScoreUpdate(bankedScoreRef.current, carriedScoreRef.current, comboRef.current);
                dispatchHeadline(npc.name, 'poop', '大衣与头顶');
              }
            });
          }

          // 1c. Check Moving Traffic Vehicles (School Bus, Police Car, Postal Van, Classic Sedan, Delivery Truck)
          if (!poop.isSplattered) {
            trafficVehiclesRef.current.forEach((veh) => {
              if (poop.isSplattered) return;
              if (
                poop.x >= veh.x - veh.width / 2 &&
                poop.x <= veh.x + veh.width / 2 &&
                poop.y >= groundY - veh.height - 8 &&
                poop.y <= groundY - 8
              ) {
                poop.isSplattered = true;
                veh.roofSplatCount++;
                veh.poopDecals.push({
                  offsetX: poop.x - veh.x,
                  offsetY: 6,
                  color: poop.color,
                  size: 6.5,
                });

                const isContrast =
                  (poop.color === 'white' && veh.isDark) ||
                  (poop.color === 'black' && !veh.isDark);
                const vehPoints = isContrast ? 160 : 70;
                bankedScoreRef.current += vehPoints;
                poopHitCountRef.current++;
                soundManager.playPoopSplat(isContrast);
                soundManager.playHonkHorn();

                floatingTextsRef.current.push({
                  id: `poop-traffic-${Date.now()}`,
                  x: veh.x,
                  y: groundY - veh.height - 25,
                  text: isContrast ? `🌟 命中${veh.name}！强烈对比 +${vehPoints}分！` : `🚗 正中${veh.name}！+${vehPoints}分`,
                  subtext: isContrast ? '对比鲜明，车顶惨遭黑白轰炸！' : '',
                  color: isContrast ? '#facc15' : '#ffffff',
                  alpha: 1,
                  scale: 1.3,
                  life: 60,
                });

                // File Citizen Complaint for vehicle hit
                recordCitizenComplaint({
                  citizenName: veh.name,
                  role: '街头机动车队',
                  avatarIcon: '🚌',
                  title: `【公物受损】${veh.name}车顶惨遭生化飞弹轰炸！`,
                  complaintText: `“正在车道正常行驶中，突然天降大坨鸟粪，直接在车顶与挡风玻璃炸开！司机被迫狂喷雨刮水，严重影响安全驾驶，要求治安所严肃追责！”`,
                  incidentType: 'poop_bomb_car',
                  location: `街头车道 [X: ${Math.round(veh.x)}]`,
                });

                callbacksRef.current.onScoreUpdate(bankedScoreRef.current, carriedScoreRef.current, comboRef.current);
                dispatchHeadline(veh.name, 'poop', '车顶');
              }
            });
          }

          // 2a. Check Storefront Awnings (Bakery, Cafe, Florist canvas canopies)
          if (!poop.isSplattered) {
            buildingsRef.current.forEach((b) => {
              if (poop.isSplattered || !b.hasAwning) return;
              const awningY = groundY - 95;
              if (
                poop.x >= b.x + 8 &&
                poop.x <= b.x + b.width - 8 &&
                poop.y >= awningY - 8 &&
                poop.y <= awningY + 24
              ) {
                poop.isSplattered = true;
                const isContrast = poop.color === 'white';
                const awningMischief = isContrast ? 110 : 60;
                bankedScoreRef.current += awningMischief;
                soundManager.playPoopSplat(isContrast);

                poopDecalsRef.current.push({
                  id: `splat-awning-${Date.now()}`,
                  x: poop.x,
                  y: awningY + 6,
                  color: poop.color,
                  size: 6.5,
                  targetType: 'awning',
                  targetId: `awning-${b.x}`,
                  bonusPoints: awningMischief,
                });

                floatingTextsRef.current.push({
                  id: `poop-awning-${Date.now()}`,
                  x: poop.x,
                  y: awningY - 20,
                  text: isContrast ? `🌟 遮阳篷强烈对比! +${awningMischief}分!` : `🎪 啪嗒！正中商铺遮阳篷！+${awningMischief}分`,
                  color: isContrast ? '#facc15' : '#ffffff',
                  alpha: 1,
                  scale: 1.25,
                  life: 50,
                });

                callbacksRef.current.onScoreUpdate(bankedScoreRef.current, carriedScoreRef.current, comboRef.current);
              }
            });
          }

          // 2b. Check Outdoor Cafe Patio Umbrellas
          if (!poop.isSplattered) {
            lootItemsRef.current.forEach((item) => {
              if (poop.isSplattered || item.placement !== 'cafe_table') return;
              const canopyY = groundY - 96;
              if (
                Math.abs(poop.x - item.x) < 36 &&
                poop.y >= canopyY - 8 &&
                poop.y <= canopyY + 22
              ) {
                poop.isSplattered = true;
                const isContrast = poop.color === 'white';
                const cafeMischief = isContrast ? 120 : 70;
                bankedScoreRef.current += cafeMischief;
                soundManager.playPoopSplat(isContrast);

                poopDecalsRef.current.push({
                  id: `splat-cafe-umbrella-${Date.now()}`,
                  x: poop.x,
                  y: canopyY + 8,
                  color: poop.color,
                  size: 6.5,
                  targetType: 'awning',
                  targetId: `cafe-umb-${item.x}`,
                  bonusPoints: cafeMischief,
                });

                floatingTextsRef.current.push({
                  id: `poop-cafe-umb-${Date.now()}`,
                  x: item.x,
                  y: canopyY - 20,
                  text: `🌂 啪嗒！正中咖啡馆遮阳伞！+${cafeMischief}分`,
                  color: '#facc15',
                  alpha: 1,
                  scale: 1.25,
                  life: 50,
                });

                callbacksRef.current.onScoreUpdate(bankedScoreRef.current, carriedScoreRef.current, comboRef.current);
              }
            });
          }

          // 3. Check Vintage Car Roof collision (Contrast Scoring!)
          if (!poop.isSplattered) {
            obstaclesRef.current.forEach((obs) => {
              if (poop.isSplattered || obs.type !== 'vintage_car') return;
              if (
                poop.x >= obs.x &&
                poop.x <= obs.x + obs.width &&
                poop.y >= groundY - obs.height - 4 &&
                poop.y <= groundY - 10
              ) {
                poop.isSplattered = true;
                obs.hasPoopOnRoof = true;
                obs.poopColor = poop.color;

                const isContrast =
                  (poop.color === 'white' && obs.isDark) ||
                  (poop.color === 'black' && !obs.isDark);
                const carMischief = isContrast ? 150 : 50;
                bankedScoreRef.current += carMischief;
                soundManager.playPoopSplat(isContrast);

                poopDecalsRef.current.push({
                  id: `splat-car-${Date.now()}`,
                  x: poop.x,
                  y: groundY - obs.height + 4,
                  color: poop.color,
                  size: 7,
                  targetType: 'car',
                  targetId: obs.id,
                  bonusPoints: carMischief,
                });

                floatingTextsRef.current.push({
                  id: `poop-car-${Date.now()}`,
                  x: obs.x + obs.width / 2,
                  y: groundY - obs.height - 25,
                  text: isContrast ? `🌟 汽车强烈对比! +${carMischief}分!` : `🎯 命中汽车车顶! +${carMischief}分`,
                  subtext: isContrast
                    ? `${poop.color === 'white' ? '白屎命中藏青色车顶' : '黑屎命中奶黄色车顶'}`
                    : '',
                  color: isContrast ? '#facc15' : '#ffffff',
                  alpha: 1,
                  scale: 1.35,
                  life: 60,
                });

                callbacksRef.current.onScoreUpdate(bankedScoreRef.current, carriedScoreRef.current, comboRef.current);
              }
            });
          }

          // 4. Check Street Props (Mailbox, Streetlamp, Fountain)
          if (!poop.isSplattered) {
            obstaclesRef.current.forEach((obs) => {
              if (poop.isSplattered) return;
              if (obs.type === 'mailbox') {
                if (
                  poop.x >= obs.x - 4 &&
                  poop.x <= obs.x + obs.width + 4 &&
                  poop.y >= groundY - obs.height - 4 &&
                  poop.y <= groundY - 35
                ) {
                  poop.isSplattered = true;
                  bankedScoreRef.current += 90;
                  soundManager.playPoopSplat(false);
                  poopDecalsRef.current.push({
                    id: `splat-mailbox-${Date.now()}`,
                    x: poop.x,
                    y: groundY - obs.height + 4,
                    color: poop.color,
                    size: 6,
                    targetType: 'mailbox',
                    targetId: obs.id,
                    bonusPoints: 90,
                  });
                  floatingTextsRef.current.push({
                    id: `poop-mailbox-${Date.now()}`,
                    x: obs.x + obs.width / 2,
                    y: groundY - obs.height - 20,
                    text: '📬 啪嗒！命中皇家邮筒！+90分',
                    color: '#fde047',
                    alpha: 1,
                    scale: 1.2,
                    life: 50,
                  });
                  callbacksRef.current.onScoreUpdate(bankedScoreRef.current, carriedScoreRef.current, comboRef.current);
                }
              } else if (obs.type === 'streetlamp') {
                const lampCenterX = obs.x + obs.width / 2;
                if (
                  Math.abs(poop.x - lampCenterX) < 18 &&
                  poop.y >= groundY - obs.height - 6 &&
                  poop.y <= groundY - obs.height + 25
                ) {
                  poop.isSplattered = true;
                  bankedScoreRef.current += 110;
                  soundManager.playPoopSplat(true);
                  poopDecalsRef.current.push({
                    id: `splat-lamp-${Date.now()}`,
                    x: lampCenterX,
                    y: groundY - obs.height + 12,
                    color: poop.color,
                    size: 6,
                    targetType: 'streetlamp',
                    targetId: obs.id,
                    bonusPoints: 110,
                  });
                  floatingTextsRef.current.push({
                    id: `poop-lamp-${Date.now()}`,
                    x: lampCenterX,
                    y: groundY - obs.height - 20,
                    text: '💡 啪嗒！命中铸铁街灯！+110分',
                    color: '#facc15',
                    alpha: 1,
                    scale: 1.25,
                    life: 50,
                  });
                  callbacksRef.current.onScoreUpdate(bankedScoreRef.current, carriedScoreRef.current, comboRef.current);
                }
              } else if (obs.type === 'fountain') {
                const fountainCenterX = obs.x + obs.width / 2;
                if (
                  Math.abs(poop.x - fountainCenterX) < 55 &&
                  poop.y >= groundY - 30 &&
                  poop.y <= groundY - 8
                ) {
                  poop.isSplattered = true;
                  bankedScoreRef.current += 70;
                  soundManager.playPoopSplat(false);
                  for (let w = 0; w < 6; w++) {
                    particlesRef.current.push({
                      x: poop.x,
                      y: groundY - 14,
                      vx: (Math.random() - 0.5) * 3,
                      vy: -1.5 - Math.random() * 2.5,
                      size: 3 + Math.random() * 2,
                      color: '#e0f2fe',
                      alpha: 1,
                      life: 0,
                      maxLife: 25,
                      type: 'water',
                    });
                  }
                  floatingTextsRef.current.push({
                    id: `poop-fountain-${Date.now()}`,
                    x: fountainCenterX,
                    y: groundY - 45,
                    text: '⛲ 噗通！掉进喷泉池水花四溅！+70分',
                    color: '#38bdf8',
                    alpha: 1,
                    scale: 1.2,
                    life: 50,
                  });
                  callbacksRef.current.onScoreUpdate(bankedScoreRef.current, carriedScoreRef.current, comboRef.current);
                }
              }
            });
          }

          // 5. Check Building Roofs (ONLY if bird was flying ABOVE the eaves when dropped!)
          if (!poop.isSplattered) {
            buildingsRef.current.forEach((b) => {
              if (poop.isSplattered) return;
              const roofY = groundY - b.height;
              // If dropped below eaves height, bird is in the foreground street airspace, so poop falls to ground/pedestrians/cars!
              if (
                poop.dropY < roofY &&
                poop.x >= b.x &&
                poop.x <= b.x + b.width &&
                poop.y >= roofY - 6 &&
                poop.y <= roofY + 12
              ) {
                poop.isSplattered = true;
                const isContrast =
                  (poop.color === 'white' && b.isDark) ||
                  (poop.color === 'black' && !b.isDark);
                const roofMischief = isContrast ? 120 : 40;
                bankedScoreRef.current += roofMischief;
                soundManager.playPoopSplat(isContrast);

                poopDecalsRef.current.push({
                  id: `splat-roof-${Date.now()}`,
                  x: poop.x,
                  y: roofY + 4,
                  color: poop.color,
                  size: 6.5,
                  targetType: 'building',
                  targetId: `roof-${b.x}`,
                  bonusPoints: roofMischief,
                });

                floatingTextsRef.current.push({
                  id: `poop-roof-${Date.now()}`,
                  x: poop.x,
                  y: roofY - 20,
                  text: isContrast ? `🌟 屋顶瓦片强烈对比! +${roofMischief}分!` : `🏠 正中建筑屋顶！+${roofMischief}分`,
                  color: isContrast ? '#facc15' : '#ffffff',
                  alpha: 1,
                  scale: 1.25,
                  life: 50,
                });

                callbacksRef.current.onScoreUpdate(bankedScoreRef.current, carriedScoreRef.current, comboRef.current);
              }
            });
          }

          // 6. Check Ground Cobblestone collision (Contrast Scoring!)
          if (!poop.isSplattered && poop.y >= groundY - 6) {
            poop.isSplattered = true;
            const stoneIndex = Math.floor(poop.x / 28);
            const isDarkStone = stoneIndex % 2 === 0;
            const isContrast =
              (poop.color === 'white' && isDarkStone) ||
              (poop.color === 'black' && !isDarkStone);

            const groundMischief = isContrast ? 80 : 40;
            bankedScoreRef.current += groundMischief;
            soundManager.playPoopSplat(isContrast);

            poopDecalsRef.current.push({
              id: `splat-ground-${Date.now()}`,
              x: poop.x,
              y: groundY - 4,
              color: poop.color,
              size: 6,
              targetType: 'ground',
              bonusPoints: groundMischief,
            });

            floatingTextsRef.current.push({
              id: `poop-ground-${Date.now()}`,
              x: poop.x,
              y: groundY - 22,
              text: isContrast ? `🌟 石板路面色差对比! +${groundMischief}分!` : `🎯 啪嗒！砸在石板路上！+${groundMischief}分`,
              color: isContrast ? '#facc15' : '#ffffff',
              alpha: 1,
              scale: isContrast ? 1.25 : 1,
              life: 45,
            });

            callbacksRef.current.onScoreUpdate(bankedScoreRef.current, carriedScoreRef.current, comboRef.current);
          }

          // Check Town Chaos mission goal completion
          if (missionRef.current.type === 'town_chaos' && !missionRef.current.isCompleted) {
            if (bankedScoreRef.current >= missionRef.current.targetScore) {
              const updated = { ...missionRef.current, isCompleted: true };
              missionRef.current = updated;
              callbacksRef.current.onMissionUpdate(updated);
            }
          }
        });
        poopProjectilesRef.current = poopProjectilesRef.current.filter((p) => !p.isSplattered);

        // Check Loot Collisions
        lootItemsRef.current.forEach((item) => {
          if (item.collected) return;
          const dist = Math.hypot(player.x - item.x, player.y - item.y);
          if (dist < GAME_PHYSICS.LOOT_COLLECT_RADIUS) {
            item.collected = true;
            const config = LOOT_CONFIGS[item.type];

            comboRef.current++;
            comboTimerRef.current = 2.4;

            // Fountain Sip
            if (item.type === 'fountain_sip') {
              soundManager.playWaterSplash();
              player.speedBoostTimer = 180;
              const earnedPoints = config.points * comboRef.current;
              carriedScoreRef.current += earnedPoints;

              floatingTextsRef.current.push({
                id: `sip-${Date.now()}`,
                x: item.x,
                y: item.y - 20,
                text: '💧 咕嘟咕嘟! 畅饮泉水!',
                subtext: `+${earnedPoints}G · 羽翼生风清爽冲刺!`,
                color: '#38bdf8',
                alpha: 1,
                scale: 1.3,
                life: 60,
              });

              callbacksRef.current.onScoreUpdate(bankedScoreRef.current, carriedScoreRef.current, comboRef.current);
              return;
            }

            const isGem = config.category === 'shiny' && (item.type === 'sparkle_gem' || item.type === 'gold_brooch');
            soundManager.playLootPickup(isGem, comboRef.current);

            // Startle nearby NPC
            npcsRef.current.forEach((npc) => {
              if (Math.abs(npc.x - item.x) < 120) {
                npc.state = 'startled';
                npc.startleTimer = 100;
              }
            });

            if (config.category === 'food') {
              soundManager.playCroissantCrunch();
              player.stamina = Math.min(player.maxStamina, player.stamina + (item.type === 'croissant' ? 45 : 30));
              player.isExhausted = false;
              player.digestionQueueCount += (item.type === 'croissant' ? 2 : 1);
              if (item.type === 'croissant') player.speedBoostTimer = 180;
              else if (item.type === 'red_apple') player.speedBoostTimer = 120;
            } else if (config.category === 'buff' && item.type === 'potion_bottle') {
              player.state = 'REBOUNDING';
              player.vy = -9;
              player.invincibleTimer = 180;
              player.stamina = 100;
              player.isExhausted = false;
              soundManager.playBalloonBank();
            }

            const earnedPoints = config.points * comboRef.current;
            carriedScoreRef.current += earnedPoints;

            // Maximum 3 treasures limit: auto-release 4th item ("宝物达到三个后，获得第四个时，就会自动放飞")
            if (player.currentLoot.length >= 3) {
              const released = player.currentLoot.shift();
              if (released) {
                soundManager.playTreasureRelease();
                player.totalWeight -= released.weight;
                floatingTextsRef.current.push({
                  id: `release-${Date.now()}`,
                  x: player.x,
                  y: player.y - 35,
                  text: `🪶 爪子抓不下了(上限3件)！放飞了【${released.name}】✨`,
                  color: '#fde047',
                  alpha: 1,
                  scale: 1.25,
                  life: 55,
                });
                for (let i = 0; i < 8; i++) {
                  particlesRef.current.push({
                    x: player.x,
                    y: player.y,
                    vx: (Math.random() - 0.5) * 4,
                    vy: -2 - Math.random() * 3,
                    size: 5,
                    color: released.sparkleColor || '#facc15',
                    alpha: 1,
                    life: 0,
                    maxLife: 40,
                    type: 'sparkle',
                  });
                }
              }
            }

            player.currentLoot.push(config);
            stolenItemsRef.current.push(config);
            player.totalWeight += config.weight;

            floatingTextsRef.current.push({
              id: `ft-${Date.now()}-${Math.random()}`,
              x: item.x,
              y: item.y - 18,
              text: `+${earnedPoints}G · ${config.name}`,
              subtext: `拾自[${config.contextHint}] · +${config.weight}kg`,
              color: config.sparkleColor,
              alpha: 1,
              scale: Math.min(1 + comboRef.current * 0.08, 1.6),
              life: 55,
            });

            callbacksRef.current.onScoreUpdate(bankedScoreRef.current, carriedScoreRef.current, comboRef.current);
            callbacksRef.current.onWeightUpdate(player.totalWeight, player.birdConfig.maxWeight);
            callbacksRef.current.onLootUpdate(
              player.currentLoot.map((l) => ({
                type: l.type,
                points: l.points,
                weight: l.weight,
                name: l.name,
                icon: l.icon,
              }))
            );
          }
        });

        // Check Obstacle Collisions (Storefront glass)
        obstaclesRef.current.forEach((obs) => {
          if (obs.type === 'tree') {
            const dx = Math.abs(player.x - obs.x);
            const dy = Math.abs(player.y - (obs.y - 40));
            if (dx < 70 && dy < 90) obs.opacity = Math.max(0.35, (obs.opacity ?? 1.0) - 0.08);
            else obs.opacity = Math.min(1.0, (obs.opacity ?? 1.0) + 0.05);
          }

          if (obs.type === 'glass_storefront' && !obs.passable && player.invincibleTimer <= 0) {
            const inX = player.x + 18 > obs.x && player.x - 18 < obs.x + obs.width;
            const inY = player.y + 16 > obs.y && player.y - 16 < obs.y + obs.height;

            if (inX && inY && player.state !== 'STUNNED') {
              player.state = 'STUNNED';
              player.stunTimer = 65;
              player.vx = -player.facing * 2;
              player.vy = 2;
              screenShakeRef.current = 14;
              soundManager.playBonk();

              floatingTextsRef.current.push({
                id: `bonk-${Date.now()}`,
                x: player.x,
                y: player.y - 40,
                text: '💥 BONK! 撞到橱窗玻璃!',
                color: '#facc15',
                alpha: 1,
                scale: 1.4,
                life: 50,
              });
            }
          }
        });

        // Update particles & texts
        particlesRef.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.life++;
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);
        });
        particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);

        floatingTextsRef.current.forEach((ft) => {
          ft.y -= 1.1;
          ft.life--;
          ft.alpha = Math.max(0, ft.life / 50);
        });
        floatingTextsRef.current = floatingTextsRef.current.filter((ft) => ft.life > 0);

        if (screenShakeRef.current > 0) {
          screenShakeRef.current *= 0.88;
          if (screenShakeRef.current < 0.2) screenShakeRef.current = 0;
        }

        // Notify altitude percentage
        const altitudeNormalized = Math.max(0, Math.min(100, Math.round(((groundY - player.y) / (groundY - 50)) * 100)));
        const cruiseNormalized = Math.round(((groundY - cruiseY) / (groundY - 50)) * 100);
        if (Math.abs(altitudeNormalized - lastAltitudeRef.current) >= 1) {
          lastAltitudeRef.current = altitudeNormalized;
          callbacksRef.current.onAltitudeUpdate(altitudeNormalized, cruiseNormalized);
        }
      }

      // ==========================================
      // 2. RENDERING PASS (Naif Storybook Sandbox)
      // ==========================================
      ctx.save();

      if (screenShakeRef.current > 0) {
        const sx = (Math.random() - 0.5) * screenShakeRef.current;
        const sy = (Math.random() - 0.5) * screenShakeRef.current;
        ctx.translate(sx, sy);
      }

      // Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#bae6fd');
      skyGrad.addColorStop(0.4, '#e0f2fe');
      skyGrad.addColorStop(0.75, '#fef08a');
      skyGrad.addColorStop(1, '#fde68a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Cruising Altitude Marker Line
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.moveTo(0, cruiseY);
      ctx.lineTo(width, cruiseY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      const camX = cameraXRef.current;

      // 1. Distant Parallax: Clouds & Far Skyline Architecture (Parallax 0.22)
      ctx.save();
      ctx.translate(-camX * 0.35, 0);
      cloudsRef.current.forEach((c) => drawCloud(ctx, c));
      ctx.restore();

      // Far Background Skyline (Churches, windmills, pastel rooftops, clock belfries)
      const farCam = camX * 0.22;
      ctx.save();
      ctx.translate(-farCam, 0);
      backgroundBuildingsRef.current
        .filter((bg) => bg.layer === 'far')
        .forEach((bg) => {
          if (bg.x + bg.width > farCam - 150 && bg.x < farCam + width + 150) {
            drawBackgroundBuilding(ctx, bg, bg.x, groundY, time);
          }
        });
      ctx.restore();

      drawWindStreaks(ctx, time, 0, width);

      // 2. Midground Rolling Hills
      const hillCam = camX * 0.35;
      ctx.save();
      ctx.fillStyle = '#86efac';
      for (let i = -1; i < 7; i++) {
        const hillX = i * 450 - (hillCam % 450);
        ctx.beginPath();
        ctx.arc(hillX + 225, groundY + 120, 320, Math.PI, 0);
        ctx.fill();
      }
      ctx.restore();

      // 3. Mid-Depth Townhouses (Parallax 0.55 - Timber frame houses, dormer attics, chimneys)
      const midCam = camX * 0.55;
      ctx.save();
      ctx.translate(-midCam, 0);
      backgroundBuildingsRef.current
        .filter((bg) => bg.layer === 'mid' || !bg.layer)
        .forEach((bg) => {
          if (bg.x + bg.width > midCam - 150 && bg.x < midCam + width + 150) {
            drawBackgroundBuilding(ctx, bg, bg.x, groundY, time);
          }
        });
      ctx.restore();

      // Foreground World Space
      ctx.save();
      ctx.translate(-camX, 0);

      // Cobblestone ground
      ctx.fillStyle = '#78716c';
      ctx.fillRect(camX - 100, groundY, width + 400, height - groundY);
      ctx.fillStyle = '#a8a29e';
      ctx.fillRect(camX - 100, groundY, width + 400, 8);

      // Cobblestone stones
      ctx.strokeStyle = '#57534e';
      ctx.lineWidth = 1;
      const cobbleStart = Math.floor((camX - 50) / 28) * 28;
      for (let cx = cobbleStart; cx < camX + width + 50; cx += 28) {
        ctx.strokeRect(cx, groundY + 8, 24, 12);
        ctx.strokeRect(cx + 12, groundY + 24, 24, 12);
      }

      // Draw Buildings
      buildingsRef.current.forEach((b) => {
        if (b.x + b.width > camX - 100 && b.x < camX + width + 100) {
          drawBuilding(ctx, b, b.x, groundY);
        }
      });

      // Draw Street Props (Tables, Benches, Picnic, Bikes)
      lootItemsRef.current.forEach((item) => {
        if (item.x > camX - 100 && item.x < camX + width + 100) {
          if (item.placement === 'cafe_table') drawCafePatioTable(ctx, item.x, groundY);
          else if (item.placement === 'bakery_tray') drawBakeryStand(ctx, item.x, groundY);
          else if (item.placement === 'park_bench') drawParkBench(ctx, item.x, groundY);
          else if (item.placement === 'picnic_blanket') drawPicnicBlanket(ctx, item.x, groundY);
          else if (item.placement === 'bicycle_basket') drawVintageBicycle(ctx, item.x, groundY);
        }
      });

      // Draw Obstacles (Fountain, Glass Storefront, Trees, Mailbox, Archway, Vintage Cars, Streetlamps)
      obstaclesRef.current.forEach((obs) => {
        if (obs.x + obs.width > camX - 100 && obs.x < camX + width + 100) {
          if (obs.type === 'fountain') {
            drawFountain(ctx, obs.x + obs.width / 2, groundY, time);
          } else if (obs.type === 'glass_storefront') {
            drawStorefrontGlass(ctx, obs.x, obs.y, obs.width, obs.height, time);
          } else if (obs.type === 'mailbox') {
            drawMailbox(ctx, obs.x, obs.y, missionRef.current.mailDelivered ?? false);
          } else if (obs.type === 'archway') {
            drawArchway(ctx, obs.x, obs.y, obs.width, obs.height);
          } else if (obs.type === 'tree') {
            drawTree(ctx, obs.x + obs.width / 2, groundY, obs.opacity ?? 1.0);
          } else if (obs.type === 'vintage_car') {
            drawVintageCar(ctx, obs, groundY);
          } else if (obs.type === 'streetlamp') {
            drawStreetlamp(ctx, obs, groundY);
          }
        }
      });

      // Draw Moving Street Traffic Vehicles (School Bus, Police Car, Postal Van, Classic Sedan, Delivery Truck, Cyclist)
      trafficVehiclesRef.current.forEach((veh) => {
        if (veh.x + veh.width > camX - 140 && veh.x - veh.width < camX + width + 140) {
          drawTrafficVehicle(ctx, veh, groundY, time);
        }
      });

      // Draw Poop Decals stuck on surfaces
      poopDecalsRef.current.forEach((decal) => {
        if (decal.x > camX - 100 && decal.x < camX + width + 100) {
          drawPoopDecal(ctx, decal);
        }
      });

      // Draw Town NPCs
      npcsRef.current.forEach((npc) => {
        if (npc.x > camX - 100 && npc.x < camX + width + 100) {
          drawTownNPC(ctx, npc, groundY, time);
        }
      });

      // Draw Contextual Loot Items
      lootItemsRef.current.forEach((item) => {
        if (!item.collected && item.x > camX - 60 && item.x < camX + width + 60) {
          drawContextualLoot(ctx, item, time);
        }
      });

      // Draw Poop Dropping in Flight
      poopProjectilesRef.current.forEach((poop) => {
        drawPoopProjectile(ctx, poop);
      });

      // Draw Floating Balloon Packets soaring away
      balloonPacketsRef.current.forEach((bp) => {
        drawFloatingBalloonPacket(ctx, bp, time);
      });

      // Draw Crow Player Flight Trails
      if (player.trailPoints.length > 1) {
        ctx.save();
        ctx.strokeStyle = player.speedBoostTimer > 0 ? 'rgba(251, 191, 36, 0.7)' : 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = player.speedBoostTimer > 0 ? 5 : 3;
        ctx.beginPath();
        player.trailPoints.forEach((tp, idx) => {
          if (idx === 0) ctx.moveTo(tp.x, tp.y);
          else ctx.lineTo(tp.x, tp.y);
        });
        ctx.stroke();
        ctx.restore();
      }

      // Draw Crow Character (With Bidirectional Facing & Perching)
      drawCrowPlayer(ctx, player, time);

      // Draw Particles & Texts
      drawParticles(ctx, particlesRef.current);
      drawFloatingTexts(ctx, floatingTextsRef.current);

      ctx.restore(); // Exit foreground

      // Draw Slingshot Catapult Aiming Overlay (Screen Space)
      if (player.isDragging) {
        const screenPlayer: CrowPlayer = {
          ...player,
          x: player.x - camX,
        };
        drawSlingshotAiming(ctx, screenPlayer, cruiseY, groundY);
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Pointer / Touch Drag & Slingshot Controls
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Auto start BGM on first user interaction gesture if audio enabled
    if (soundManager.enabled && !soundManager.isBgmPlaying()) {
      soundManager.startBGM();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = canvas.width / rect.width;
    const x = (e.clientX - rect.left) * dpr;
    const y = (e.clientY - rect.top) * dpr;

    const player = playerRef.current;
    player.isDragging = true;
    player.dragStartX = x;
    player.dragStartY = y;
    player.dragCurrentX = x;
    player.dragCurrentY = y;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const player = playerRef.current;
    if (!player.isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = canvas.width / rect.width;
    const x = (e.clientX - rect.left) * dpr;
    const y = (e.clientY - rect.top) * dpr;

    const dx = player.dragStartX - x;
    const dy = player.dragStartY - y;
    const dist = Math.hypot(dx, dy);

    if (dist > GAME_PHYSICS.MAX_DRAG_DISTANCE) {
      const angle = Math.atan2(dy, dx);
      player.dragCurrentX = player.dragStartX - Math.cos(angle) * GAME_PHYSICS.MAX_DRAG_DISTANCE;
      player.dragCurrentY = player.dragStartY - Math.sin(angle) * GAME_PHYSICS.MAX_DRAG_DISTANCE;
    } else {
      player.dragCurrentX = x;
      player.dragCurrentY = y;
    }
  };

  const handlePointerUp = () => {
    const player = playerRef.current;
    if (!player.isDragging) return;
    player.isDragging = false;

    const dx = player.dragStartX - player.dragCurrentX;
    const dy = player.dragStartY - player.dragCurrentY;
    const dist = Math.hypot(dx, dy);

    if (dist >= GAME_PHYSICS.MIN_DRAG_DISTANCE && player.state !== 'STUNNED') {
      const powerRatio = dist / GAME_PHYSICS.MAX_DRAG_DISTANCE;

      // Check stamina before slingshot launch ("弹射飞行会耗费体力")
      if (player.stamina < 10 || player.isExhausted) {
        soundManager.playExhaustedPuff();
        floatingTextsRef.current.push({
          id: `no-stamina-${Date.now()}`,
          x: player.x,
          y: player.y - 30,
          text: '💦 翅膀酸痛！歇息一下再弹射吧',
          color: '#f43f5e',
          alpha: 1,
          scale: 1.2,
          life: 45,
        });
        return;
      }

      // Consumes stamina on slingshot launch
      const staminaCost = 14 * powerRatio;
      player.stamina = Math.max(0, player.stamina - staminaCost);
      if (player.stamina <= 0) player.isExhausted = true;

      soundManager.playDiveWhoosh(powerRatio);

      // Realistic launch vector: can shoot LEFT or RIGHT!
      player.vx = dx * 0.14;
      player.vy = Math.max(3.5, dy * 0.18);
      player.facing = player.vx < 0 ? -1 : 1;
      player.state = 'DIVING';
    }
  };

  // Keyboard accessibility & steering:
  // Space / B: Balloon Bank (or take off if perched)
  // P: White Poop, O: Black Poop
  // L: Land / Perch / Take off
  // D: Deliver Letter (if near mailbox) or steer right / hop right
  // A / Left Arrow: steer left / hop left
  // Right Arrow: steer right / hop right
  // W / Up Arrow: take off
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const player = playerRef.current;
      if (e.code === 'Space' || e.code === 'KeyB') {
        e.preventDefault();
        if (player.state === 'PERCHED') {
          triggerTogglePerch();
        } else {
          triggerBalloonPack();
        }
      } else if (e.code === 'KeyP') {
        e.preventDefault();
        triggerDropPoop('white');
      } else if (e.code === 'KeyO') {
        e.preventDefault();
        triggerDropPoop('black');
      } else if (e.code === 'KeyL') {
        e.preventDefault();
        triggerTogglePerch();
      } else if (e.code === 'KeyD') {
        e.preventDefault();
        const mailbox = mailboxPosRef.current;
        const dist = Math.hypot(player.x - mailbox.x, player.y - mailbox.y);
        if (dist < 120 && player.hasMailLetter) {
          triggerDeliverMail();
        } else if (player.state === 'PERCHED') {
          player.x = Math.min(SANDBOX_MAP_WIDTH - 120, player.x + 16);
          player.facing = 1;
        } else if (player.state === 'CRUISING') {
          player.facing = 1;
          player.vx = GAME_PHYSICS.CRUISE_SPEED_BASE;
        }
      } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        e.preventDefault();
        if (player.state === 'PERCHED') {
          player.x = Math.max(120, player.x - 16);
          player.facing = -1;
        } else if (player.state === 'CRUISING') {
          player.facing = -1;
          player.vx = -GAME_PHYSICS.CRUISE_SPEED_BASE;
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (player.state === 'PERCHED') {
          player.x = Math.min(SANDBOX_MAP_WIDTH - 120, player.x + 16);
          player.facing = 1;
        } else if (player.state === 'CRUISING') {
          player.facing = 1;
          player.vx = GAME_PHYSICS.CRUISE_SPEED_BASE;
        }
      } else if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (player.state === 'PERCHED') {
          triggerTogglePerch();
        }
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        soundManager.toggleBGM();
      }

      // Auto start BGM on first key gesture if audio enabled
      if (soundManager.enabled && !soundManager.isBgmPlaying()) {
        soundManager.startBGM();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerBalloonPack, triggerDropPoop, triggerTogglePerch, triggerDeliverMail]);

  return (
    <div className="relative w-full h-full overflow-hidden cursor-crosshair select-none touch-none">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full block"
      />
    </div>
  );
};
