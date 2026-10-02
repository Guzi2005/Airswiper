import React from 'react';
import {
  Volume2,
  VolumeX,
  Feather,
  HelpCircle,
  RotateCcw,
  Send,
  Music,
  Zap,
  Inbox,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { BirdConfig, MissionGoal } from '../types/game';

interface LootItemSummary {
  type: string;
  points: number;
  weight: number;
  name: string;
  icon: string;
}

interface GameHUDProps {
  birdConfig: BirdConfig;
  bankedScore: number;
  carriedScore: number;
  combo: number;
  currentWeight: number;
  maxWeight: number;
  lootList: LootItemSummary[];
  currentAltitude: number;
  cruiseAltitude: number;
  soundEnabled: boolean;
  bgmEnabled: boolean;
  activeMission: MissionGoal;
  stamina?: number;
  maxStamina?: number;
  isExhausted?: boolean;
  poopAmmo?: number;
  maxPoopAmmo?: number;
  isDigesting?: boolean;
  digestionQueueCount?: number;
  onChangeMission: () => void;
  onToggleSound: () => void;
  onToggleBGM: () => void;
  onOpenCharacterSelect: () => void;
  onOpenHelp: () => void;
  onResetGame: () => void;
  onTriggerBalloon: () => void;
  onDropPoop: (color: 'white' | 'black') => void;
  onTogglePerch: () => void;
  onDeliverMail: () => void;
  onOpenSettlement?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  birdConfig,
  bankedScore,
  carriedScore,
  combo,
  currentWeight,
  maxWeight,
  lootList,
  currentAltitude,
  cruiseAltitude,
  soundEnabled,
  bgmEnabled,
  activeMission,
  stamina = 100,
  maxStamina = 100,
  isExhausted = false,
  poopAmmo = 3,
  maxPoopAmmo = 6,
  isDigesting = false,
  digestionQueueCount = 0,
  onChangeMission,
  onToggleSound,
  onToggleBGM,
  onOpenCharacterSelect,
  onOpenHelp,
  onResetGame,
  onTriggerBalloon,
  onDropPoop,
  onTogglePerch,
  onDeliverMail,
  onOpenSettlement,
}) => {
  const isLight = currentWeight < 3.0;
  const isHeavy = currentWeight >= 6.5;

  const weightRatio = Math.min(
    1,
    Math.max(0, (currentWeight - birdConfig.baseWeight) / (maxWeight - birdConfig.baseWeight))
  );
  const needleAngle = -45 + weightRatio * 90;

  // Stamina ratio & color
  const staminaRatio = Math.min(100, Math.max(0, (stamina / maxStamina) * 100));
  const staminaColor =
    isExhausted || staminaRatio <= 20
      ? 'bg-rose-500'
      : staminaRatio <= 45
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  // Poop capacity ratio
  const poopRatio = Math.min(100, Math.max(0, (poopAmmo / maxPoopAmmo) * 100));
  const isPoopFull = poopAmmo >= maxPoopAmmo;

  // Max 3 treasures held
  const maxSlots = 3;
  const isLootFull = lootList.length >= maxSlots;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 md:p-5 select-none font-sans">
      {/* ========================================================
          TOP ZONE: Cruising Altitude, Mission Banner, Scores & Settlement
          ======================================================== */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 w-full">
        {/* Left: Cruising Altitude & Stamina Gauges */}
        <div className="flex items-center gap-2.5">
          {/* Altitude Gauge */}
          <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-stone-200/90 pointer-events-auto">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold tracking-wider text-stone-500 uppercase font-mono">
                ALTITUDE
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-black text-stone-800 tabular-nums">
                  {currentAltitude}%
                </span>
                <span className="text-[10px] text-stone-400">/ 巡航 {cruiseAltitude}%</span>
              </div>
            </div>

            <div className="relative w-2 h-7 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
              <div
                className="absolute left-0 right-0 w-full bg-sky-500 transition-all duration-150 rounded-full"
                style={{ bottom: '0%', height: `${currentAltitude}%` }}
              />
              <div
                className="absolute left-0 right-0 w-full h-[2px] bg-amber-500"
                style={{ bottom: `${cruiseAltitude}%` }}
              />
            </div>
          </div>

          {/* Stamina (体力条) Widget */}
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-stone-200/90 pointer-events-auto">
            <Zap className={`w-3.5 h-3.5 ${isExhausted ? 'text-rose-500 animate-bounce' : 'text-amber-500'}`} />
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] font-bold text-stone-500 font-mono uppercase">
                  STAMINA / 体力
                </span>
                <span className="text-[10px] font-extrabold tabular-nums text-stone-800">
                  {Math.round(stamina)}%
                </span>
              </div>

              <div className="w-24 md:w-28 h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200 mt-0.5">
                <div
                  className={`h-full transition-all duration-150 rounded-full ${staminaColor} ${
                    isExhausted ? 'animate-pulse' : ''
                  }`}
                  style={{ width: `${staminaRatio}%` }}
                />
              </div>

              <span className="text-[9px] text-stone-400 mt-0.5 truncate max-w-[110px]">
                {isExhausted
                  ? '💦 体力耗尽! 滑落歇脚'
                  : staminaRatio < 30
                  ? '⚠️ 翅膀疲劳, 巡航回复'
                  : '🍃 巡航微升/站立速回'}
              </span>
            </div>
          </div>

          {/* Poop Ammo & Digestion Widget */}
          <div className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-stone-200/90 pointer-events-auto">
            <span className="text-sm">💩</span>
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] font-bold text-stone-500 font-mono uppercase">
                  POOP / 存屎量
                </span>
                <span className="text-[10px] font-black text-amber-800 tabular-nums">
                  {poopAmmo}/{maxPoopAmmo}
                </span>
              </div>

              <div className="w-20 h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200 mt-0.5">
                <div
                  className={`h-full transition-all duration-200 rounded-full ${
                    isPoopFull ? 'bg-red-600 animate-pulse' : 'bg-amber-700'
                  }`}
                  style={{ width: `${poopRatio}%` }}
                />
              </div>

              <span className="text-[9px] text-stone-400 mt-0.5">
                {isPoopFull
                  ? '🚨 存满将自动拉屎!'
                  : digestionQueueCount > 0
                  ? `🥐 消化可颂中...(${digestionQueueCount})`
                  : '吃可颂消化增弹药'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Mission Goal Widget */}
        <div
          onClick={onChangeMission}
          title="点击切换关卡任务目标"
          className="flex items-center gap-2 bg-amber-500/95 text-white hover:bg-amber-600 active:scale-95 px-3.5 py-1.5 rounded-2xl shadow-md cursor-pointer transition-all border border-amber-400/80 pointer-events-auto"
        >
          <span className="text-base">{activeMission.icon}</span>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wide">
                任务: {activeMission.title}
              </span>
              {activeMission.isCompleted && (
                <span className="text-[10px] font-bold bg-white text-emerald-700 px-1.5 py-0.2 rounded">
                  已完成! 🎉
                </span>
              )}
            </div>
            <span className="text-[10px] text-amber-100 font-medium truncate max-w-[200px] md:max-w-[320px]">
              {activeMission.description}
            </span>
          </div>
        </div>

        {/* Right: Scores & Return to Nest Settlement Button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Banked & Carried Score */}
          <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-stone-200/90">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold text-stone-400 tracking-wider">落袋金币</span>
              <span className="text-xs font-black text-amber-600 tabular-nums">
                {bankedScore.toLocaleString()} 🪙
              </span>
            </div>

            <div className="w-[1px] h-5 bg-stone-200" />

            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold text-stone-400 tracking-wider">携带中</span>
                {combo > 1 && (
                  <span className="text-[10px] font-black text-rose-500 animate-pulse">
                    {combo}x!
                  </span>
                )}
              </div>
              <span className="text-xs font-black text-stone-800 tabular-nums">
                +{carriedScore}
              </span>
            </div>
          </div>

          {/* Grand Return to Nest & Settlement Button (🪺 回巢结算 / 今日战报) */}
          {onOpenSettlement && (
            <button
              onClick={onOpenSettlement}
              title="飞回高空巢穴结算战利品，查看市民投诉汇总特刊！"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-white rounded-2xl shadow-md border border-amber-300 transition-all text-xs font-extrabold"
            >
              <span className="text-sm">🪺</span>
              <span className="whitespace-nowrap">回巢结算</span>
            </button>
          )}

          {/* Character Select */}
          <button
            onClick={onOpenCharacterSelect}
            title="选择怪盗飞禽"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white/95 hover:bg-stone-50 active:scale-95 text-xs font-bold text-stone-700 rounded-2xl border border-stone-200/80 shadow-sm transition-all"
          >
            <Feather className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">{birdConfig.name.split(' ')[0]}</span>
          </button>

          {/* Audio & BGM */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? '音效已开 (点击静音)' : '音效已关 (点击开启)'}
            className="p-1.5 bg-white/95 hover:bg-stone-50 active:scale-95 text-stone-600 rounded-2xl border border-stone-200/80 shadow-sm transition-all"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onToggleBGM}
            title={bgmEnabled ? '背景音乐已开 [按M关闭]' : '背景音乐已关 [按M开启]'}
            className={`p-1.5 rounded-2xl border shadow-sm transition-all active:scale-95 ${
              bgmEnabled
                ? 'bg-amber-100/95 text-amber-800 border-amber-300 ring-1 ring-amber-400/30'
                : 'bg-white/95 text-stone-400 hover:bg-stone-50 border-stone-200/80'
            }`}
          >
            <Music className="w-4 h-4" />
          </button>

          <button
            onClick={onResetGame}
            title="重新生成小镇"
            className="p-1.5 bg-white/95 hover:bg-stone-50 active:scale-95 text-stone-600 rounded-2xl border border-stone-200/80 shadow-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenHelp}
            title="操作玩法说明"
            className="p-1.5 bg-white/95 hover:bg-stone-50 active:scale-95 text-stone-600 rounded-2xl border border-stone-200/80 shadow-sm transition-all"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ========================================================
          BOTTOM ZONE: Action Deck, 3 Held Treasure Slots, Weight & Balloon
          ======================================================== */}
      <footer className="flex flex-col lg:flex-row items-end lg:items-center justify-between gap-2.5 w-full pointer-events-auto">
        {/* Left: Interactive Action Toolbar (Poop, Perch, Deliver) */}
        <div className="flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur-md p-1.5 md:p-2 rounded-3xl shadow-md border border-stone-200/90">
          {/* White Poop Button */}
          <button
            onClick={() => onDropPoop('white')}
            disabled={poopAmmo <= 0}
            title="拉白鸟屎 (快捷键 P) - 沾深色大衣加高额对比分!"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all ${
              poopAmmo > 0
                ? 'bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 border-stone-300'
                : 'bg-stone-100/50 text-stone-400 border-stone-200 cursor-not-allowed'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-white border border-stone-400 inline-block shadow-inner" />
            <span>白屎 [P]</span>
          </button>

          {/* Black Poop Button */}
          <button
            onClick={() => onDropPoop('black')}
            disabled={poopAmmo <= 0}
            title="拉黑鸟屎 (快捷键 O) - 沾浅色长裙/浅墙加高额对比分!"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all ${
              poopAmmo > 0
                ? 'bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 border-stone-300'
                : 'bg-stone-100/50 text-stone-400 border-stone-200 cursor-not-allowed'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-stone-900 inline-block" />
            <span>黑屎 [O]</span>
          </button>

          {/* Perch / Land Button */}
          <button
            onClick={onTogglePerch}
            title="落地站定快速回体力，或起飞滑翔 (快捷键 L)"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 active:scale-95 rounded-2xl text-xs font-bold text-amber-800 border border-amber-200 transition-all"
          >
            <span>🐾</span>
            <span>站定/起飞 [L]</span>
          </button>

          {/* Mail Delivery Button */}
          {activeMission.type === 'mail_delivery' && (
            <button
              onClick={onDeliverMail}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black transition-all active:scale-95 ${
                activeMission.mailDelivered
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse shadow-md'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{activeMission.mailDelivered ? '信件已投递' : '投递信件 [D]'}</span>
            </button>
          )}

          {/* Contrast scoring tip badge */}
          <span className="hidden xl:inline text-[10px] text-stone-400 font-medium px-1">
            💡 宝物上限3件 · 拾第4件自动放飞
          </span>
        </div>

        {/* Right: 3 HELD TREASURE SLOTS, WEIGHT BALANCE & BALLOON PACK */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* HELD TREASURE 3-SLOT TRAY (上限3个，获得第4个自动放飞) */}
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-3xl shadow-md border border-stone-200/90">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-black text-stone-500 uppercase font-mono">
                  CLAW LOOT ({lootList.length}/3)
                </span>
                {isLootFull && (
                  <span className="text-[8px] bg-amber-500 text-white px-1 rounded font-bold">
                    满载!
                  </span>
                )}
              </div>
              {/* 3 Physical slots */}
              <div className="flex items-center gap-1.5 mt-0.5">
                {[0, 1, 2].map((slotIdx) => {
                  const item = lootList[slotIdx];
                  return (
                    <div
                      key={slotIdx}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-sm border transition-all ${
                        item
                          ? 'bg-amber-50 border-amber-300 shadow-sm animate-pop-in'
                          : 'bg-stone-100/70 border-dashed border-stone-300 text-stone-300'
                      }`}
                      title={item ? `${item.name} (+${item.points}🪙, ${item.weight}kg)` : `宝物空槽位 ${slotIdx + 1}`}
                    >
                      {item ? item.icon : '🪶'}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Weight Balance Meter (incorporating poop ammo weight) */}
          <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-3xl shadow-md border border-stone-200/90">
            <div className="relative w-7 h-7 bg-stone-100 rounded-full border border-stone-200 flex items-center justify-center">
              <div
                className="absolute w-[2px] h-2.5 bg-rose-500 origin-bottom rounded-full transition-transform duration-200"
                style={{ transform: `translateY(-50%) rotate(${needleAngle}deg)` }}
              />
              <div className="w-1.5 h-1.5 bg-stone-800 rounded-full z-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-stone-400 font-mono">WEIGHT</span>
              <span className="text-xs font-black text-stone-800 tabular-nums">
                {currentWeight.toFixed(2)} kg
              </span>
            </div>
          </div>

          {/* BALLOON PACK RELEASE BUTTON */}
          <button
            onClick={onTriggerBalloon}
            disabled={lootList.length === 0}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-3xl font-extrabold text-xs shadow-md transition-all active:scale-95 ${
              lootList.length > 0
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white shadow-amber-500/25 animate-bounce'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <span className="text-base">🎈</span>
            <div className="flex flex-col items-start text-left leading-tight">
              <span className="whitespace-nowrap">气球放飞赃物</span>
              <span className="text-[9px] font-normal opacity-90">空格键 [Space]</span>
            </div>
          </button>
        </div>
      </footer>
    </div>
  );
};
