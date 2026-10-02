import React from 'react';
import { X, Check } from 'lucide-react';
import { BirdConfig, BirdId } from '../types/game';
import { BIRD_CONFIGS } from '../utils/constants';

interface CharacterSelectModalProps {
  currentBirdId: BirdId;
  onSelectBird: (bird: BirdConfig) => void;
  onClose: () => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  currentBirdId,
  onSelectBird,
  onClose,
}) => {
  const birds = Object.values(BIRD_CONFIGS);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 md:p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-stone-800">
              怪盗飞禽行会 · 挑选你的专属搭档
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              每种鸟儿拥有独特的体能配重、空气升力与场景羁绊
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bird Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {birds.map((bird) => {
            const isSelected = bird.id === currentBirdId;
            return (
              <div
                key={bird.id}
                onClick={() => {
                  onSelectBird(bird);
                  onClose();
                }}
                className={`relative flex flex-col justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/40 shadow-sm scale-[1.01]'
                    : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50/80'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-inner"
                        style={{ backgroundColor: bird.color, color: bird.eyeColor }}
                      >
                        {bird.id === 'crow'
                          ? '👑'
                          : bird.id === 'pigeon'
                          ? '🥐'
                          : bird.id === 'seagull'
                          ? '🌊'
                          : '⚡'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-extrabold text-stone-800">{bird.name}</h3>
                          {isSelected && (
                            <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-600 bg-amber-100/80 px-1.5 py-0.5 rounded-md">
                              <Check className="w-3 h-3" /> 出战中
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-400 font-medium">
                          {bird.townTheme}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 mt-2.5 leading-relaxed">
                    {bird.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-stone-500">
                    <span>
                      空重: <strong className="text-stone-700">{bird.baseWeight}kg</strong>
                    </span>
                    <span>
                      载重上限: <strong className="text-stone-700">{bird.maxWeight}kg</strong>
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-600">
                    {bird.specialTrait.split('，')[0]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-stone-100">
          <span>提示：体重越大俯冲下坠越迅猛，轻装时爬升浮力更强！</span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-stone-800 hover:bg-stone-900 rounded-xl transition-all"
          >
            确认并启程
          </button>
        </div>
      </div>
    </div>
  );
};
