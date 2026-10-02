import React, { useState } from 'react';
import { CitizenComplaint, TownNewsHeadline } from '../types/game';
import { Mail, ChevronRight, X, AlertTriangle, ShieldAlert, Feather, Inbox } from 'lucide-react';

interface TownGazetteProps {
  complaints?: CitizenComplaint[];
  latestComplaint?: CitizenComplaint | null;
  headlines?: TownNewsHeadline[];
  latestHeadline?: TownNewsHeadline | null;
  onOpenSettlement?: () => void;
}

export const TownGazette: React.FC<TownGazetteProps> = ({
  complaints = [],
  latestComplaint = null,
  headlines = [],
  latestHeadline = null,
  onOpenSettlement,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Normalize active notification item
  const activeAlert = latestComplaint
    ? {
        id: latestComplaint.id,
        badge: '📮 市民来信投诉',
        sender: latestComplaint.citizenName,
        role: latestComplaint.role,
        title: latestComplaint.title,
        content: latestComplaint.complaintText,
        isCombo: latestComplaint.comboCount >= 2,
      }
    : latestHeadline
    ? {
        id: latestHeadline.id,
        badge: latestHeadline.comboCount >= 2 ? '🔥 特大号外' : '📢 市民热线',
        sender: '晨曦居民',
        role: '街头市民',
        title: latestHeadline.title,
        content: latestHeadline.content,
        isCombo: latestHeadline.comboCount >= 2,
      }
    : null;

  const totalCount = complaints.length > 0 ? complaints.length : headlines.length;

  return (
    <>
      {/* Top-Right Floating Citizen Complaint Ticker / Banner */}
      <div className="fixed top-16 right-4 z-40 max-w-sm w-full transition-all">
        {activeAlert && !isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="cursor-pointer bg-[#fffbf0] text-stone-800 p-3 rounded-2xl shadow-xl border-2 border-rose-600/40 hover:border-rose-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-start gap-2.5 animate-slide-in-down"
            style={{
              backgroundImage: 'radial-gradient(#e5e7eb 0.75px, transparent 0.75px)',
              backgroundSize: '8px 8px',
            }}
          >
            <div className="shrink-0 w-8 h-8 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-800 text-lg shadow-inner">
              📮
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className={`text-[10px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded text-white ${
                  activeAlert.isCombo ? 'bg-red-700 animate-pulse' : 'bg-rose-600'
                }`}>
                  {activeAlert.badge}
                </span>
                <span className="text-[10px] text-stone-500 font-mono">
                  信箱 · 第{totalCount}封
                </span>
              </div>
              <p className="text-xs font-bold text-stone-900 leading-tight line-clamp-1 font-serif">
                【{activeAlert.sender}】{activeAlert.title}
              </p>
              <p className="text-[11px] text-stone-700 mt-0.5 line-clamp-1 italic">
                {activeAlert.content}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400 shrink-0 self-center" />
          </div>
        )}

        {/* Small persistent button to view postal complaint box when no active banner */}
        {!activeAlert && !isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="ml-auto flex items-center gap-2 bg-[#fffbf0]/95 hover:bg-[#fffbf0] text-stone-800 px-3.5 py-2 rounded-2xl shadow-md border border-stone-300 hover:border-rose-500 text-xs font-bold transition-all"
          >
            <Inbox className="w-4 h-4 text-rose-600" />
            <span>邮报 · 市民投诉邮箱</span>
            {totalCount > 0 && (
              <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold animate-pulse">
                {totalCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Expanded Vintage Storybook Citizen Complaints Mailbox Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in font-serif">
          <div className="relative w-full max-w-lg bg-[#fdfbf7] rounded-3xl shadow-2xl border-4 border-[#78350f]/30 p-6 md:p-8 flex flex-col gap-4 max-h-[85vh] overflow-hidden">
            {/* Header: Vintage Gazette Masthead */}
            <div className="border-b-2 border-double border-stone-800 pb-3 flex flex-col items-center relative text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-0 top-0 p-1.5 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-rose-900 text-xs tracking-widest uppercase font-mono font-bold mb-1">
                <span>★ BOÎTE AUX LETTRES DES CITOYENS ★</span>
                <span>·</span>
                <span>NO.{totalCount + 101}</span>
              </div>

              <h2 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2 font-serif">
                <span>📮 晨 曦 邮 报 · 市 民 投 诉 投 稿 箱</span>
              </h2>
              <p className="text-[11px] text-stone-600 italic mt-0.5 font-sans">
                “晨曦印刷所受市政厅委托设立 · 专收市民关于黑羽怪鸟恶行之哭诉与索赔信”
              </p>

              {/* Rubber stamp badge */}
              <div className="absolute left-0 top-1 -rotate-12 border-2 border-red-700/80 text-red-700 text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-widest">
                通缉取证中
              </div>
            </div>

            {/* Sub-header / Total complaints tally */}
            <div className="flex items-center justify-between text-xs border-b border-stone-300 pb-2 text-stone-600 font-sans">
              <span className="flex items-center gap-1 font-bold text-stone-800">
                <Feather className="w-3.5 h-3.5 text-rose-600" />
                市民来信汇总
              </span>
              <span>累计收到投诉：<strong className="text-rose-700 font-mono text-sm">{totalCount}</strong> 封</span>
            </div>

            {/* Letters List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-stone-800 font-sans">
              {totalCount === 0 ? (
                <div className="text-center py-12 text-stone-500 text-xs italic">
                  <p className="text-3xl mb-2">🕊️</p>
                  邮箱今日空空如也，小镇尚未有市民报案...
                  <p className="text-[11px] mt-1 text-stone-400">（快去俯冲抢走可颂、空投鸟屎轰炸，惹怒体面市民！）</p>
                </div>
              ) : complaints.length > 0 ? (
                complaints.map((item, idx) => (
                  <article
                    key={item.id || idx}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      item.comboCount >= 2
                        ? 'bg-rose-50/80 border-rose-300 shadow-sm'
                        : 'bg-white/80 border-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono mb-1">
                      <span className={`font-bold px-1.5 py-0.5 rounded ${
                        item.comboCount >= 2 ? 'bg-red-700 text-white' : 'bg-stone-200 text-stone-700'
                      }`}>
                        {item.comboCount >= 2 ? `⚡ 连环重案 [${item.comboCount}连击]` : '📩 市民紧急信件'}
                      </span>
                      <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{item.avatarIcon || '👤'}</span>
                      <div>
                        <h3 className="font-black text-stone-900 text-sm leading-snug font-serif">
                          {item.citizenName} <span className="text-xs font-normal text-stone-500 font-sans">[{item.role}]</span>
                        </h3>
                        <span className="text-[10px] text-stone-400 font-mono">地点：{item.location}</span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-800 mt-1 leading-relaxed bg-[#fdfbf7] p-2 rounded-xl border border-stone-100 italic">
                      “{item.complaintText}”
                    </p>
                  </article>
                ))
              ) : (
                headlines.map((item, idx) => (
                  <article
                    key={item.id || idx}
                    className="p-3 rounded-2xl border border-stone-200 bg-white/80 text-xs"
                  >
                    <h3 className="font-bold text-stone-900 font-serif">{item.title}</h3>
                    <p className="text-stone-700 mt-1">{item.content}</p>
                  </article>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-stone-200 flex justify-between items-center text-xs text-stone-500 font-sans">
              <span className="italic">晨曦每日邮报 · 读者维权部</span>
              <div className="flex items-center gap-2">
                {onOpenSettlement && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenSettlement();
                    }}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-1"
                  >
                    <span>🪺 查看汇总特刊</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 bg-stone-800 hover:bg-stone-900 active:scale-95 text-white font-bold rounded-xl transition-all shadow-sm"
                >
                  关闭邮箱
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
