import React from 'react';
import { X, Check, Clock, Sparkles, Send, ShieldAlert } from 'lucide-react';
import { MissionGoal, MissionType } from '../types/game';

export const MISSION_PRESETS: Record<MissionType, MissionGoal> = {
  mail_delivery: {
    type: 'mail_delivery',
    title: '信鸽急件快送',
    description: '嘴叼紧急加急信件，跨越小镇找到金色皇家邮筒投递！[D 键投递]',
    icon: '🕊️',
    targetScore: 500,
    targetLootCount: 0,
    timeRemaining: 90,
    isCompleted: false,
    mailDelivered: false,
  },
  shiny_scramble: {
    type: 'shiny_scramble',
    title: '怪盗闪光敛财',
    description: '巡视小镇，顺走咖啡桌银勺、喷泉钥匙与老花镜，并用气球串放飞落袋！',
    icon: '💎',
    targetScore: 600,
    targetLootCount: 5,
    timeRemaining: 120,
    isCompleted: false,
  },
  town_chaos: {
    type: 'town_chaos',
    title: '小镇捣蛋大暴走',
    description: '尽情捣乱！深色大衣拉白屎、浅色长裙拉黑屎，触发强烈对比高分！',
    icon: '💩',
    targetScore: 650,
    targetLootCount: 3,
    timeRemaining: 100,
    isCompleted: false,
  },
};

interface MissionSelectModalProps {
  currentMissionType: MissionType;
  onSelectMission: (mission: MissionGoal) => void;
  onClose: () => void;
}

export const MissionSelectModal: React.FC<MissionSelectModalProps> = ({
  currentMissionType,
  onSelectMission,
  onClose,
}) => {
  const missions = Object.values(MISSION_PRESETS);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 md:p-8 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-stone-800">
              关卡任务选择 · 开启不同小镇冒险
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              每个关卡拥有独立的目标胜负规则与趣味交互机制
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {missions.map((m) => {
            const isSelected = m.type === currentMissionType;
            return (
              <div
                key={m.type}
                onClick={() => {
                  onSelectMission(m);
                  onClose();
                }}
                className={`flex items-start justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/50 shadow-sm scale-[1.01]'
                    : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{m.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-stone-800">{m.title}</h3>
                      {isSelected && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                          <Check className="w-3 h-3" /> 进行中
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {m.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-xs font-black text-amber-600">
                    {m.type === 'mail_delivery' ? '必投信件' : m.type === 'shiny_scramble' ? '5+ 闪光物' : '650 捣蛋分'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-3 border-t border-stone-100">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all active:scale-95"
          >
            选定任务并启程
          </button>
        </div>
      </div>
    </div>
  );
};
