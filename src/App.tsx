/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { TownGazette } from './components/TownGazette';
import { SettlementModal } from './components/SettlementModal';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { HelpModal } from './components/HelpModal';
import { MissionSelectModal, MISSION_PRESETS } from './components/MissionSelectModal';
import { BIRD_CONFIGS } from './utils/constants';
import {
  BirdConfig,
  BirdId,
  CitizenComplaint,
  MissionGoal,
  SettlementSummaryData,
  TownNewsHeadline,
} from './types/game';
import { soundManager } from './audio/soundEffects';

interface LootSummary {
  type: string;
  points: number;
  weight: number;
  name: string;
  icon: string;
}

export default function App() {
  const [currentBird, setCurrentBird] = useState<BirdConfig>(BIRD_CONFIGS.crow);
  const [activeMission, setActiveMission] = useState<MissionGoal>(MISSION_PRESETS.mail_delivery);
  const [bankedScore, setBankedScore] = useState<number>(0);
  const [carriedScore, setCarriedScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [currentWeight, setCurrentWeight] = useState<number>(BIRD_CONFIGS.crow.baseWeight);
  const [maxWeight, setMaxWeight] = useState<number>(BIRD_CONFIGS.crow.maxWeight);
  const [lootList, setLootList] = useState<LootSummary[]>([]);
  const [currentAltitude, setCurrentAltitude] = useState<number>(78);
  const [cruiseAltitude, setCruiseAltitude] = useState<number>(78);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [bgmEnabled, setBgmEnabled] = useState<boolean>(true);

  // Stamina & Exhaustion State
  const [stamina, setStamina] = useState<number>(100);
  const [maxStamina, setMaxStamina] = useState<number>(100);
  const [isExhausted, setIsExhausted] = useState<boolean>(false);

  // Poop Ammo & Digestion State
  const [poopAmmo, setPoopAmmo] = useState<number>(3);
  const [maxPoopAmmo, setMaxPoopAmmo] = useState<number>(6);
  const [isDigesting, setIsDigesting] = useState<boolean>(false);
  const [digestionQueueCount, setDigestionQueueCount] = useState<number>(0);

  // Real-time Citizen Complaints & Gazette News
  const [complaints, setComplaints] = useState<CitizenComplaint[]>([]);
  const [latestComplaint, setLatestComplaint] = useState<CitizenComplaint | null>(null);
  const [headlines, setHeadlines] = useState<TownNewsHeadline[]>([]);
  const [latestHeadline, setLatestHeadline] = useState<TownNewsHeadline | null>(null);

  // Settlement View State
  const [showSettlement, setShowSettlement] = useState<boolean>(false);
  const [settlementData, setSettlementData] = useState<SettlementSummaryData | null>(null);

  // Modals
  const [showCharacterSelect, setShowCharacterSelect] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showMissionSelect, setShowMissionSelect] = useState<boolean>(false);

  // Trigger refs
  const balloonTriggerRef = useRef<(() => void) | null>(null);
  const resetTriggerRef = useRef<(() => void) | null>(null);
  const poopTriggerRef = useRef<((color?: 'white' | 'black') => void) | null>(null);
  const landTriggerRef = useRef<(() => void) | null>(null);
  const deliverMailRef = useRef<(() => void) | null>(null);
  const getSettlementDataRef = useRef<(() => SettlementSummaryData) | null>(null);

  const handleScoreUpdate = useCallback((banked: number, carried: number, curCombo: number) => {
    setBankedScore(banked);
    setCarriedScore(carried);
    setCombo(curCombo);
  }, []);

  const handleWeightUpdate = useCallback((weight: number, max: number) => {
    setCurrentWeight((prev) => (Math.abs(prev - weight) > 0.001 ? weight : prev));
    setMaxWeight((prev) => (prev === max ? prev : max));
  }, []);

  const handleLootUpdate = useCallback((items: LootSummary[]) => {
    setLootList(items);
  }, []);

  const handleAltitudeUpdate = useCallback((altitude: number, cruise: number) => {
    setCurrentAltitude((prev) => (prev === altitude ? prev : altitude));
    setCruiseAltitude((prev) => (prev === cruise ? prev : cruise));
  }, []);

  const handleMissionUpdate = useCallback((updated: MissionGoal) => {
    setActiveMission(updated);
  }, []);

  const handleStaminaUpdate = useCallback((curStamina: number, curMaxStamina: number, exhausted: boolean) => {
    setStamina(curStamina);
    setMaxStamina(curMaxStamina);
    setIsExhausted(exhausted);
  }, []);

  const handlePoopAmmoUpdate = useCallback(
    (ammo: number, maxAmmo: number, digesting: boolean, queueCount: number) => {
      setPoopAmmo(ammo);
      setMaxPoopAmmo(maxAmmo);
      setIsDigesting(digesting);
      setDigestionQueueCount(queueCount);
    },
    []
  );

  const handleAddComplaint = useCallback((complaint: CitizenComplaint) => {
    setComplaints((prev) => [complaint, ...prev.slice(0, 49)]);
    setLatestComplaint(complaint);
    // Auto dismiss complaint ticker popup after 6.5s
    setTimeout(() => {
      setLatestComplaint((cur) => (cur?.id === complaint.id ? null : cur));
    }, 6500);
  }, []);

  const handleSelectMission = useCallback((mission: MissionGoal) => {
    setActiveMission(mission);
    if (resetTriggerRef.current) {
      resetTriggerRef.current();
    }
  }, []);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      soundManager.enabled = next;
      return next;
    });
  }, []);

  const handleToggleBGM = useCallback(() => {
    setBgmEnabled((prev) => {
      const next = !prev;
      if (next) {
        soundManager.startBGM();
      } else {
        soundManager.stopBGM();
      }
      return next;
    });
  }, []);

  const handleAddHeadline = useCallback((headline: TownNewsHeadline) => {
    setHeadlines((prev) => [headline, ...prev.slice(0, 49)]);
    setLatestHeadline(headline);
    // Auto dismiss the latest news pop banner after 6.5s
    setTimeout(() => {
      setLatestHeadline((cur) => (cur?.id === headline.id ? null : cur));
    }, 6500);
  }, []);

  const handleSelectBird = useCallback((bird: BirdConfig) => {
    setCurrentBird(bird);
  }, []);

  const handleResetGame = useCallback(() => {
    if (resetTriggerRef.current) {
      resetTriggerRef.current();
    }
  }, []);

  const handleTriggerBalloon = useCallback(() => {
    if (balloonTriggerRef.current) {
      balloonTriggerRef.current();
    }
  }, []);

  const handleDropPoop = useCallback((color: 'white' | 'black') => {
    if (poopTriggerRef.current) {
      poopTriggerRef.current(color);
    }
  }, []);

  const handleTogglePerch = useCallback(() => {
    if (landTriggerRef.current) {
      landTriggerRef.current();
    }
  }, []);

  const handleDeliverMail = useCallback(() => {
    if (deliverMailRef.current) {
      deliverMailRef.current();
    }
  }, []);

  // Open Settlement Modal: calculate aggregated gazette summary & show crow's nest
  const handleOpenSettlement = useCallback(() => {
    if (getSettlementDataRef.current) {
      const data = getSettlementDataRef.current();
      setSettlementData(data);
    } else {
      setSettlementData({
        totalVictims: 0,
        victimNames: [],
        stolenItems: [],
        poopHitCount: 0,
        vehicleHitCount: 0,
        totalScore: bankedScore + carriedScore,
        complaints: complaints,
        nestJewelryCount: lootList.length,
        headlineArticle: '今日晨曦小镇难得享受了片刻宁静，空中怪盗飞禽尚未在街头制造大轰动。',
      });
    }
    setShowSettlement(true);
  }, [bankedScore, carriedScore, complaints, lootList.length]);

  return (
    <main className="relative w-screen h-screen bg-stone-900 overflow-hidden flex items-center justify-center select-none">
      <div className="relative w-full h-full max-w-[1920px] max-h-[1080px] bg-stone-800 shadow-2xl overflow-hidden">
        {/* Game Canvas with 60FPS Physics Engine */}
        <GameCanvas
          birdConfig={currentBird}
          isPlaying={true}
          activeMission={activeMission}
          onMissionUpdate={handleMissionUpdate}
          onScoreUpdate={handleScoreUpdate}
          onWeightUpdate={handleWeightUpdate}
          onLootUpdate={handleLootUpdate}
          onAltitudeUpdate={handleAltitudeUpdate}
          onBalloonTriggerRef={balloonTriggerRef}
          onResetTriggerRef={resetTriggerRef}
          onPoopTriggerRef={poopTriggerRef}
          onLandTriggerRef={landTriggerRef}
          onDeliverMailRef={deliverMailRef}
          onAddHeadline={handleAddHeadline}
          onAddComplaint={handleAddComplaint}
          onStaminaUpdate={handleStaminaUpdate}
          onPoopAmmoUpdate={handlePoopAmmoUpdate}
          onGetSettlementDataRef={getSettlementDataRef}
        />

        {/* Real-time Side Town Gazette Mailbox & Complaints Notification */}
        <TownGazette
          complaints={complaints}
          latestComplaint={latestComplaint}
          headlines={headlines}
          latestHeadline={latestHeadline}
          onOpenSettlement={handleOpenSettlement}
        />

        {/* Cozy Flat UI HUD Layer */}
        <GameHUD
          birdConfig={currentBird}
          bankedScore={bankedScore}
          carriedScore={carriedScore}
          combo={combo}
          currentWeight={currentWeight}
          maxWeight={maxWeight}
          lootList={lootList}
          currentAltitude={currentAltitude}
          cruiseAltitude={cruiseAltitude}
          soundEnabled={soundEnabled}
          bgmEnabled={bgmEnabled}
          activeMission={activeMission}
          stamina={stamina}
          maxStamina={maxStamina}
          isExhausted={isExhausted}
          poopAmmo={poopAmmo}
          maxPoopAmmo={maxPoopAmmo}
          isDigesting={isDigesting}
          digestionQueueCount={digestionQueueCount}
          onChangeMission={() => setShowMissionSelect(true)}
          onToggleSound={handleToggleSound}
          onToggleBGM={handleToggleBGM}
          onOpenCharacterSelect={() => setShowCharacterSelect(true)}
          onOpenHelp={() => setShowHelp(true)}
          onResetGame={handleResetGame}
          onTriggerBalloon={handleTriggerBalloon}
          onDropPoop={handleDropPoop}
          onTogglePerch={handleTogglePerch}
          onDeliverMail={handleDeliverMail}
          onOpenSettlement={handleOpenSettlement}
        />

        {/* Settlement Screen: Crow's Nest with Stolen Hoard & Aggregated Gazette Newspaper */}
        {showSettlement && settlementData && (
          <SettlementModal
            birdConfig={currentBird}
            settlementData={settlementData}
            onClose={() => setShowSettlement(false)}
            onPlayAgain={() => {
              setShowSettlement(false);
              handleResetGame();
            }}
          />
        )}

        {/* Modals */}
        {showMissionSelect && (
          <MissionSelectModal
            currentMissionType={activeMission.type}
            onSelectMission={handleSelectMission}
            onClose={() => setShowMissionSelect(false)}
          />
        )}

        {showCharacterSelect && (
          <CharacterSelectModal
            currentBirdId={currentBird.id as BirdId}
            onSelectBird={handleSelectBird}
            onClose={() => setShowCharacterSelect(false)}
          />
        )}

        {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      </div>
    </main>
  );
}
