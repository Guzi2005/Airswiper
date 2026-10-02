import React from 'react';
import { X, Sparkles, Navigation, ShieldAlert, Award } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 md:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👑</span>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-stone-800">
                《闪光怪盗》Airswiper · 新手行动手册
              </h2>
              <p className="text-xs text-stone-500">
                掌握下凸抛物线俯冲与空中气球打包的物理艺术
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="flex flex-col gap-3.5 text-xs text-stone-600 leading-relaxed">
          {/* Section 1 */}
          <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/60 flex items-start gap-3">
            <Navigation className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-stone-800 text-sm mb-1">
                1. 箱庭有限地图 & 双向惯性弹射
              </h3>
              <p>
                小镇是一座风景如画的<strong>箱庭有限地图</strong>（西城门至东码头）。
                玩家向左向右拉弓皆可！拉弓弹射赋予水平惯性，乌鸦会朝着惯性方向<strong>双向巡航滑翔</strong>。
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="p-3.5 bg-stone-100 rounded-2xl border border-stone-300 flex items-start gap-3">
            <span className="text-xl">💩</span>
            <div>
              <h3 className="font-extrabold text-stone-800 text-sm mb-1">
                2. 真实街道鸟屎物理 & 黑白对比捣蛋
              </h3>
              <p>
                • <strong>低于屋檐低空抛掷</strong>：鸟屎穿过街道空间自由下落，<strong>绝不会悬空贴在垂直墙上</strong>，而是精准砸向<strong>行人头顶、淑女遮阳伞、咖啡馆露天遮阳伞、商铺雨棚、复古汽车、街灯、喷泉与石板路</strong>！<br />
                • <strong>黑白对比捣蛋高分</strong>：白屎[P]落在深色大衣或深蓝车顶，黑屎[O]落在浅色长裙、奶黄车顶或浅色石板，触发<strong>🌟+150 强烈对比加分</strong>！
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/60 flex items-start gap-3">
            <span className="text-xl">🐾</span>
            <div>
              <h3 className="font-extrabold text-stone-800 text-sm mb-1">
                3. 多地形站定与歇脚 [L 键]
              </h3>
              <p>
                随时按下<strong>【L 键】</strong>，乌鸦将智能吸附停歇在<strong>屋顶瓦脊、路人头顶、汽车车顶、铸铁街灯顶、长椅或地面</strong>！再次按【L 键】或拉弓即可起飞。
              </p>
            </div>
          </div>

          {/* Section 4 */}
          <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200/60 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-stone-800 text-sm mb-1">
                4. 气球放飞打包 & 真实生活拾宝
              </h3>
              <p>
                从<strong>露天咖啡桌顺走纯银茶匙、从面包房叼走热羊角包、从喷泉沿捡起铜钥匙或老花镜</strong>！
                点击<strong>【🎈 气球放飞】（空格键）</strong>，一串彩色气球将挂住赃物包裹冉冉升空落袋，乌鸦重新恢复轻盈！
              </p>
            </div>
          </div>

          {/* Section 5 */}
          <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200/60 flex items-start gap-3">
            <Award className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-stone-800 text-sm mb-1">
                5. 丰富关卡任务目标
              </h3>
              <p>
                • <strong>信鸽急件快送</strong>：嘴叼信件穿越小镇，在皇家邮筒旁按<strong>【D 键】</strong>投递！<br />
                • <strong>怪盗闪光敛财</strong>：收集 5 件以上闪光宝物并放飞打包！<br />
                • <strong>小镇捣蛋大暴走</strong>：拉屎轰炸与偷窃制造 650 点小镇混乱度！
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-stone-100">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 active:scale-95 rounded-2xl shadow-sm transition-all"
          >
            我明白了，开始掠夺！
          </button>
        </div>
      </div>
    </div>
  );
};
