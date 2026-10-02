import React, { useEffect, useRef } from 'react';
import { BirdConfig, LootItemConfig, CitizenComplaint, SettlementSummaryData } from '../types/game';
import { soundManager } from '../audio/soundEffects';
import { Feather, Trophy, Sparkles, X, RotateCcw, ArrowRight, ShieldAlert, Award } from 'lucide-react';

interface SettlementModalProps {
  birdConfig: BirdConfig;
  settlementData: SettlementSummaryData;
  onClose: () => void;
  onPlayAgain: () => void;
}

export const SettlementModal: React.FC<SettlementModalProps> = ({
  birdConfig,
  settlementData,
  onClose,
  onPlayAgain,
}) => {
  const nestCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Play crow taunt sound on open
  useEffect(() => {
    soundManager.playCrowTaunt();
  }, []);

  // Animated Crow's Nest Canvas ("洋洋得意", crowned bird nestled in shiny loot)
  useEffect(() => {
    const canvas = nestCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const renderNest = () => {
      frame++;
      const time = frame / 60;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Warm attic/belfry twilight glow background
      const grad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w / 2);
      grad.addColorStop(0, '#fef3c7');
      grad.addColorStop(0.6, '#fde68a');
      grad.addColorStop(1, '#f59e0b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Wooden belfry roof beam framing
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, 0, 24, h);
      ctx.fillRect(w - 24, 0, 24, h);
      ctx.fillRect(0, 0, w, 22);

      // Suspended warm fairy lantern
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.8, 22);
      ctx.lineTo(w * 0.8, 65);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(w * 0.8, 75, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(w * 0.8, 75, 6, 0, Math.PI * 2);
      ctx.fill();

      // Big Cozy Twig Nest
      const nestX = w / 2;
      const nestY = h - 60;

      // Outer twig thatch
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 3.5;
      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI + Math.sin(i * 1.5) * 0.15;
        const rx = 140 + Math.sin(i * 3) * 12;
        const ry = 55 + Math.cos(i * 2) * 8;
        ctx.beginPath();
        ctx.ellipse(nestX, nestY, rx, ry, 0, Math.PI, 0);
        ctx.stroke();
      }

      // Nest bowl fill
      ctx.fillStyle = '#a16207';
      ctx.beginPath();
      ctx.ellipse(nestX, nestY, 130, 48, 0, 0, Math.PI * 2);
      ctx.fill();

      // Soft feather bedding
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.ellipse(nestX, nestY - 6, 115, 36, 0, 0, Math.PI * 2);
      ctx.fill();

      // Piled High Sparkling Stolen Treasures in Nest!
      const items = settlementData.stolenItems;
      const displayCount = Math.max(12, Math.min(items.length * 4, 30));
      for (let i = 0; i < displayCount; i++) {
        const itemType = items.length > 0 ? items[i % items.length].type : 'gold_coin';
        const ix = nestX - 90 + ((i * 37) % 180);
        const iy = nestY - 14 + ((i * 19) % 28) - Math.sin((i / displayCount) * Math.PI) * 12;

        ctx.save();
        ctx.translate(ix, iy);

        if (itemType === 'croissant') {
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(0, 0, 9, 0, Math.PI);
          ctx.fill();
        } else if (itemType === 'silver_spoon' || itemType === 'silver_fork') {
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(-2, -10, 4, 20);
          ctx.beginPath();
          ctx.arc(0, -10, 5, 0, Math.PI * 2);
          ctx.fill();
        } else if (itemType === 'reading_glasses') {
          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 1.6;
          ctx.strokeRect(-8, -4, 7, 7);
          ctx.strokeRect(1, -4, 7, 7);
        } else {
          // Gold coin / sparkle gems
          ctx.fillStyle = i % 2 === 0 ? '#eab308' : '#38bdf8';
          ctx.beginPath();
          ctx.arc(0, 0, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.restore();
      }

      // Animated Glitter Sparkles
      for (let s = 0; s < 8; s++) {
        const sx = nestX - 100 + ((s * 33 + frame * 0.8) % 200);
        const sy = nestY - 40 + Math.sin(time * 3 + s) * 22;
        const sAlpha = Math.abs(Math.sin(time * 4 + s));
        ctx.fillStyle = `rgba(255, 255, 255, ${sAlpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // ========================================================
      // PROUD SMUG CROW PERCHED IN NEST ("洋洋得意")
      // Puffed up chest, cocked head, gold crown/monocle, smirking
      // ========================================================
      const crowX = nestX + Math.sin(time * 1.5) * 3;
      const crowY = nestY - 50 + Math.sin(time * 3) * 4; // proud rhythmic bob

      ctx.save();
      ctx.translate(crowX, crowY);

      // Feet gripping twig
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-10, 24);
      ctx.lineTo(-12, 34);
      ctx.lineTo(-18, 36);
      ctx.moveTo(10, 24);
      ctx.lineTo(8, 34);
      ctx.lineTo(4, 36);
      ctx.stroke();

      // Tail feathers fan out proudly
      ctx.fillStyle = birdConfig.color;
      ctx.beginPath();
      ctx.moveTo(-20, 10);
      ctx.lineTo(-44, 4);
      ctx.lineTo(-48, 16);
      ctx.lineTo(-44, 26);
      ctx.lineTo(-20, 22);
      ctx.closePath();
      ctx.fill();

      // Puffed-up plump round chest
      ctx.beginPath();
      ctx.ellipse(0, 8, 32, 26, -0.15, 0, Math.PI * 2);
      ctx.fill();

      // Glossy sheen highlight on chest
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      ctx.ellipse(6, 6, 20, 16, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Proud folded wing (shrugging/flexing with beat)
      const wingFlex = Math.sin(time * 3) * 3;
      ctx.fillStyle = birdConfig.color === '#f8fafc' ? '#cbd5e1' : '#0f172a';
      ctx.beginPath();
      ctx.ellipse(-6, 8, 24, 15 + wingFlex * 0.5, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Head held high
      ctx.fillStyle = birdConfig.color;
      ctx.beginPath();
      ctx.arc(18, -12, 17, 0, Math.PI * 2);
      ctx.fill();

      // Smug Narrow Eye (half-lidded smug look)
      ctx.fillStyle = birdConfig.eyeColor;
      ctx.beginPath();
      ctx.arc(22, -15, 7, 0, Math.PI * 2);
      ctx.fill();
      // Smug half eyelid
      ctx.fillStyle = birdConfig.color;
      ctx.beginPath();
      ctx.arc(22, -18, 8, 0, Math.PI);
      ctx.fill();
      // Eye glint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(24, -14, 2, 0, Math.PI * 2);
      ctx.fill();

      // Sharp Beak tilted up proudly with smirk
      ctx.fillStyle = birdConfig.beakColor;
      ctx.beginPath();
      ctx.moveTo(30, -17);
      ctx.lineTo(50, -11);
      ctx.lineTo(31, -3);
      ctx.closePath();
      ctx.fill();

      // Shiny Gold Monocle or Little Crown on head!
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(12, -26);
      ctx.lineTo(16, -38);
      ctx.lineTo(21, -30);
      ctx.lineTo(26, -39);
      ctx.lineTo(30, -26);
      ctx.closePath();
      ctx.fill();
      // Crown rubies
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(21, -30, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Comic Smug Speech Bubble: "Caw! 都是本大爷的!"
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(40, -68, 120, 32, 12);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(48, -36);
      ctx.lineTo(38, -26);
      ctx.lineTo(56, -36);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 11px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('嘎嘎！全镇都是本大爷的！', 100, -48);

      ctx.restore();

      animId = requestAnimationFrame(renderNest);
    };

    renderNest();

    return () => cancelAnimationFrame(animId);
  }, [birdConfig, settlementData]);

  // Aggregate statistics
  const totalVictims = settlementData.totalVictims || settlementData.complaints.length;
  const poopHits = settlementData.poopHitCount || 0;
  const stolenCount = settlementData.stolenItems.length;
  const chaosScore = settlementData.totalScore;
  const ratingTier =
    chaosScore > 1500 ? 'S级 · 全镇特号通缉犯' : chaosScore > 800 ? 'A级 · 街头空中恶霸' : 'B级 · 恶作剧见习生';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-stone-950/80 backdrop-blur-md animate-fade-in font-serif select-none overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#fdfbf7] rounded-3xl shadow-2xl border-4 border-[#78350f]/40 p-5 md:p-8 flex flex-col gap-6 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-200/60 transition-colors z-20"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header: Royal Postal Gazette Special Edition Masthead */}
        <div className="border-b-2 border-double border-stone-800 pb-3 flex flex-col items-center text-center relative">
          <div className="flex items-center gap-2 text-amber-900 text-xs font-mono font-bold tracking-widest uppercase mb-1">
            <span>★ ÉDITION SPÉCIALE DU SOIR ★</span>
            <span>·</span>
            <span>晨曦每日邮报 · 特刊号外</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-black text-stone-900 tracking-tight font-serif flex items-center gap-2">
            <span>📰 全 城 震 怒：怪 盗 飞 禽 浩 劫 纪 实</span>
          </h1>

          <p className="text-xs text-stone-600 mt-1 italic font-sans">
            小镇治安所与市民维权委员会联合通告 · 罪状汇总 · 悬赏金币 +{settlementData.totalScore} 🪙
          </p>

          <div className="absolute left-0 top-0 -rotate-12 border-2 border-red-700 text-red-700 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider shadow-sm">
            {ratingTier}
          </div>
        </div>

        {/* Grid: Left is Crow's Nest Canvas, Right is Newspaper Aggregated Expose */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ========================================================
              LEFT COLUMN (5 cols): Crow's Cozy Nest Canvas & Treasure Hoard
              ======================================================== */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="relative w-full h-[260px] md:h-[300px] rounded-3xl overflow-hidden border-2 border-amber-300 shadow-inner bg-amber-50">
              <canvas
                ref={nestCanvasRef}
                width={420}
                height={300}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-3 bg-black/60 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded-xl font-sans flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>高空钟楼鸦巢 · 洋洋得意清点战利品</span>
              </div>
            </div>

            {/* Hoarded Loot Mini Gallery */}
            <div className="bg-[#fefce8] p-3.5 rounded-2xl border border-amber-200 shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-950 font-sans">
                <span className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-amber-600" />
                  巢穴宝库藏品 ({settlementData.stolenItems.length}件)
                </span>
                <span className="text-amber-700 font-mono">+{settlementData.totalScore} 🪙</span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto p-1 bg-white/70 rounded-xl border border-amber-100">
                {settlementData.stolenItems.length === 0 ? (
                  <span className="text-xs text-stone-500 italic p-2 font-sans">
                    还没有顺走任何体面居民的贵重小物件哦，快去街头搜刮吧！
                  </span>
                ) : (
                  settlementData.stolenItems.map((item, idx) => (
                    <span
                      key={`${item.type}-${idx}`}
                      className="inline-flex items-center gap-1 bg-amber-50 text-stone-800 text-[11px] font-sans font-bold px-2 py-0.5 rounded-lg border border-amber-200"
                    >
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ========================================================
              RIGHT COLUMN (7 cols): Aggregated Cohesive Gazette Article
              ======================================================== */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Stat Badges Row */}
            <div className="grid grid-cols-4 gap-2 text-center font-sans">
              <div className="bg-stone-100 p-2 rounded-2xl border border-stone-200">
                <span className="text-[10px] text-stone-500 font-bold block">受害市民</span>
                <strong className="text-base font-black text-rose-700 tabular-nums">
                  {totalVictims}
                </strong>
                <span className="text-[9px] text-stone-400 block">人被袭</span>
              </div>

              <div className="bg-stone-100 p-2 rounded-2xl border border-stone-200">
                <span className="text-[10px] text-stone-500 font-bold block">生化轰炸</span>
                <strong className="text-base font-black text-amber-700 tabular-nums">
                  {poopHits}
                </strong>
                <span className="text-[9px] text-stone-400 block">坨鸟屎</span>
              </div>

              <div className="bg-stone-100 p-2 rounded-2xl border border-stone-200">
                <span className="text-[10px] text-stone-500 font-bold block">抢走美食</span>
                <strong className="text-base font-black text-emerald-700 tabular-nums">
                  {stolenCount}
                </strong>
                <span className="text-[9px] text-stone-400 block">件战利品</span>
              </div>

              <div className="bg-stone-100 p-2 rounded-2xl border border-stone-200">
                <span className="text-[10px] text-stone-500 font-bold block">车祸险情</span>
                <strong className="text-base font-black text-blue-700 tabular-nums">
                  {settlementData.vehicleHitCount || 0}
                </strong>
                <span className="text-[9px] text-stone-400 block">次撞击</span>
              </div>
            </div>

            {/* Synthesized Coherent Article (连缀成文) */}
            <div className="bg-white/90 p-4 md:p-5 rounded-2xl border border-stone-300 shadow-sm flex flex-col gap-2.5 max-h-[280px] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stone-200 pb-1.5 text-xs text-stone-500 font-mono">
                <span className="font-bold text-stone-800 font-serif">
                  【专稿】怪盗乌鸦今日狂轰滥炸深度调查
                </span>
                <span>记者：书商巴斯蒂安</span>
              </div>

              <div className="text-xs md:text-sm text-stone-800 leading-relaxed space-y-2 font-serif">
                <p className="indent-6 text-stone-900 font-medium">
                  {settlementData.headlineArticle}
                </p>
              </div>

              {/* Citizen Complaints Roll Call / Verbatim quotes */}
              {settlementData.complaints.length > 0 && (
                <div className="mt-2 pt-2 border-t border-dashed border-stone-300 flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-stone-700 font-sans flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    市民热线案情备忘录 ({settlementData.complaints.length} 起)：
                  </span>
                  <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1 font-sans">
                    {settlementData.complaints.map((c, idx) => (
                      <div
                        key={`${c.id}-${idx}`}
                        className="bg-stone-50 p-2 rounded-xl text-xs border border-stone-200 flex items-start gap-2"
                      >
                        <span className="text-sm shrink-0">{c.avatarIcon || '🗣️'}</span>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-stone-900">{c.citizenName}</span>
                          <span className="text-[10px] text-stone-500 ml-1.5 font-mono">
                            [{c.role}]
                          </span>
                          <p className="text-stone-700 text-[11px] mt-0.5 line-clamp-1 italic">
                            {c.complaintText}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2 font-sans">
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-stone-200 hover:bg-stone-300 active:scale-95 text-stone-800 text-xs font-bold rounded-2xl transition-all shadow-sm"
              >
                继续留在镇上浪 🕊️
              </button>

              <button
                onClick={onPlayAgain}
                className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-black rounded-2xl shadow-lg shadow-amber-600/30 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>再来一次恶作剧！</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
